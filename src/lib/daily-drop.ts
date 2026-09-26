import "server-only";

import { puzzles } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createPublicSupabaseClient,
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { findCase, SPORT_NAME } from "@/lib/case-files";
import { sanitizeClues } from "@/lib/clue-sanitation";
import { SPORT_LABEL, type Clue, type Puzzle, type Sport } from "@/lib/types";
import { hashString } from "@/lib/utils";

export interface PublicDaily {
  id: string;
  date_key: string;
  category: string;
  clues: string[];
  options: string[];
  sportId?: string;
  sportName?: string;
}

export interface ArchivePayload {
  challenge: PublicDaily;
  isArchive: true;
  mode: "archive";
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
  const file = findCase(fixture.id);
  return {
    id: fixture.id,
    date_key: fixture.date_key,
    category: fixture.category,
    clues: sanitizeClues(fixture.clues, {
      title: file?.title || fixture.category,
      year: file?.year || fixture.year,
    }),
    options: fixture.options,
  };
}

const MATCH_KEY = /^[a-z0-9-]{1,80}$/i;

const ARCHIVE_EXTRAS: Record<string, SecretDaily> = {
  "summit-series-1972": {
    id: "summit-series-1972",
    date_key: "1972-09-28",
    category: "Summit Series Decider",
    clues: [
      "A series billed as an exhibition has come down to a single night.",
      "The rink is in a capital city. Eight games were scheduled. This is the last one.",
      "One side crossed an ocean. The other wears red and has not lost this building.",
      "The clock is inside the final minute. A goal now wins the series, not just the night.",
      "The scorer is a left winger who had already rescued an earlier game in this city.",
      "September 1972. The series that opened a door between two hockey worlds. Game 8.",
    ],
    options: ["Canada vs Soviet Union (1972)"],
    subject: "Canada vs Soviet Union (1972)",
    year: 1972,
  },
  "wimbledon-epic-1980": {
    id: "wimbledon-epic-1980",
    date_key: "1980-07-05",
    category: "Wimbledon Gentlemen's Final",
    clues: [
      "Grass, late afternoon, and a tiebreak that refuses to end.",
      "One player is ice. The other is fire. The crowd is standing for a single set.",
      "The third-set board keeps climbing past what a tiebreak is supposed to be.",
      "Eighteen points to sixteen. The championship hangs on one service game after another.",
      "The champion is chasing a fifth straight title on this lawn.",
      "Centre Court, 1980. The gentlemen's final that rewrote the tiebreak.",
    ],
    options: ["Björn Borg vs John McEnroe (1980)"],
    subject: "Björn Borg vs John McEnroe (1980)",
    year: 1980,
  },
};

export function isMatchKey(value: string): boolean {
  return MATCH_KEY.test(value);
}

export async function loadArchiveMatch(matchParam: string): Promise<SecretDaily | null> {
  if (!isMatchKey(matchParam)) return null;
  const fromDb = await loadMatchRow(matchParam);
  const base = fromDb ?? fromCatalogMatch(matchParam) ?? ARCHIVE_EXTRAS[matchParam] ?? null;
  if (!base) return null;

  const decoys = await decoyLabels(base);
  const correct =
    base.options.find((option) => gradeOption(base, option)) ?? `${base.subject} (${base.year})`;
  const file = findCase(matchParam);
  return {
    ...base,
    id: matchParam,
    category: file?.context || base.category,
    options: fourDistinctOptions(base.options, correct, decoys),
  };
}

export async function loadPublicArchive(matchParam: string): Promise<ArchivePayload | null> {
  const fixture = await loadArchiveMatch(matchParam);
  if (!fixture) return null;
  const file = findCase(matchParam);
  return {
    challenge: {
      ...toPublicDaily(fixture),
      sportId: file?.sport ?? "",
      sportName: file ? SPORT_NAME[file.sport] : fixture.category,
    },
    isArchive: true,
    mode: "archive",
  };
}

async function loadMatchRow(matchParam: string): Promise<SecretDaily | null> {
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client) return null;
  for (const table of ["challenges", "puzzles"] as const) {
    try {
      const { data, error } = await client
        .from(table)
        .select("*")
        .or(`slug.eq.${matchParam},id.eq.${matchParam}`)
        .limit(1)
        .maybeSingle();
      if (error || !data) continue;
      const normalized = normalizeRow(data, stringField(data, "date_key") || `${numberField(data, "year") || 1970}-01-01`);
      if (normalized) return normalized;
    } catch {
      continue;
    }
  }
  return null;
}

function fromCatalogMatch(matchParam: string): SecretDaily | null {
  const file = findCase(matchParam);
  const ids = new Set([matchParam, ...(file?.ids ?? [])]);
  const puzzle = puzzles.find((item) => ids.has(item.id));
  if (!puzzle) return null;
  return secretFromPuzzle(puzzle, matchParam, file?.context);
}

function secretFromPuzzle(puzzle: Puzzle, id: string, context?: string): SecretDaily | null {
  const clues = puzzle.clues.slice(0, 6).map(clueLine);
  if (clues.length === 0) return null;
  return {
    id,
    date_key: `${puzzle.year}-01-01`,
    category: context || SPORT_LABEL[puzzle.sport] || "Sports History",
    clues,
    options: [puzzle.title],
    subject: puzzle.title,
    year: puzzle.year,
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
