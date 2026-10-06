export interface DailyCompletion {
  dropDate: string;
  solved: boolean;
  score: number;
  challengeId?: string | null;
}

export type CalendarStatus = "pad" | "future" | "today" | "solved" | "failed" | "missed" | "unplayed";

export interface CalendarCell {
  dateKey: string | null;
  status: CalendarStatus;
  score: number | null;
  challengeId: string | null;
}

export interface MonthArchive {
  label: string;
  cells: CalendarCell[];
  played: number;
  elapsed: number;
  accuracy: number;
  totalScore: number;
}

const MONTHS = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
] as const;

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export const WEEKDAY_HEADERS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"] as const;

export function isDateKey(value: string | null | undefined): value is string {
  return Boolean(value && DATE_KEY.test(value));
}

export function formatArchiveDate(dateKey: string): string {
  if (!isDateKey(dateKey)) return dateKey;
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatScoreBadge(score: number): string {
  if (score >= 1000) {
    const rounded = Math.round((score / 1000) * 10) / 10;
    const label = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    return `${label}k`;
  }
  return String(score);
}

export function shiftMonth(year: number, monthIndex: number, delta: number): { year: number; monthIndex: number } {
  const next = new Date(Date.UTC(year, monthIndex + delta, 1));
  return { year: next.getUTCFullYear(), monthIndex: next.getUTCMonth() };
}

export function canAdvanceMonth(year: number, monthIndex: number, todayKey: string): boolean {
  const [todayYear, todayMonth] = todayKey.split("-").map(Number);
  return year < todayYear || (year === todayYear && monthIndex < todayMonth - 1);
}

export function upsertCompletion(list: readonly DailyCompletion[], next: DailyCompletion): DailyCompletion[] {
  if (!isDateKey(next.dropDate)) return [...list];
  const prior = list.find((item) => item.dropDate === next.dropDate);
  if (prior?.solved && !next.solved) return [...list];
  const row: DailyCompletion = {
    dropDate: next.dropDate,
    solved: prior?.solved || next.solved,
    score: prior?.solved && !next.solved ? prior.score : next.score,
    challengeId: next.challengeId ?? prior?.challengeId ?? null,
  };
  return [...list.filter((item) => item.dropDate !== next.dropDate), row].sort((a, b) =>
    a.dropDate.localeCompare(b.dropDate),
  );
}

export function buildMonthArchive(
  year: number,
  monthIndex: number,
  todayKey: string,
  completions: readonly DailyCompletion[],
  availableDates: ReadonlySet<string> | null = null,
): MonthArchive {
  const marks = new Map(completions.map((item) => [item.dropDate, item]));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const leading = (firstWeekday + 6) % 7;
  const cells: CalendarCell[] = Array.from({ length: leading }, () => ({
    dateKey: null,
    status: "pad",
    score: null,
    challengeId: null,
  }));

  let played = 0;
  let solvedCount = 0;
  let elapsed = 0;
  let totalScore = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const mark = marks.get(dateKey);
    const available = availableDates ? availableDates.has(dateKey) : true;
    let status: CalendarStatus;
    if (dateKey > todayKey) status = "future";
    else if (dateKey === todayKey) status = "today";
    else if (mark?.solved) status = "solved";
    else if (mark && !mark.solved) status = "failed";
    else if (!available) status = "missed";
    else status = "unplayed";

    if (dateKey <= todayKey) {
      elapsed += 1;
      if (mark) played += 1;
      if (mark?.solved) {
        solvedCount += 1;
        totalScore += mark.score;
      }
    }

    cells.push({
      dateKey,
      status,
      score: mark?.solved ? mark.score : null,
      challengeId: mark?.challengeId ?? null,
    });
  }

  return {
    label: `${MONTHS[monthIndex]} ${year}`.toUpperCase(),
    cells,
    played,
    elapsed,
    accuracy: played === 0 ? 0 : Math.round((solvedCount / played) * 100),
    totalScore,
  };
}
