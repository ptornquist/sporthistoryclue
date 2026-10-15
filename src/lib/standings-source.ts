import { STANDINGS_LIMIT, type StandingRow } from "./standings";

export const PROFILE_COLUMNS =
  "id, username, total_score, streak, equipped_title, equipped_frame, matches_solved, avatar_url, favorite_club";
export const PROFILE_COLUMNS_NARROW =
  "id, username, total_score, streak, equipped_title, equipped_frame, matches_solved, avatar_url";
export const PROFILE_COLUMNS_WITH_WEEK = `${PROFILE_COLUMNS}, week_score, week_start`;

export interface ProfileRow {
  id: string;
  username: string | null;
  total_score: number | null;
  streak: number | null;
  equipped_title: string | null;
  equipped_frame: string | null;
  matches_solved: number | null;
  avatar_url: string | null;
  favorite_club?: string | null;
  week_score?: number | null;
  week_start?: string | null;
}

export function mapProfile(row: ProfileRow): StandingRow {
  return {
    id: row.id,
    username: (row.username || "scout").replace(/^@/, ""),
    total_score: row.total_score ?? 0,
    week_score: row.week_score ?? 0,
    week_start: row.week_start ?? null,
    streak: row.streak ?? 0,
    equipped_title: row.equipped_title,
    equipped_frame: row.equipped_frame,
    matches_solved: row.matches_solved ?? 0,
    avatar_url: row.avatar_url,
    favorite_club: row.favorite_club ?? null,
  };
}

interface QueryResult {
  data: unknown[] | null;
  error: { message: string } | null;
}

interface ProfilesQuery {
  select(columns: string): {
    order(column: string, options: { ascending: boolean }): {
      limit(count: number): PromiseLike<QueryResult>;
    };
    eq(column: string, value: string): {
      order(column: string, options: { ascending: boolean }): {
        limit(count: number): PromiseLike<QueryResult>;
      };
    };
  };
}

/** The smallest surface both the browser client and the service-role client share. */
export interface StandingsClient {
  from(table: "profiles"): ProfilesQuery;
}

export interface StandingsSnapshot {
  rows: StandingRow[];
  /** True when week_score and week_start exist, so the weekly tab can rank by them. */
  weekly: boolean;
}

/**
 * Every saved profile, highest total first, plus everyone with points this week.
 * Column fallbacks keep an older schema on a working all-time board.
 */
export async function loadStandingsRows(client: StandingsClient, weekStart: string): Promise<StandingsSnapshot> {
  const wide = await client
    .from("profiles")
    .select(PROFILE_COLUMNS_WITH_WEEK)
    .order("total_score", { ascending: false })
    .limit(STANDINGS_LIMIT);

  const weekly = !wide.error;
  let listed = (wide.data ?? []) as ProfileRow[];
  if (wide.error) {
    const narrow = await client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("total_score", { ascending: false })
      .limit(STANDINGS_LIMIT);
    const retry = narrow.error
      ? await client
          .from("profiles")
          .select(PROFILE_COLUMNS_NARROW)
          .order("total_score", { ascending: false })
          .limit(STANDINGS_LIMIT)
      : narrow;
    listed = (retry.data ?? []) as ProfileRow[];
  }

  const pool = new Map<string, StandingRow>();
  for (const row of listed) pool.set(row.id, mapProfile(row));

  if (weekly) {
    const weekBoard = await client
      .from("profiles")
      .select(PROFILE_COLUMNS_WITH_WEEK)
      .eq("week_start", weekStart)
      .order("week_score", { ascending: false })
      .limit(STANDINGS_LIMIT);
    if (!weekBoard.error) {
      for (const row of (weekBoard.data ?? []) as ProfileRow[]) pool.set(row.id, mapProfile(row));
    }
  }

  return { rows: [...pool.values()], weekly };
}

export function isStandingRow(value: unknown): value is StandingRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.username === "string" && typeof row.total_score === "number";
}
