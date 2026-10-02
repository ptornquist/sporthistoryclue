import "server-only";

import { findCase } from "@/lib/case-files";
import { allMatchupLabels, solvedMatchup } from "@/lib/case-solutions";
import { puzzles } from "@/lib/catalog";
import {
  fetchDailyChallengeRow,
  readStoredChallenge,
  resolveGuessOptions,
  type ChallengeRow,
  type DailyChallengeClient,
} from "@/lib/daily-challenge-query";
import { distinctOptionValues } from "@/lib/option-text";
import { resolveTacticalClueList } from "@/lib/tactical-clues";
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
  return shuffle(distinctOptionValues([correct, ...rawOptions, ...decoys], 4));
}

export async function loadDailyFixture(dateKey: string): Promise<SecretDaily> {
  const fromChallenges = await loadFromTable("challenges", dateKey);
  const fixture = fromChallenges ?? (await loadFromTable("puzzles", dateKey)) ?? fromCatalog(dateKey);
  return withDistinctOptions(fixture);
}

const CASE_SPORT_LABEL: Record<string, string> = {
  ice_hockey: "Ice Hockey",
  football: "Football",
  boxing: "Boxing",
  tennis: "Tennis",
  athletics: "Athletics",
  gymnastics: "Gymnastics",
  basketball: "Basketball",
};

export async function loadMatchFixture(matchId: string, now = new Date()): Promise<SecretDaily | null> {
  const trimmed = matchId.trim();
  if (!trimmed || trimmed.length > 80) return null;

  const file = findCase(trimmed);
  const ids = file?.ids ?? [trimmed];
  const dateKey = utcTodayKey(now);
  const puzzle = puzzles.find((item) => ids.includes(item.id));
  const matchup = ids.map((id) => solvedMatchup(id)).find((label): label is string => Boolean(label));
  const year = puzzle?.year ?? file?.year ?? 0;
  const parsed = matchup ? subjectFromMatchup(matchup, year) : null;
  const subject = parsed?.subject || puzzle?.title || "";
  const resolvedYear = parsed?.year || year;

  let clues: string[] = [];
  for (const table of ["challenges", "puzzles"] as const) {
    const row = await loadRowByIds(table, ids);
    const tactical = resolveTacticalClueList(row?.tactical_clues);
    if (tactical.some(Boolean)) {
      clues = tactical;
      break;
    }
  }
  if (!clues.some(Boolean) && puzzle) clues = resolveTacticalClueList(puzzle.clues);
  if (!clues.some(Boolean)) {
    for (const table of ["challenges", "puzzles"] as const) {
      const row = await loadRowByIds(table, ids);
      if (!row) continue;
      const normalized = normalizeRow({ ...row, id: trimmed }, dateKey);
      if (normalized?.clues.some(Boolean)) {
        clues = normalized.clues;
        break;
      }
    }
  }
  if (!clues.some(Boolean) && file) clues = caseLadder(file);
  if (!subject || !resolvedYear || clues.filter(Boolean).length === 0) return null;

  const category = file
    ? CASE_SPORT_LABEL[file.sport] ?? "Sports History"
    : puzzle
      ? SPORT_LABEL[puzzle.sport] ?? puzzle.sport
      : "Sports History";

  return withDistinctOptions({
    id: trimmed,
    date_key: dateKey,
    category,
    clues,
    options: matchup ? [matchup] : [`${subject} (${resolvedYear})`],
    subject,
    year: resolvedYear,
  });
}

function subjectFromMatchup(label: string, fallbackYear: number): { subject: string; year: number } {
  const matched = label.match(/^(.*?)\s*\(((?:18|19|20)\d{2})\)\s*$/);
  if (!matched) return { subject: label.trim(), year: fallbackYear };
  return { subject: matched[1].trim(), year: Number(matched[2]) };
}

function caseLadder(file: { context: string; year: number }): string[] {
  return [
    `${file.context}. The venue card is the first one in this file.`,
    `${file.year} belongs to a longer stretch of the sport.`,
    "Names and numbers stay off this card.",
    `A cropped photograph from the ${file.context.toLowerCase()}.`,
    "The decisive call is the last card in this file.",
  ];
}

async function withDistinctOptions(fixture: SecretDaily): Promise<SecretDaily> {
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
    clues: resolveTacticalClueList(puzzle.clues),
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
  return [...allMatchupLabels(), ...fromArchive, ...fromCatalog, ...themed, ...GENERAL_DECOYS];
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
  const tactical = resolveTacticalClueList(row.tactical_clues);
  const clues = tactical.some(Boolean) ? tactical : resolveTacticalClueList(row.clues);
  if (!subject || !year || !clues.some(Boolean)) return null;

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
    clues,
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

async function loadRowByIds(
  table: "challenges" | "puzzles",
  ids: string[],
): Promise<Record<string, unknown> | null> {
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client || ids.length === 0) return null;
  try {
    const byId = await client.from(table).select("*").in("id", ids).limit(1).maybeSingle();
    if (!byId.error && byId.data) return byId.data;
    const bySlug = await client.from(table).select("*").in("slug", ids).limit(1).maybeSingle();
    if (!bySlug.error && bySlug.data) return bySlug.data;
    return null;
  } catch {
    return null;
  }
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

const MATCH_KEY = /^[a-z0-9-]{1,80}$/i;

export function isMatchKey(id: string): boolean {
  return MATCH_KEY.test(id.trim());
}

function challengeClient(): DailyChallengeClient | null {
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  return client ? (client as unknown as DailyChallengeClient) : null;
}

function publicFromChallengeRow(row: ChallengeRow, dateKey: string): PublicDaily | null {
  const stored = readStoredChallenge(row);
  const subject = stringField(row, "subject") || stringField(row, "title") || stored.title;
  const year = numberField(row, "year") || numberField(row, "target_year");
  const category = stringField(row, "category") || stringField(row, "sport") || "Sports History";
  const generated = subject && year ? [`${subject} (${year})`] : [];
  const fixture = {
    id: stringField(row, "id") || stringField(row, "slug") || dateKey,
    date_key: stringField(row, "date_key") || stringField(row, "fixture_date") || dateKey,
    category,
    clues: stored.clues,
    options: stored.options,
    optionsLocked: row.options_locked === true || stored.options.length > 0,
  };
  if (!fixture.clues.some(Boolean) && fixture.options.length === 0 && !subject) return null;
  let options = resolveGuessOptions(fixture.options, generated, false);
  if (fixture.optionsLocked && fixture.options.length > 0) {
    options = resolveGuessOptions(fixture.options, generated, true);
  }
  return {
    id: fixture.id,
    date_key: fixture.date_key,
    category: fixture.category,
    clues: fixture.clues.length > 0 ? fixture.clues : ["A detail from the archive."],
    options: options.length > 0 ? options : generated,
  };
}

export async function loadDatedPublicDrop(dateKey: string): Promise<PublicDaily | null> {
  const client = challengeClient();
  if (client) {
    try {
      const row = await fetchDailyChallengeRow(client, dateKey, {
        allowLatestFallback: dateKey === utcTodayKey(),
      });
      if (row) {
        const fixture = publicFromChallengeRow(row, dateKey);
        if (fixture?.clues.some(Boolean)) return fixture;
      }
    } catch {
      // Catalog fixtures still open the arena when the challenges table is unreachable.
    }
  }
  try {
    return toPublicDaily(await loadDailyFixture(dateKey));
  } catch {
    return null;
  }
}

export async function loadTodayPublicDrop(now = new Date()): Promise<PublicDaily | null> {
  return loadDatedPublicDrop(utcTodayKey(now));
}

export async function loadPublicChallengeById(id: string): Promise<PublicDaily | null> {
  const trimmed = id.trim();
  if (!isMatchKey(trimmed)) return null;
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (client) {
    try {
      const { data, error } = await client.from("challenges").select("*").eq("id", trimmed).maybeSingle();
      if (!error && data) {
        const fixture = publicFromChallengeRow(data, utcTodayKey());
        if (fixture) return fixture;
      }
    } catch {
      // Fall through to the local case file.
    }
  }
  const match = await loadMatchFixture(trimmed);
  return match ? toPublicDaily(match) : null;
}

export async function loadPublicArchive(matchId: string): Promise<{
  challenge: PublicDaily & { optionsLocked: boolean };
  optionSource: {
    id: string;
    subject: string;
    year: number;
    category: string;
    sport: string | null;
  };
} | null> {
  const fixture = await loadMatchFixture(matchId);
  if (!fixture) return null;
  const file = findCase(matchId);
  return {
    challenge: {
      ...toPublicDaily(fixture),
      optionsLocked: false,
    },
    optionSource: {
      id: fixture.id,
      subject: fixture.subject,
      year: fixture.year,
      category: fixture.category,
      sport: file?.sport ?? null,
    },
  };
}

export async function loadChallengeImage(id: string): Promise<string | null> {
  const trimmed = id.trim();
  if (!isMatchKey(trimmed)) return null;
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client) return null;
  try {
    const { data, error } = await client.from("challenges").select("*").eq("id", trimmed).maybeSingle();
    if (error || !data) return null;
    const image = readStoredChallenge(data).imageUrl;
    return image || null;
  } catch {
    return null;
  }
}
