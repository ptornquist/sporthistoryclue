import { buildMonthArchive, type DailyCompletion } from "@/lib/archive-calendar";
import { sportPresentation, type ArchiveFixture } from "@/lib/archive-vault";
import { activeStreak } from "@/lib/utc-streak";

export const ARCHIVE_WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export const MONTH_ARROW_CLASS =
  "border-2 border-zinc-900 rounded-xl px-3 py-1.5 font-bold shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]";

export const WEEKDAY_CLASS = "text-xs font-black text-zinc-400 text-center uppercase tracking-wider py-2";

export const TILE_CLASS =
  "aspect-square p-2 rounded-2xl border-2 transition-all flex flex-col justify-between items-center relative";

export const TILE_SOLVED =
  "bg-emerald-50 border-emerald-600 text-emerald-950 font-black shadow-[2px_2px_0px_0px_rgba(5,150,105,1)]";

export const TILE_UNPLAYED =
  "bg-white border-zinc-900 text-zinc-900 hover:bg-zinc-50 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] active:translate-y-[1px]";

export const TILE_TODAY =
  "bg-blue-50 border-blue-600 text-blue-900 font-black shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] ring-2 ring-blue-500";

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

export type ArchiveTileState = "future" | "today" | "solved" | "unplayed" | "quiet";

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

export function archiveStats(fixtures: readonly ArchiveFixture[], todayKey: string, marks: SolvedMarks) {
  const available = fixtures.filter((fixture) => fixture.fixtureDate <= todayKey);
  const solvedDates = new Set<string>(marks.dates);
  for (const fixture of available) {
    if (fixtureIsSolved(fixture, marks)) solvedDates.add(fixture.fixtureDate);
  }
  return {
    total: available.length,
    solved: available.filter((fixture) => fixtureIsSolved(fixture, marks)).length,
    streak: activeStreak([...solvedDates], todayKey),
  };
}

export function buildArchiveMonth(
  year: number,
  monthIndex: number,
  todayKey: string,
  fixtures: readonly ArchiveFixture[],
  marks: SolvedMarks,
): { label: string; cells: ArchiveMonthCell[] } {
  const byDate = new Map(fixtures.map((fixture) => [fixture.fixtureDate, fixture]));
  const completions: DailyCompletion[] = fixtures.flatMap((fixture) =>
    fixtureIsSolved(fixture, marks)
      ? [{ dropDate: fixture.fixtureDate, solved: true, score: 0, challengeId: fixture.id }]
      : [],
  );
  const month = buildMonthArchive(year, monthIndex, todayKey, completions, new Set(byDate.keys()));

  const cells: ArchiveMonthCell[] = month.cells.map((cell) => {
    if (cell.status === "pad" || !cell.dateKey) return { kind: "pad" };
    const fixture = byDate.get(cell.dateKey);
    const icon = fixture ? sportPresentation(fixture.sport).icon : null;
    const day = Number(cell.dateKey.slice(-2));
    const state = visualState(cell.status, Boolean(fixture));
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

function visualState(status: string, hasFixture: boolean): ArchiveTileState {
  if (status === "future") return "future";
  if (status === "today") return "today";
  if (status === "solved") return "solved";
  if (status === "unplayed" || (status === "failed" && hasFixture)) return "unplayed";
  return "quiet";
}

function hrefFor(state: ArchiveTileState, dateKey: string): string | null {
  if (state === "today") return "/";
  if (state === "solved" || state === "unplayed") return `/?date=${dateKey}`;
  return null;
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
      return `${TILE_CLASS} border-transparent bg-transparent text-zinc-300`;
  }
}
