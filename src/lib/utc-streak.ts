export const SOLVED_HISTORY_KEY = "shc_solved_history";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Milliseconds from `now` until the next 00:00:00.000 UTC. */
export function msUntilNextUtcMidnight(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
  return Math.max(0, next - now.getTime());
}

/** `HH : MM : SS`, hours not capped at 24 because the window is always under a day. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
}

export function shiftUtcDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

/** Monday `YYYY-MM-DD` of the UTC week that contains `dateKey`. */
export function mondayOfUtcWeek(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const offset = weekday === 0 ? 6 : weekday - 1;
  return shiftUtcDateKey(dateKey, -offset);
}

export function weekDateKeys(todayKey: string): string[] {
  const monday = mondayOfUtcWeek(todayKey);
  return Array.from({ length: 7 }, (_, index) => shiftUtcDateKey(monday, index));
}

export function loadSolvedHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SOLVED_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value));
  } catch {
    return [];
  }
}

export function recordSolvedDate(dateKey: string, history: string[] = loadSolvedHistory()): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return history;
  const next = history.includes(dateKey) ? history : [...history, dateKey].sort();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SOLVED_HISTORY_KEY, JSON.stringify(next));
  }
  return next;
}

/**
 * Consecutive solved UTC days ending today, or ending yesterday when today
 * is still open. A gap resets the run.
 */
export function activeStreak(history: string[], todayKey: string): number {
  const solved = new Set(history);
  let cursor = solved.has(todayKey) ? todayKey : shiftUtcDateKey(todayKey, -1);
  if (!solved.has(cursor)) return 0;
  let count = 0;
  while (solved.has(cursor)) {
    count += 1;
    cursor = shiftUtcDateKey(cursor, -1);
  }
  return count;
}
