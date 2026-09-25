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

export async function loadDailyFixture(dateKey: string): Promise<SecretDaily> {
  const fromChallenges = await loadFromTable("challenges", dateKey);
  if (fromChallenges) return fromChallenges;
  const fromPuzzles = await loadFromTable("puzzles", dateKey);
  if (fromPuzzles) return fromPuzzles;
  return fromCatalog(dateKey);
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
    options: seededOrder([puzzle.title, ...decoys], dateKey),
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

function seededOrder(items: string[], seed: string): string[] {
  return items
    .map((item, index) => ({ item, rank: hashString(`${seed}:${index}:${item}`) }))
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.item);
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
  const options = provided.length > 0 ? seededOrder(provided, dateKey) : seededOrder([`${subject} (${year})`], dateKey);

  return {
    id: stringField(row, "id") || stringField(row, "slug") || `${dateKey}`,
    date_key: dateKey,
    category,
    clues: clues.slice(0, 6),
    options: correct ? options : seededOrder([`${subject} (${year})`, ...options], dateKey).slice(0, 4),
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
