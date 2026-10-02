export type StandingMode = "week" | "all";

export interface StandingRow {
  id: string;
  username: string;
  total_score: number;
  week_score: number;
  week_start: string | null;
  streak: number;
  equipped_title: string | null;
  equipped_frame: string | null;
  matches_solved: number;
  avatar_url: string | null;
  legend?: boolean;
}

export interface DivisionTier {
  id: "bronze" | "silver" | "gold" | "hall";
  emoji: string;
  name: string;
  range: string;
  min: number;
  nextAt: number | null;
}

export const DIVISION_TIERS: DivisionTier[] = [
  { id: "bronze", emoji: "🥉", name: "Bronze League", range: "0 - 9,999 PTS", min: 0, nextAt: 10000 },
  { id: "silver", emoji: "🥈", name: "Silver League", range: "10,000 - 29,999 PTS", min: 10000, nextAt: 30000 },
  { id: "gold", emoji: "🥇", name: "Gold Tactician", range: "30,000 - 59,999 PTS", min: 30000, nextAt: 60000 },
  { id: "hall", emoji: "💎", name: "Hall of Fame", range: "60,000+ PTS", min: 60000, nextAt: null },
];

export const LEGEND_SCOUTS: StandingRow[] = [
  { id: "legend-pele", username: "pele", total_score: 84200, week_score: 9100, week_start: null, streak: 28, equipped_title: "hall-of-famer", equipped_frame: "golden-glow", matches_solved: 64, avatar_url: null, legend: true },
  { id: "legend-gretzky", username: "gretzky", total_score: 71500, week_score: 6400, week_start: null, streak: 21, equipped_title: "ice-analyst", equipped_frame: "ice-rink", matches_solved: 58, avatar_url: null, legend: true },
  { id: "legend-jordan", username: "jordan", total_score: 68800, week_score: 12050, week_start: null, streak: 14, equipped_title: "record-breaker", equipped_frame: "arena-lights", matches_solved: 51, avatar_url: null, legend: true },
  { id: "legend-serena", username: "serena", total_score: 54000, week_score: 8800, week_start: null, streak: 18, equipped_title: "hall-of-famer", equipped_frame: "velvet-rope", matches_solved: 47, avatar_url: null, legend: true },
  { id: "legend-ali", username: "ali", total_score: 47200, week_score: 4200, week_start: null, streak: 11, equipped_title: "ringside", equipped_frame: "golden-glow", matches_solved: 39, avatar_url: null, legend: true },
  { id: "legend-bolt", username: "bolt", total_score: 22100, week_score: 7600, week_start: null, streak: 9, equipped_title: "record-breaker", equipped_frame: "arena-lights", matches_solved: 22, avatar_url: null, legend: true },
  { id: "legend-maradona", username: "maradona", total_score: 18400, week_score: 3100, week_start: null, streak: 6, equipped_title: "golden-boot", equipped_frame: "standard", matches_solved: 19, avatar_url: null, legend: true },
  { id: "legend-orr", username: "orr", total_score: 9600, week_score: 2400, week_start: null, streak: 4, equipped_title: "ice-analyst", equipped_frame: "ice-rink", matches_solved: 12, avatar_url: null, legend: true },
];

export function divisionFor(score: number): DivisionTier {
  const safe = Math.max(0, Math.floor(score));
  if (safe >= 60000) return DIVISION_TIERS[3];
  if (safe >= 30000) return DIVISION_TIERS[2];
  if (safe >= 10000) return DIVISION_TIERS[1];
  return DIVISION_TIERS[0];
}

/** Points still needed to leave the current division. `null` at Hall of Fame. */
export function pointsToNextTier(score: number): number | null {
  const tier = divisionFor(score);
  if (tier.nextAt == null) return null;
  return Math.max(0, tier.nextAt - Math.max(0, Math.floor(score)));
}

export function nextTier(score: number): DivisionTier | null {
  const current = divisionFor(score);
  const index = DIVISION_TIERS.findIndex((tier) => tier.id === current.id);
  return DIVISION_TIERS[index + 1] ?? null;
}

export function isActiveScout(row: StandingRow): boolean {
  return !row.legend && row.username.trim().length > 0 && row.total_score > 0;
}

/** Keep a live board. Pad with legends when fewer than five scouts have points. */
export function fillStandings(rows: StandingRow[]): StandingRow[] {
  const real = rows.filter(isActiveScout);
  const pool = real.length >= 5 ? real : [...real, ...LEGEND_SCOUTS];
  const seen = new Set<string>();
  const unique: StandingRow[] = [];
  for (const row of pool) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    unique.push(row);
  }
  return unique;
}

export function scoreFor(row: StandingRow, mode: StandingMode, weekStart: string | null): number {
  if (mode === "all") return row.total_score;
  if (row.legend || !weekStart) return row.week_score;
  return row.week_start === weekStart ? row.week_score : 0;
}

export function placeScout(
  rows: StandingRow[],
  viewer: StandingRow | null,
  mode: StandingMode,
  weekStart: string | null,
): { board: StandingRow[]; rank: number | null } {
  const pool = fillStandings(rows);
  if (viewer && viewer.username.trim() && !pool.some((row) => row.id === viewer.id)) {
    pool.push(viewer);
  }
  const sorted = [...pool].sort((a, b) => {
    const delta = scoreFor(b, mode, weekStart) - scoreFor(a, mode, weekStart);
    if (delta !== 0) return delta;
    return a.username.localeCompare(b.username);
  });
  const rank = viewer ? sorted.findIndex((row) => row.id === viewer.id) + 1 : null;
  return { board: sorted.slice(0, 50), rank: rank && rank > 0 ? rank : null };
}

export function formatPositionLine(input: {
  rank: number;
  username: string;
  title: string;
  score: number;
  pointsToNext: number | null;
}): string {
  const title = input.title ? ` · ${input.title}` : "";
  const next =
    input.pointsToNext == null
      ? " · Hall of Fame"
      : ` · Next Tier in ${input.pointsToNext.toLocaleString()} PTS`;
  return `YOUR RANK: #${input.rank} · @${input.username}${title} · ${input.score.toLocaleString()} PTS${next}`;
}
