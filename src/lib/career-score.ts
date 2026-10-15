/**
 * One career total for a scout, shared by the profile card and the standings board.
 *
 * Points are recorded in several places depending on which database objects a
 * deployment has: the profiles score column (written by the award RPC), one
 * match_history row per solve, and one user_daily_completions row per daily
 * drop. The same solve can appear in more than one of them, so the sources are
 * not added together; the largest total is the saved career score.
 */
export interface CareerSources {
  /** profiles.total_score or profiles.career_score. */
  profile?: number | null;
  /** Sum of match_history.score. */
  history?: number | null;
  /** Sum of user_daily_completions.score where solved. */
  daily?: number | null;
  /** Browser wallet. Only the profile page has it; the board never does. */
  local?: number | null;
}

function count(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function resolveCareerScore(sources: CareerSources): number {
  return Math.max(count(sources.profile), count(sources.history), count(sources.daily), count(sources.local));
}

export function resolveSolvedCount(sources: CareerSources): number {
  return Math.max(count(sources.profile), count(sources.history), count(sources.daily), count(sources.local));
}

export interface DailyTotals {
  score: number;
  solved: number;
}

/** Points and solves from daily-drop completions; unsolved days count for nothing. */
export function sumDailyCompletions(rows: ReadonlyArray<{ solved: boolean; score: number }>): DailyTotals {
  return rows.reduce<DailyTotals>(
    (acc, row) => (row.solved ? { score: acc.score + count(row.score), solved: acc.solved + 1 } : acc),
    { score: 0, solved: 0 },
  );
}

/** Highest career score first; ties keep a stable alphabetical order. */
export function compareByCareer<T extends { total_score: number; username: string }>(a: T, b: T): number {
  return b.total_score - a.total_score || a.username.localeCompare(b.username);
}
