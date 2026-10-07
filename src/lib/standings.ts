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

export const SWEDISH_LEGENDS: StandingRow[] = [
  { id: "legend-zlatan", username: "zlatan", total_score: 76800, week_score: 8200, week_start: null, streak: 24, equipped_title: "golden-boot", equipped_frame: "golden-glow", matches_solved: 61, avatar_url: null, favorite_club: "malmo", country: "se", legend: true },
  { id: "legend-forsberg", username: "forsberg", total_score: 64200, week_score: 5400, week_start: null, streak: 19, equipped_title: "ice-analyst", equipped_frame: "ice-rink", matches_solved: 52, avatar_url: null, favorite_club: "aik", country: "se", legend: true },
  { id: "legend-sundin", username: "sundin", total_score: 51300, week_score: 4100, week_start: null, streak: 16, equipped_title: "ice-analyst", equipped_frame: "ice-rink", matches_solved: 44, avatar_url: null, favorite_club: "djurgarden", country: "se", legend: true },
  { id: "legend-lidstrom", username: "lidstrom", total_score: 44700, week_score: 3600, week_start: null, streak: 13, equipped_title: "hall-of-famer", equipped_frame: "velvet-rope", matches_solved: 37, avatar_url: null, favorite_club: "ifk-goteborg", country: "se", legend: true },
  { id: "legend-borg", username: "borg", total_score: 28900, week_score: 2700, week_start: null, streak: 8, equipped_title: "record-breaker", equipped_frame: "arena-lights", matches_solved: 26, avatar_url: null, favorite_club: "hammarby", country: "se", legend: true },
  { id: "legend-salming", username: "salming", total_score: 12400, week_score: 1800, week_start: null, streak: 5, equipped_title: "ice-analyst", equipped_frame: "ice-rink", matches_solved: 15, avatar_url: null, favorite_club: "sirius", country: "se", legend: true },
];

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

export function isActiveScout(row: StandingRow): boolean {
  return !row.legend && row.username.trim().length > 0 && row.total_score > 0;
}

/** Keep a live board. Pad with legends when fewer than five scouts have points. */
export function fillStandings(rows: StandingRow[], scope: BoardScope = "world"): StandingRow[] {
  const real = rows.filter(isActiveScout);
  const scoped = scope === "se" ? real.filter(isNationalScout) : real;
  const legends = scope === "se" ? SWEDISH_LEGENDS : LEGEND_SCOUTS;
  const pool = scoped.length >= 5 ? scoped : [...scoped, ...legends];
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
  const points = (value: number) => Math.max(0, Math.floor(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const next =
    input.pointsToNext == null
      ? " · Hall of Fame"
      : ` · Nästa nivå om ${points(input.pointsToNext)} poäng`;
  return `DIN PLATS: #${input.rank} · @${input.username}${title} · ${points(input.score)} poäng${next}`;
}
