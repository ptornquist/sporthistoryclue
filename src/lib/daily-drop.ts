import "server-only";

import { puzzles } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createPublicSupabaseClient,
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { findCase, SPORT_NAME } from "@/lib/case-files";
import { arrangeClueLadder } from "@/lib/clue-ladder";
import { isRejectedClue, sanitizeClues } from "@/lib/clue-sanitation";
import {
  canonicalSport,
  isUnrelatedEra,
  optionMatchesChallenge,
  selectChallengeOptions,
  sportSearchTokens,
  type DecoyChallenge,
  type DecoyPeer,
} from "@/lib/decoy-options";
import { SPORT_LABEL, type Clue, type Puzzle, type Sport } from "@/lib/types";
import {
  fetchDailyChallengeRow,
  pickDeterministicChallenge,
  readStoredChallenge,
  resolveGuessOptions,
} from "@/lib/daily-challenge-query";
import { fetchArchiveFixtures, type ArchiveFixture } from "@/lib/archive-vault";
import { hashString } from "@/lib/utils";

export interface PublicDaily {
  id: string;
  date_key: string;
  category: string;
  title?: string;
  clues: string[];
  options: string[];
  optionsLocked?: boolean;
  sportId?: string;
  sportName?: string;
}

export interface ArchivePayload {
  challenge: PublicDaily;
  isArchive: true;
  mode: "archive";
  optionSource: DecoyChallenge;
}

interface SecretDaily extends PublicDaily {
  subject: string;
  year: number;
  decoys?: string[];
  optionSource?: DecoyChallenge;
  correctOption?: string;
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
  const locked = fixture.optionsLocked === true && fixture.options.length > 0;
  const file = locked ? undefined : findCase(fixture.id);
  const category = locked ? fixture.title || fixture.category : fixture.category;
  return {
    id: fixture.id,
    date_key: fixture.date_key,
    category,
    title: fixture.title,
    clues: locked
      ? authoredClues(fixture.clues)
      : arrangeClueLadder(
          sanitizeClues(fixture.clues, {
            title: file?.title || fixture.category,
            year: file?.year || fixture.year,
          }),
          { category: file?.context || fixture.category },
        ),
    options: fixture.options,
    optionsLocked: locked,
  };
}

function authoredClues(clues: readonly string[]): string[] {
  return clues.map((clue) => clue.trim()).filter((clue) => !isRejectedClue(clue)).slice(0, 6);
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
  "thrilla-in-manila-1975": {
    id: "thrilla-in-manila-1975",
    date_key: "1975-10-01",
    category: "Heavyweight Title Fight",
    clues: [
      "A third fight, and the heat is the first opponent.",
      "The champion and the former champion have already split two wars.",
      "The ring is outdoors. The start waits until the evening cools.",
      "Round after round, neither man gives the referee an easy night.",
      "The fourteenth round ends it. One man stays on his stool.",
      "1975. The rubber match of the heavyweight trilogy, fought in brutal humidity.",
    ],
    options: ["Muhammad Ali vs Joe Frazier (1975)"],
    subject: "Muhammad Ali vs Joe Frazier (1975)",
    year: 1975,
  },
  "world-cup-final-1994": {
    id: "world-cup-final-1994",
    date_key: "1994-07-17",
    category: "World Cup Final",
    clues: [
      "A final that will not be settled in open play.",
      "The bowl was built for another sport, on the edge of a film city.",
      "Extra time changes nothing. The championship moves to twelve yards.",
      "One side wears yellow. The other wears blue. Both have won this tournament before.",
      "The last kick sails over the bar. A captain covers his face.",
      "1994. A World Cup final decided entirely from the penalty spot.",
    ],
    options: ["Brazil vs Italy (1994)"],
    subject: "Brazil vs Italy (1994)",
    year: 1994,
  },
  "wimbledon-final-2008": {
    id: "wimbledon-final-2008",
    date_key: "2008-07-06",
    category: "Wimbledon Gentlemen's Final",
    clues: [
      "The light is going. The final has already outlasted the afternoon.",
      "Grass, two baseline grinders, and two rain delays.",
      "One man is chasing a sixth title here. The other has never won this lawn.",
      "The fifth set starts with the evening already on the court.",
      "The match is measured in hours. The fifth set finishes 9–7.",
      "Centre Court, 2008. The gentlemen's final that ended in the dusk.",
    ],
    options: ["Rafael Nadal vs Roger Federer (2008)"],
    subject: "Rafael Nadal vs Roger Federer (2008)",
    year: 2008,
  },
  "seoul-100m-1988": {
    id: "seoul-100m-1988",
    date_key: "1988-09-24",
    category: "Olympic 100m Final",
    clues: [
      "The fastest final of the Games does not survive the night.",
      "A still track, eight lanes, and a time that flashes as a world record.",
      "The winner raises a finger. The sample is already on its way to the lab.",
      "A banned substance. The gold is stripped before the season is over.",
      "The man who finished second is declared the champion.",
      "1988. The Olympic 100m final that became a scandal.",
    ],
    options: ["Ben Johnson (1988)"],
    subject: "Ben Johnson (1988)",
    year: 1988,
  },
};

export function isMatchKey(value: string): boolean {
  return MATCH_KEY.test(value);
}

export async function loadChallengeImage(id: string): Promise<string | null> {
  if (!isMatchKey(id)) return null;
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client) return null;
  for (const table of ["challenges", "puzzles"] as const) {
    try {
      const { data, error } = await client
        .from(table)
        .select("image_url")
        .or(`slug.eq.${id},id.eq.${id}`)
        .limit(1)
        .maybeSingle();
      if (error || !data) continue;
      const url = stringField(data, "image_url");
      if (url.startsWith("https://")) return url;
    } catch {
      continue;
    }
  }
  return null;
}

export async function loadArchiveMatch(matchParam: string): Promise<SecretDaily | null> {
  if (!isMatchKey(matchParam)) return null;
  const fromDb = await loadMatchRow(matchParam);
  const base = fromDb ?? fromCatalogMatch(matchParam) ?? ARCHIVE_EXTRAS[matchParam] ?? null;
  if (!base) return null;

  const file = findCase(matchParam);
  const shaped: SecretDaily = {
    ...base,
    id: matchParam,
    category: file?.context || base.category,
  };
  if (shaped.optionsLocked && shaped.options.length > 0) {
    return { ...shaped, options: resolveGuessOptions(shaped.options, [], true) };
  }
  const optionSource = await buildDecoySource(shaped);
  return {
    ...shaped,
    optionSource,
    options: resolveGuessOptions(shaped.options, selectChallengeOptions(optionSource), false),
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
    optionSource: fixture.optionSource ?? {
      subject: fixture.subject,
      year: fixture.year,
      category: fixture.category,
      sport: file?.sport,
      decoys: fixture.decoys,
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

export async function loadArchiveIndex(now = new Date()): Promise<ArchiveFixture[]> {
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client) return [];
  try {
    return await fetchArchiveFixtures(
      client as unknown as Parameters<typeof fetchArchiveFixtures>[0],
      utcTodayKey(now),
    );
  } catch (error) {
    console.error("Supabase query error:", error);
    return [];
  }
}

export async function loadPublicChallengeById(id: string): Promise<PublicDaily | null> {
  const fixture = await loadArchiveMatch(id);
  if (!fixture) return null;
  return withSport(fixture);
}

export async function loadDatedPublicDrop(dateKey: string, now = new Date()): Promise<PublicDaily | null> {
  if (!DATE_KEY.test(dateKey) || dateKey > utcTodayKey(now)) return null;
  return withSport(await loadDailyFixture(dateKey));
}

function withSport(fixture: SecretDaily): PublicDaily {
  const file = findCase(fixture.id);
  return {
    ...toPublicDaily(fixture),
    sportId: file?.sport,
    sportName: file ? SPORT_NAME[file.sport] : fixture.category,
  };
}

export async function loadTodayPublicDrop(now = new Date()): Promise<PublicDaily> {
  const today = now.toISOString().split("T")[0];
  return withSport(await loadDailyFixture(today, { allowLatestFallback: true }));
}

export async function loadDailyFixture(
  dateKey: string,
  options?: { allowLatestFallback?: boolean },
): Promise<SecretDaily> {
  const fromChallenges = await loadFromTable("challenges", dateKey, options?.allowLatestFallback === true);
  const fixture = fromChallenges ?? (await loadFromTable("puzzles", dateKey)) ?? fromCatalog(dateKey);
  if (fixture.optionsLocked && fixture.options.length > 0) {
    return { ...fixture, options: resolveGuessOptions(fixture.options, [], true) };
  }
  const optionSource = await buildDecoySource(fixture);
  return {
    ...fixture,
    optionSource,
    options: resolveGuessOptions(fixture.options, selectChallengeOptions(optionSource), false),
  };
}

export function gradeOption(fixture: SecretDaily, option: string): boolean {
  const guess = option.trim().toLowerCase();
  if (fixture.correctOption && guess === fixture.correctOption.trim().toLowerCase()) return true;
  return optionMatchesChallenge(option, {
    subject: fixture.subject,
    year: fixture.year,
    category: fixture.category,
    sport: findCase(fixture.id)?.sport,
  });
}

function fromCatalog(dateKey: string): SecretDaily {
  const puzzle = puzzles[hashString(dateKey) % puzzles.length];
  return {
    id: puzzle.id,
    date_key: dateKey,
    category: SPORT_LABEL[puzzle.sport] ?? puzzle.sport,
    clues: puzzle.clues.slice(0, 6).map(clueLine),
    options: [puzzle.title],
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

async function buildDecoySource(fixture: SecretDaily): Promise<DecoyChallenge> {
  const sport = findCase(fixture.id)?.sport || fixture.category;
  return {
    id: fixture.id,
    subject: fixture.subject,
    year: fixture.year,
    category: fixture.category,
    sport,
    decoys: fixture.decoys,
    peers: await sameSportPeers(fixture, canonicalSport(sport)),
  };
}

async function sameSportPeers(fixture: SecretDaily, sport: string): Promise<DecoyPeer[]> {
  const catalogPeers = puzzles
    .filter((puzzle) => canonicalSport(puzzle.sport) === sport)
    .filter((puzzle) => puzzle.id !== fixture.id && puzzle.title.trim().toLowerCase() !== fixture.subject.trim().toLowerCase())
    .filter((puzzle) => !isUnrelatedEra(fixture.year, puzzle.year))
    .filter((puzzle) => /\bvs\.?\b/i.test(puzzle.title))
    .map((puzzle) => ({
      subject: puzzle.title,
      year: puzzle.year,
      category: SPORT_LABEL[puzzle.sport] ?? puzzle.sport,
      sport: puzzle.sport,
    }));

  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  const sportFilter = sportSearchTokens(sport)
    .flatMap((token) => [`sport.ilike.%${token}%`, `category.ilike.%${token}%`])
    .join(",");
  if (!client || !sportFilter) return catalogPeers;
  try {
    const { data, error } = await client
      .from("challenges")
      .select("subject, title, year, category, sport, id, slug")
      .or(sportFilter)
      .limit(80);
    if (error || !data?.length) return catalogPeers;
    const rows = data.flatMap((row) => {
      const subject = stringField(row, "subject") || stringField(row, "title");
      const year = numberField(row, "year");
      const category = stringField(row, "category");
      const rowSport = stringField(row, "sport") || category;
      const id = stringField(row, "slug") || stringField(row, "id");
      if (!subject || !year) return [];
      if (id === fixture.id || subject.toLowerCase() === fixture.subject.toLowerCase()) return [];
      if (canonicalSport(rowSport) !== sport && canonicalSport(category) !== sport) return [];
      if (isUnrelatedEra(fixture.year, year)) return [];
      return [{ subject, year, category, sport: rowSport }];
    });
    return [...rows, ...catalogPeers];
  } catch {
    return catalogPeers;
  }
}

async function deterministicChallengeRow(
  client: Parameters<typeof fetchDailyChallengeRow>[0],
  dateKey: string,
): Promise<Record<string, unknown> | null> {
  const listClient = client as unknown as {
    from: (table: "challenges") => {
      select: (columns: "*") => {
        order: (
          column: "id",
          options: { ascending: boolean },
        ) => Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>;
      };
    };
  };
  const { data, error } = await listClient.from("challenges").select("*").order("id", { ascending: true });
  if (error) {
    console.error("Supabase query error:", error);
    return null;
  }
  const challenges = [...(data ?? [])].sort((left, right) => String(left.id ?? "").localeCompare(String(right.id ?? "")));
  return pickDeterministicChallenge(challenges, dateKey);
}

async function loadFromTable(
  table: "challenges" | "puzzles",
  dateKey: string,
  allowLatestFallback = false,
): Promise<SecretDaily | null> {
  const client = supabaseAdmin ?? (isSupabaseConfigured ? createPublicSupabaseClient() : null);
  if (!client) return null;

  try {
    if (table === "challenges") {
      const today = new Date().toISOString().split("T")[0];
      const queryClient = client as unknown as Parameters<typeof fetchDailyChallengeRow>[0];
      const row = await fetchDailyChallengeRow(queryClient, dateKey, {
        allowLatestFallback,
      });
      const scheduled = row ? normalizeRow(row, dateKey) : null;
      if (scheduled) return scheduled;
      if (dateKey > today) return null;
      const fallback = await deterministicChallengeRow(queryClient, dateKey);
      return fallback ? normalizeRow(fallback, dateKey) : null;
    }

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
  const stored = readStoredChallenge(row);
  const subject = stringField(row, "subject") || stored.title || stringField(row, "target_subject");
  const year = numberField(row, "year") || numberField(row, "target_year");
  const clues = stored.clues;
  const optionsLocked = stored.options.length > 0;
  if (!subject) return null;
  if (clues.length === 0 && !optionsLocked) return null;
  if (!year && !optionsLocked) return null;

  const category =
    stringField(row, "category") ||
    SPORT_LABEL[stringField(row, "sport") as Sport] ||
    "Sports History";
  const options = optionsLocked ? stored.options : [`${subject} (${year})`];
  const marked = stringField(row, "correct_option") || stringField(row, "answer");
  const correct =
    (marked
      ? options.find((option) => option.trim().toLowerCase() === marked.trim().toLowerCase())
      : undefined) ||
    (year
      ? options.find((option) =>
          optionMatchesChallenge(option, { subject, year, category, sport: stringField(row, "sport") }),
        )
      : options.find((option) => option.trim().toLowerCase() === subject.trim().toLowerCase()));

  return {
    id: stringField(row, "id") || stringField(row, "slug") || `${dateKey}`,
    date_key: dateKey,
    category,
    title: displayTitle(stored.title, subject),
    clues: clues.slice(0, 6),
    options,
    optionsLocked,
    decoys: optionsLocked ? [] : stringList(row.decoys),
    subject,
    year,
    correctOption: correct,
  };
}

function displayTitle(title: string, subject: string): string {
  const label = title.trim();
  const answer = subject.trim().toLowerCase();
  if (!label || label.toLowerCase() === answer) return "";
  if (answer && label.toLowerCase().includes(answer)) return "";
  return label;
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
