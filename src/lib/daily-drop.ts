import "server-only";

import { puzzles } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createPublicSupabaseClient,
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { SPORT_LABEL, type Clue, type Sport } from "@/lib/types";
import { hashString } from "@/lib/utils";

export interface PublicDaily {
  id: string;
  date_key: string;
  category: string;
  clues: string[];
  options: string[];
}

interface SecretDaily extends PublicDaily {
  subject: string;
  year: number;
}

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function utcTodayKey(now = new Date()): string {
  return now.toISOString().split("T")[0];
}

export function parseDateKey(value: string | null, now = new Date()): string | null {
  if (!value) return utcTodayKey(now);
  return DATE_KEY.test(value) ? value : null;
}

export function toPublicDaily(fixture: SecretDaily): PublicDaily {
  return {
    id: fixture.id,
    date_key: fixture.date_key,
    category: fixture.category,
    clues: fixture.clues,
    options: fixture.options,
  };
}

export async function viewerCanOpenArchive(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    return Boolean(data.user);
  } catch {
    return false;
  }
}

const OLYMPIC_DECOYS = [
  "1896 Athens: First Modern Olympiad (1896)",
  "1936 Berlin Olympics (1936)",
  "1968 Mexico City: Black Power Salute (1968)",
  "1988 Seoul Olympics (1988)",
];

const GENERAL_DECOYS = [
  "1980 Lake Placid: USA vs Soviet Union",
  "1992 Barcelona: USA Dream Team vs Croatia",
  "1994 Lillehammer: Sweden vs Canada",
  "1974 Munich: West Germany vs Netherlands",
];

export function fourDistinctOptions(rawOptions: string[], correct: string, decoys: string[]): string[] {
  const clean = Array.from(new Set([correct, ...rawOptions].map((option) => option.trim()).filter(Boolean)));
  for (const decoy of decoys) {
    if (clean.length >= 4) break;
    if (!clean.includes(decoy)) clean.push(decoy);
  }
  const picked = [clean[0], ...clean.slice(1)].slice(0, 4);
  return shuffle(picked);
}

export async function loadDailyFixture(dateKey: string): Promise<SecretDaily> {
  const fromChallenges = await loadFromTable("challenges", dateKey);
  const fixture = fromChallenges ?? (await loadFromTable("puzzles", dateKey)) ?? fromCatalog(dateKey);
  const decoys = await decoyLabels(fixture);
  const correct =
    fixture.options.find((option) => gradeOption(fixture, option)) ??
    `${fixture.subject} (${fixture.year})`;
  return {
    ...fixture,
    options: fourDistinctOptions(fixture.options, correct, decoys),
  };
}

export function gradeOption(fixture: SecretDaily, option: string): boolean {
  const guess = option.trim().toLowerCase();
  const subject = fixture.subject.trim().toLowerCase();
  if (!guess || !subject) return false;
  if (guess === subject) return true;
  if (guess === `${subject} (${fixture.year})`) return true;
  return guess.includes(subject) && guess.includes(String(fixture.year));
}

function fromCatalog(dateKey: string): SecretDaily {
  const puzzle = puzzles[hashString(dateKey) % puzzles.length];
  const decoys = puzzles
    .filter((item) => item.id !== puzzle.id)
    .slice(0, 3)
    .map((item) => item.title);
  return {
    id: puzzle.id,
    date_key: dateKey,
    category: SPORT_LABEL[puzzle.sport] ?? puzzle.sport,
    clues: puzzle.clues.slice(0, 6).map(clueLine),
    options: [puzzle.title, ...decoys],
    subject: puzzle.title,
    year: puzzle.year,
  };
}

function clueLine(clue: Clue): string {
  if (clue.body) return clue.body;
  if (clue.quote) return clue.quote;
  if (clue.stats?.length) {
    return clue.stats.map((stat) => `${stat.label}: ${stat.value}`).join(" · ");
  }
  return clue.kicker ?? "A detail from the archive.";
}

function shuffle(items: string[]): string[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

async function decoyLabels(fixture: SecretDaily): Promise<string[]> {
  const themed = /olympic/i.test(fixture.category) ? OLYMPIC_DECOYS : GENERAL_DECOYS;
  const fromArchive = await challengeDecoys(fixture);
  const fromCatalog = puzzles
    .filter((puzzle) => puzzle.title !== fixture.subject)
    .map((puzzle) => puzzle.title);
  return [...fromArchive, ...fromCatalog, ...themed, ...GENERAL_DECOYS];
}

async function challengeDecoys(fixture: SecretDaily): Promise<string[]> {
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client) return [];
  try {
    const { data, error } = await client.from("challenges").select("subject, year, category").limit(8);
    if (error || !data?.length) return [];
    const sameCategory = data.filter((row) => {
      const category = stringField(row, "category");
      return category && category.toLowerCase() === fixture.category.toLowerCase();
    });
    const pool = (sameCategory.length >= 3 ? sameCategory : data).slice(0, 5);
    return pool
      .map((row) => {
        const subject = stringField(row, "subject");
        const year = numberField(row, "year");
        return subject && year ? `${subject} (${year})` : "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function loadFromTable(
  table: "challenges" | "puzzles",
  dateKey: string,
): Promise<SecretDaily | null> {
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client) return null;

  try {
    const matched = await client
      .from(table)
      .select("*")
      .eq("date_key", dateKey)
      .limit(1)
      .maybeSingle();

    if (!matched.error && matched.data) {
      return normalizeRow(matched.data, dateKey);
    }

    const all = await client.from(table).select("*");
    if (all.error || !all.data?.length) return null;
    const row = all.data[hashString(dateKey) % all.data.length];
    return normalizeRow(row, dateKey);
  } catch {
    return null;
  }
}

function normalizeRow(row: Record<string, unknown>, dateKey: string): SecretDaily | null {
  const subject = stringField(row, "subject") || stringField(row, "title") || stringField(row, "target_subject");
  const year = numberField(row, "year") || numberField(row, "target_year");
  const clues = stringList(row.clues);
  if (!subject || !year || clues.length === 0) return null;

  const category =
    stringField(row, "category") ||
    SPORT_LABEL[stringField(row, "sport") as Sport] ||
    "Sports History";
  const provided = stringList(row.options);
  const correct = provided.find((option) =>
    gradeOption({ subject, year, id: "", date_key: dateKey, category, clues, options: [] }, option),
  );
  const options = provided.length > 0 ? provided : [`${subject} (${year})`];

  return {
    id: stringField(row, "id") || stringField(row, "slug") || `${dateKey}`,
    date_key: dateKey,
    category,
    clues: clues.slice(0, 6),
    options: correct ? options : [`${subject} (${year})`, ...options],
    subject,
    year,
  };
}

function stringField(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function numberField(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") return clueLine(item as Clue);
      return "";
    })
    .filter((item) => item.length > 0);
}
