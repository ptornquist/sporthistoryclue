import { solveCoinReward } from "./cosmetics";
import { mondayOfUtcWeek } from "./utc-streak";

/**
 * Writes a solved kluring to the scout's profiles row.
 *
 * The browser cannot update the score columns itself: the guard trigger resets
 * them unless the write comes through the award RPC. When that RPC is missing
 * (migrations not applied) the points used to stay in the browser wallet, so
 * the profile showed them and the board showed 0. This module applies the same
 * update the RPC performs, but with the service-role client on the server.
 */

export const MAX_SOLVE_POINTS = 10000;
export const MATCH_ID = /^[A-Za-z0-9_-]{1,80}$/;

export interface SolveInput {
  userId: string;
  matchId: string;
  pointScore: number;
  isDaily: boolean;
  streakContinued: boolean;
  duelWon: boolean;
  newStreak: number;
  sport?: string | null;
  /** UTC date key used for the weekly board. Defaults to today. */
  today?: string;
}

export type ProfileValues = Record<string, unknown>;

interface ErrorLike {
  message: string;
  code?: string;
}

interface Result<T = unknown> {
  data: T | null;
  error: ErrorLike | null;
}

interface Filtered extends PromiseLike<Result> {
  maybeSingle(): PromiseLike<Result<ProfileValues>>;
}

interface Selected {
  eq(column: string, value: string): Filtered;
}

interface Table {
  select(columns: string): Selected;
  insert(values: ProfileValues): PromiseLike<Result>;
  update(values: ProfileValues): { eq(column: string, value: string): PromiseLike<Result> };
}

/** The slice of a Supabase client the direct award needs. */
export interface AwardClient {
  from(table: string): Table;
}

function count(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.floor(parsed));
  }
  return 0;
}

/** Columns that hold the career total. Whichever the row has gets the points. */
export const CAREER_COLUMNS = ["total_score", "career_score"] as const;

export function clampPoints(value: number): number {
  return Math.min(MAX_SOLVE_POINTS, count(value));
}

/** The streak the RPC would accept: never more than one above the saved streak. */
export function safeStreak(row: ProfileValues, requested: number): number {
  return Math.min(count(requested), count(row.streak) + 1);
}

/**
 * The values the award RPC writes, limited to columns the row actually has so
 * an older schema never rejects the update for an unknown column.
 */
export function nextProfileValues(row: ProfileValues, input: SolveInput, earned: number): ProfileValues {
  const points = clampPoints(input.pointScore);
  const streak = safeStreak(row, input.newStreak);
  const has = (column: string) => column in row;
  const patch: ProfileValues = {};

  for (const column of CAREER_COLUMNS) {
    if (has(column)) patch[column] = count(row[column]) + points;
  }
  if (!CAREER_COLUMNS.some(has)) patch.total_score = points;
  if (has("matches_solved")) patch.matches_solved = count(row.matches_solved) + 1;
  if (has("fixtures_cleared")) patch.fixtures_cleared = count(row.fixtures_cleared) + 1;
  if (has("streak")) patch.streak = streak;
  if (has("best_streak")) patch.best_streak = Math.max(count(row.best_streak), streak);
  if (has("coins")) patch.coins = count(row.coins) + earned;
  if (has("player_level")) {
    const total = count(row.total_score) + points;
    patch.player_level = Math.max(1, Math.floor(Math.sqrt(total / 200)));
  }
  if (has("week_score") && has("week_start")) {
    const monday = mondayOfUtcWeek(input.today ?? new Date().toISOString().slice(0, 10));
    patch.week_score = row.week_start === monday ? count(row.week_score) + points : points;
    patch.week_start = monday;
  }
  const board = input.sport === "ice_hockey" ? "hockey_score" : input.sport === "football" ? "football_score" : "international_score";
  if (has(board)) patch[board] = count(row[board]) + points;
  if (has("updated_at")) patch.updated_at = new Date().toISOString();

  return patch;
}

export function coinsFor(row: ProfileValues, input: SolveInput): number {
  const streak = safeStreak(row, input.newStreak);
  return solveCoinReward({
    isDaily: input.isDaily,
    streakContinued: input.streakContinued && streak >= 2,
    duelWon: input.duelWon,
  });
}

export type DirectAward =
  | { saved: true; earned: number; duplicate: boolean; profile: ProfileValues }
  | { saved: false; reason: "profile" | "guard" | "write"; profile: ProfileValues | null; message?: string };

function isDuplicate(error: ErrorLike | null): boolean {
  return error?.code === "23505" || /duplicate key/i.test(error?.message ?? "");
}

function isMissingRelation(error: ErrorLike | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message);
}

/** The browser may not insert grants (RLS allows only select); it still gets to save the score. */
function isForbidden(error: ErrorLike | null): boolean {
  if (!error) return false;
  return error.code === "42501" || /permission denied|row-level security/i.test(error.message);
}

async function loadProfile(client: AwardClient, userId: string): Promise<ProfileValues | null> {
  const result = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
  return result.error ? null : result.data;
}

/** Score the row holds, across both career columns. */
export function careerOf(row: ProfileValues | null): number {
  if (!row) return 0;
  return Math.max(...CAREER_COLUMNS.map((column) => count(row[column])));
}

/** Totals the browser wallet holds; the profile is raised to these, never lowered. */
export interface WalletTotals {
  totalScore: number;
  matchesSolved: number;
  bestStreak: number;
}

/**
 * Columns to raise so the row holds at least the wallet totals. Null when the
 * row already has everything, so callers skip the write.
 */
export function raisedProfileValues(row: ProfileValues, totals: WalletTotals): ProfileValues | null {
  const patch: ProfileValues = {};
  const target = clampTotal(totals.totalScore);
  const has = (column: string) => column in row;

  for (const column of CAREER_COLUMNS) {
    if (has(column) && count(row[column]) < target) patch[column] = target;
  }
  if (!CAREER_COLUMNS.some(has) && target > 0) patch.total_score = target;
  if (has("matches_solved") && count(row.matches_solved) < count(totals.matchesSolved)) {
    patch.matches_solved = count(totals.matchesSolved);
  }
  if (has("best_streak") && count(row.best_streak) < count(totals.bestStreak)) {
    patch.best_streak = count(totals.bestStreak);
  }
  if (Object.keys(patch).length === 0) return null;
  if (has("updated_at")) patch.updated_at = new Date().toISOString();
  return patch;
}

function clampTotal(value: number): number {
  return Math.min(count(value), 100_000_000);
}

/**
 * Push points that only exist in a browser wallet onto the profiles row.
 * Idempotent: a second call with the same totals changes nothing.
 */
export async function raiseProfileTotals(
  client: AwardClient,
  userId: string,
  totals: WalletTotals,
  username = "scout",
): Promise<DirectAward> {
  let row = await loadProfile(client, userId);
  if (!row) {
    await client.from("profiles").insert({ id: userId, username });
    row = await loadProfile(client, userId);
  }
  if (!row) return { saved: false, reason: "profile", profile: null };

  const patch = raisedProfileValues(row, totals);
  if (!patch) return { saved: true, earned: 0, duplicate: true, profile: row };

  const update = await client.from("profiles").update(patch).eq("id", userId);
  if (update.error) return { saved: false, reason: "write", profile: row, message: update.error.message };

  const after = (await loadProfile(client, userId)) ?? row;
  const raisedScore = CAREER_COLUMNS.some((column) => column in patch);
  if (raisedScore && careerOf(after) < clampTotal(totals.totalScore)) {
    return { saved: false, reason: "guard", profile: after };
  }
  return { saved: true, earned: 0, duplicate: false, profile: after };
}

/**
 * Apply the solve straight to the profiles row with a privileged client.
 * Idempotent per (user, match) through coin_grants when that table exists.
 */
export async function awardDirectly(client: AwardClient, input: SolveInput, username = "scout"): Promise<DirectAward> {
  let row = await loadProfile(client, input.userId);
  if (!row) {
    await client.from("profiles").insert({ id: input.userId, username });
    row = await loadProfile(client, input.userId);
  }
  if (!row) return { saved: false, reason: "profile", profile: null };

  const earned = coinsFor(row, input);
  const grant = await client.from("coin_grants").insert({ user_id: input.userId, match_id: input.matchId, coins: earned });
  if (grant.error && isDuplicate(grant.error)) {
    return { saved: true, earned: 0, duplicate: true, profile: row };
  }
  if (grant.error && !isMissingRelation(grant.error) && !isForbidden(grant.error)) {
    return { saved: false, reason: "write", profile: row, message: grant.error.message };
  }

  const patch = nextProfileValues(row, input, earned);
  const before = careerOf(row);
  const update = await client.from("profiles").update(patch).eq("id", input.userId);
  if (update.error) return { saved: false, reason: "write", profile: row, message: update.error.message };

  const after = (await loadProfile(client, input.userId)) ?? row;
  const points = clampPoints(input.pointScore);
  if (points > 0 && careerOf(after) < before + points) {
    return { saved: false, reason: "guard", profile: after };
  }
  return { saved: true, earned, duplicate: false, profile: after };
}
