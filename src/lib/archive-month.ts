import { buildMonthArchive, type DailyCompletion } from "@/lib/archive-calendar";
import { sportPresentation, type ArchiveFixture } from "@/lib/archive-vault";
import { activeStreak } from "@/lib/utc-streak";

export const ARCHIVE_WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export const MONTH_ARROW_CLASS =
  "border-2 border-zinc-900 rounded-xl px-3 py-1.5 font-bold shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]";

export const WEEKDAY_CLASS = "text-xs font-black text-zinc-400 text-center uppercase tracking-wider py-2";

export const TILE_CLASS =
  "aspect-square p-2 rounded-2xl border-2 transition-all flex flex-col justify-between items-center relative";

export const TILE_SOLVED = "bg-emerald-50 border-emerald-600 text-emerald-800";

export const TILE_UNPLAYED =
  "bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] cursor-pointer hover:bg-zinc-50";

export const TILE_TODAY = "border-blue-600 bg-blue-50/50";

export const TILE_FUTURE =
  "bg-zinc-100 border-dashed border-zinc-300 text-zinc-300 opacity-60 cursor-not-allowed";

export const STATS_CLASS =
  "border-[2.5px] border-zinc-900 bg-white rounded-2xl p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] flex justify-around text-center";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export interface SolvedMarks {
  dates: ReadonlySet<string>;
  ids: ReadonlySet<string>;
}

const FALLBACK_SPORTS = ["football", "ice hockey", "boxing", "tennis", "athletics"] as const;

export function fallbackSportForDay(day: number): string {
  const index = (Math.max(1, day) - 1) % FALLBACK_SPORTS.length;
  return FALLBACK_SPORTS[index];
}

export type ArchiveTileState = "future" | "today" | "solved" | "unplayed";

export type ArchiveMonthCell =
  | { kind: "pad" }
  | {
      kind: "day";
      dateKey: string;
      day: number;
      state: ArchiveTileState;
      icon: string | null;
      href: string | null;
    };

export function monthHeading(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex] ?? "January"} ${year}`;
}

export function fixtureIsSolved(fixture: Pick<ArchiveFixture, "id" | "fixtureDate">, marks: SolvedMarks): boolean {
  return marks.ids.has(fixture.id) || marks.dates.has(fixture.fixtureDate);
}

export function archiveStats(
  year: number,
  monthIndex: number,
  todayKey: string,
  fixtures: readonly ArchiveFixture[],
  marks: SolvedMarks,
) {
  const solvedDates = solvedDateKeys(fixtures, marks);
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  let total = 0;
  let solved = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateKey > todayKey) continue;
    total += 1;
    if (solvedDates.has(dateKey)) solved += 1;
  }
  return {
    total,
    solved,
    streak: activeStreak([...solvedDates], todayKey),
  };
}

function solvedDateKeys(fixtures: readonly ArchiveFixture[], marks: SolvedMarks): Set<string> {
  const solvedDates = new Set<string>(marks.dates);
  for (const fixture of fixtures) {
    if (fixtureIsSolved(fixture, marks)) solvedDates.add(fixture.fixtureDate);
  }
  return solvedDates;
}

export function buildArchiveMonth(
  year: number,
  monthIndex: number,
  todayKey: string,
  fixtures: readonly ArchiveFixture[],
  marks: SolvedMarks,
): { label: string; cells: ArchiveMonthCell[] } {
  const byDate = new Map(fixtures.map((fixture) => [fixture.fixtureDate, fixture]));
  const solvedDates = solvedDateKeys(fixtures, marks);
  const completions: DailyCompletion[] = [...solvedDates].map((dropDate) => ({
    dropDate,
    solved: true,
    score: 0,
    challengeId: byDate.get(dropDate)?.id ?? null,
  }));
  const month = buildMonthArchive(year, monthIndex, todayKey, completions, null);

  const cells: ArchiveMonthCell[] = month.cells.map((cell) => {
    if (cell.status === "pad" || !cell.dateKey) return { kind: "pad" };
    const day = Number(cell.dateKey.slice(-2));
    const fixture = byDate.get(cell.dateKey);
    const icon = sportPresentation(fixture?.sport || fallbackSportForDay(day)).icon;
    const state = visualState(cell.status);
    return {
      kind: "day",
      dateKey: cell.dateKey,
      day,
      state,
      icon,
      href: hrefFor(state, cell.dateKey),
    };
  });

  return { label: monthHeading(year, monthIndex), cells };
}

function visualState(status: string): ArchiveTileState {
  if (status === "future") return "future";
  if (status === "today") return "today";
  if (status === "solved") return "solved";
  return "unplayed";
}

function hrefFor(state: ArchiveTileState, dateKey: string): string | null {
  if (state === "future") return null;
  return `/?date=${dateKey}`;
}

export function tileClass(state: ArchiveTileState): string {
  switch (state) {
    case "solved":
      return `${TILE_CLASS} ${TILE_SOLVED}`;
    case "unplayed":
      return `${TILE_CLASS} ${TILE_UNPLAYED}`;
    case "today":
      return `${TILE_CLASS} ${TILE_TODAY}`;
    case "future":
      return `${TILE_CLASS} ${TILE_FUTURE}`;
    default:
      return `${TILE_CLASS} ${TILE_UNPLAYED}`;
  }
}
