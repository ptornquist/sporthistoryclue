import type { BoardScope } from "./board-scope";
import { isSwedishClub } from "./premier-league";

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
  favorite_club?: string | null;
  country?: "se" | "world";
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
  { id: "bronze", emoji: "🥉", name: "Bronsdivisionen", range: "0–9 999 poäng", min: 0, nextAt: 10000 },
  { id: "silver", emoji: "🥈", name: "Silverdivisionen", range: "10 000–29 999 poäng", min: 10000, nextAt: 30000 },
  { id: "gold", emoji: "🥇", name: "Guldstrategen", range: "30 000–59 999 poäng", min: 30000, nextAt: 60000 },
  { id: "hall", emoji: "💎", name: "Hall of Fame", range: "60 000+ poäng", min: 60000, nextAt: null },
];

/** How many real profile rows the public board keeps, highest score first. */
export const STANDINGS_LIMIT = 200;

export function isNationalScout(row: StandingRow): boolean {
  return row.country === "se" || isSwedishClub(row.favorite_club);
}

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

/** A saved profile. Zero points still belong on the board. Hardcoded legend ids never do. */
export function isRealScout(row: StandingRow): boolean {
  if (row.legend || row.id.startsWith("legend-")) return false;
  return row.username.trim().length > 0;
}

/** Real profiles only. The board is never padded with sample accounts. */
export function fillStandings(rows: StandingRow[], scope: BoardScope = "world"): StandingRow[] {
  const real = rows.filter(isRealScout);
  const scoped = scope === "se" ? real.filter(isNationalScout) : real;
  const seen = new Set<string>();
  const unique: StandingRow[] = [];
  for (const row of scoped) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    unique.push(row);
  }
  return unique;
}

export function scoreFor(row: StandingRow, mode: StandingMode, weekStart: string | null): number {
  if (mode === "all") return row.total_score;
  if (!weekStart) return row.week_score;
  return row.week_start === weekStart ? row.week_score : 0;
}

export function placeScout(
  rows: StandingRow[],
  viewer: StandingRow | null,
  mode: StandingMode,
  weekStart: string | null,
  scope: BoardScope = "world",
): { board: StandingRow[]; rank: number | null } {
  const pool = fillStandings(rows, scope);
  const viewerFits = viewer && (scope === "world" || isNationalScout(viewer));
  if (viewerFits && viewer.username.trim() && !pool.some((row) => row.id === viewer.id)) {
    pool.push(viewer);
  }
  const sorted = [...pool].sort((a, b) => {
    const delta = scoreFor(b, mode, weekStart) - scoreFor(a, mode, weekStart);
    if (delta !== 0) return delta;
    return a.username.localeCompare(b.username);
  });
  const rank = viewer ? sorted.findIndex((row) => row.id === viewer.id) + 1 : null;
  return { board: sorted.slice(0, STANDINGS_LIMIT), rank: rank && rank > 0 ? rank : null };
}

export function formatPositionLine(input: {
  rank: number;
  username: string;
  title: string;
  score: number;
  pointsToNext: number | null;
}): string {
  const title = input.title ? ` · ${input.title}` : "";
  const points = (value: number) => Math.max(0, Math.floor(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const next =
    input.pointsToNext == null
      ? " · Hall of Fame"
      : ` · Nästa nivå om ${points(input.pointsToNext)} poäng`;
  return `DIN PLATS: #${input.rank} · @${input.username}${title} · ${points(input.score)} poäng${next}`;
}
