import { resolveTacticalClueList } from "@/lib/tactical-clues";

export type ChallengeRow = Record<string, unknown>;

type ChallengeFilter = {
  eq: (column: string, value: string) => ChallengeFilter;
  order: (column: string, options: { ascending: boolean }) => ChallengeFilter;
  limit: (count: number) => ChallengeFilter;
  maybeSingle: () => Promise<{ data: ChallengeRow | null; error: { message: string } | null }>;
};

export type DailyChallengeClient = {
  from: (table: "challenges") => {
    select: (columns: "*") => ChallengeFilter;
  };
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [trimmed];
  }
  return [trimmed];
}

function textItem(item: unknown): string {
  if (typeof item === "string") return item.trim();
  if (!item || typeof item !== "object") return "";
  const row = item as Record<string, unknown>;
  return (
    text(row.body) ||
    text(row.text) ||
    text(row.clue) ||
    text(row.label) ||
    text(row.option) ||
    text(row.title) ||
    text(row.quote)
  );
}

export interface StoredChallengeFields {
  title: string;
  clues: string[];
  options: string[];
  imageUrl: string;
}

/** Fields taken straight from a challenges row. `imageUrl` stays server-side. */
export function readStoredChallenge(row: ChallengeRow): StoredChallengeFields {
  const tactical = resolveTacticalClueList(row.tactical_clues);
  const clues = resolveTacticalClueList(row.clues);
  const imageUrl = text(row.image_url);
  return {
    title: text(row.title),
    clues: tactical.length > 0 ? tactical : clues,
    options: asArray(row.options).map(textItem).filter(Boolean),
    imageUrl: imageUrl.startsWith("https://") ? imageUrl : "",
  };
}

/**
 * Stable stand-in when `fixture_date` has no row.
 * `dayNumber` is the calendar day, so the same date always selects the same challenge.
 */
export function pickDeterministicChallenge<T>(challenges: readonly T[], dateKey: string): T | null {
  if (challenges.length === 0) return null;
  const dayNumber = Number(dateKey.slice(8, 10));
  if (!Number.isInteger(dayNumber)) return challenges[0] ?? null;
  return challenges[dayNumber % challenges.length] ?? null;
}

/** Stored guess buttons win. Generated decoys are only used when the row has none. */
export function resolveGuessOptions(
  stored: readonly string[] | null | undefined,
  generated: readonly string[],
  locked: boolean,
): string[] {
  const options = (stored ?? []).map((item) => item.trim()).filter(Boolean);
  if (locked && options.length > 0) return [...options];
  return [...generated];
}

/**
 * Today's row wins. When that date has no challenge, the newest created row is used.
 * `date_key` is checked after `fixture_date` so older drops that only stored `date_key` still resolve.
 */
export async function fetchDailyChallengeRow(
  supabase: DailyChallengeClient,
  today: string,
  options?: { allowLatestFallback?: boolean },
): Promise<ChallengeRow | null> {
  console.log("Fetching fixture for date:", today);

  const dated = await supabase
    .from("challenges")
    .select("*")
    .eq("fixture_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dated.error) {
    console.error("Supabase query error:", dated.error);
  }
  console.log("Active challenge loaded from Supabase:", dated.data);

  if (dated.data) return dated.data;

  const byDateKey = await supabase
    .from("challenges")
    .select("*")
    .eq("date_key", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byDateKey.error) {
    console.error("Supabase query error:", byDateKey.error);
  }
  if (byDateKey.data) return byDateKey.data;

  if (options?.allowLatestFallback === false) return null;

  const latest = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest.error) {
    console.error("Supabase query error:", latest.error);
  }
  if (latest.data) {
    console.log("Active challenge loaded from Supabase:", latest.data);
  }
  return latest.data;
}
