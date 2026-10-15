import { compareByCareer, resolveCareerScore, resolveSolvedCount } from "./career-score";
import { STANDINGS_LIMIT, type StandingRow } from "./standings";

/**
 * A raw profiles row. Different deployments have saved the career total under
 * `total_score` or `career_score`, and the solved count under `matches_solved`
 * or `fixtures_cleared`, so every read selects `*` and resolves the columns here.
 */
export interface ProfileRow {
  id: string;
  username?: string | null;
  display_name?: string | null;
  total_score?: number | string | null;
  career_score?: number | string | null;
  streak?: number | string | null;
  equipped_title?: string | null;
  equipped_frame?: string | null;
  matches_solved?: number | string | null;
  fixtures_cleared?: number | string | null;
  avatar_url?: string | null;
  favorite_club?: string | null;
  week_score?: number | string | null;
  week_start?: string | null;
}

/** Score columns in the order the board prefers them. */
export const SCORE_COLUMNS = ["total_score", "career_score"] as const;
export const SOLVED_COLUMNS = ["matches_solved", "fixtures_cleared"] as const;

function asCount(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
  }
  return null;
}

/**
 * The saved career score. When both columns exist the larger one wins, because
 * a column added later starts at 0 while the older one still holds the points.
 */
export function scoreOf(row: Pick<ProfileRow, "total_score" | "career_score">): number {
  return Math.max(0, ...SCORE_COLUMNS.map((column) => asCount(row[column]) ?? 0));
}

export function solvedOf(row: Pick<ProfileRow, "matches_solved" | "fixtures_cleared">): number {
  return Math.max(0, ...SOLVED_COLUMNS.map((column) => asCount(row[column]) ?? 0));
}

export function mapProfile(row: ProfileRow): StandingRow {
  const handle = (row.username || row.display_name || "scout").toString().replace(/^@/, "").trim() || "scout";
  return {
    id: row.id,
    username: handle,
    total_score: scoreOf(row),
    week_score: asCount(row.week_score) ?? 0,
    week_start: typeof row.week_start === "string" ? row.week_start : null,
    streak: asCount(row.streak) ?? 0,
    equipped_title: row.equipped_title ?? null,
    equipped_frame: row.equipped_frame ?? null,
    matches_solved: solvedOf(row),
    avatar_url: row.avatar_url ?? null,
    favorite_club: row.favorite_club ?? null,
  };
}

/** Highest score first; ties fall back to the handle so the order is stable. */
export function sortByScore(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort(compareByCareer);
}

interface QueryResult {
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
}

interface Ordered {
  limit(count: number): PromiseLike<QueryResult>;
}

interface Selected extends PromiseLike<QueryResult> {
  order(column: string, options: { ascending: boolean }): Ordered;
  limit(count: number): PromiseLike<QueryResult>;
  eq(column: string, value: string): Selected;
}

interface TableQuery {
  select(columns: string): Selected;
}

/** Tables the board reads. The two score logs are optional in older projects. */
export type StandingsTable = "profiles" | "match_history" | "user_daily_completions";

/** The smallest surface both the browser client and the service-role client share. */
export interface StandingsClient {
  from(table: StandingsTable): TableQuery;
}

export interface StandingsSnapshot {
  rows: StandingRow[];
  /** True when week_score and week_start exist, so the weekly tab can rank by them. */
  weekly: boolean;
  /** Which column the database ordered by, or null when the client sorted everything. */
  scoreColumn: (typeof SCORE_COLUMNS)[number] | null;
  /** True when match_history rows were folded into the scores. */
  history: boolean;
  /** True when user_daily_completions rows were folded into the scores. */
  daily: boolean;
}

/** Score-log rows to fold in. Enough for a beta; the profile columns cover older totals. */
export const HISTORY_LIMIT = 5000;

function isProfileRow(value: unknown): value is ProfileRow {
  return Boolean(value) && typeof value === "object" && typeof (value as ProfileRow).id === "string";
}

interface ScoreLogRow {
  user_id: string;
  score?: number | string | null;
  solved?: boolean | null;
}

function isScoreLogRow(value: unknown): value is ScoreLogRow {
  return Boolean(value) && typeof value === "object" && typeof (value as ScoreLogRow).user_id === "string";
}

export interface ScoreTotals {
  score: number;
  solved: number;
}

function sumByUser(rows: unknown[], keep: (row: ScoreLogRow) => boolean): Map<string, ScoreTotals> {
  const totals = new Map<string, ScoreTotals>();
  for (const row of rows.filter(isScoreLogRow)) {
    if (!keep(row)) continue;
    const current = totals.get(row.user_id) ?? { score: 0, solved: 0 };
    current.score += asCount(row.score) ?? 0;
    current.solved += 1;
    totals.set(row.user_id, current);
  }
  return totals;
}

/**
 * Points per scout from match_history. The archive and daily pages write one
 * row per solve, and the profile page sums the same rows for its career total.
 */
export async function loadHistoryTotals(client: StandingsClient): Promise<Map<string, ScoreTotals> | null> {
  const result = await client.from("match_history").select("user_id, score").limit(HISTORY_LIMIT);
  if (result.error) return null;
  return sumByUser(result.data ?? [], () => true);
}

/**
 * Points per scout from user_daily_completions. The arena writes one row per
 * daily drop, so these points exist even when the award RPC never ran.
 */
export async function loadDailyTotals(client: StandingsClient): Promise<Map<string, ScoreTotals> | null> {
  const result = await client.from("user_daily_completions").select("user_id, score, solved").limit(HISTORY_LIMIT);
  if (result.error) return null;
  return sumByUser(result.data ?? [], (row) => row.solved === true);
}

/** Resolve one scout's career from every source the board could read, with the shared profile logic. */
export function withScoreLogs(
  row: StandingRow,
  history: ScoreTotals | undefined,
  daily: ScoreTotals | undefined,
): StandingRow {
  if (!history && !daily) return row;
  return {
    ...row,
    total_score: resolveCareerScore({ profile: row.total_score, history: history?.score, daily: daily?.score }),
    matches_solved: resolveSolvedCount({ profile: row.matches_solved, history: history?.solved, daily: daily?.solved }),
  };
}

/**
 * Every saved profile, including scouts with 0 points, highest score first.
 * The database orders by whichever score column it has; the client re-sorts
 * on the resolved score so both column layouts rank the same way.
 */
export async function loadStandingsRows(client: StandingsClient, weekStart: string): Promise<StandingsSnapshot> {
  let listed: ProfileRow[] = [];
  let scoreColumn: StandingsSnapshot["scoreColumn"] = null;

  for (const column of SCORE_COLUMNS) {
    const result = await client.from("profiles").select("*").order(column, { ascending: false }).limit(STANDINGS_LIMIT);
    if (!result.error) {
      listed = (result.data ?? []).filter(isProfileRow);
      scoreColumn = column;
      break;
    }
  }
  if (!scoreColumn) {
    const plain = await client.from("profiles").select("*").limit(STANDINGS_LIMIT);
    listed = (plain.data ?? []).filter(isProfileRow);
  }

  const pool = new Map<string, StandingRow>();
  for (const row of listed) pool.set(row.id, mapProfile(row));

  const weekly = listed.some((row) => "week_start" in row && "week_score" in row);
  if (weekly) {
    const weekBoard = await client
      .from("profiles")
      .select("*")
      .eq("week_start", weekStart)
      .order("week_score", { ascending: false })
      .limit(STANDINGS_LIMIT);
    if (!weekBoard.error) {
      for (const row of (weekBoard.data ?? []).filter(isProfileRow)) pool.set(row.id, mapProfile(row));
    }
  }

  const [history, daily] = await Promise.all([loadHistoryTotals(client), loadDailyTotals(client)]);
  const rows = [...pool.values()].map((row) => withScoreLogs(row, history?.get(row.id), daily?.get(row.id)));

  return { rows: sortByScore(rows), weekly, scoreColumn, history: history != null, daily: daily != null };
}

export function isStandingRow(value: unknown): value is StandingRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.username === "string" && typeof row.total_score === "number";
}
