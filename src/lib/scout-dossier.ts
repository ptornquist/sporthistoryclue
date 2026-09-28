import { canonicalSport } from "@/lib/decoy-options";
import { findPremierLeagueClub, FAVORITE_CLUB_KEY, type PremierLeagueClub } from "@/lib/premier-league";
import { SOLVED_HISTORY_KEY, activeStreak, loadSolvedHistory, shiftUtcDateKey, utcDateKey } from "@/lib/utc-streak";

export const STREAK_DATA_KEY = "shc_streak_data";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export interface ScoutMatch {
  id: string;
  date: string;
  sport: string;
  score: number;
  tilesUnlocked: number;
  won: boolean;
  timestamp: number;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
}

export interface TileBucket {
  tile: number;
  label: string;
  count: number;
}

export interface SportPill {
  id: string;
  icon: string;
  label: string;
  wins: number;
}

export interface ScoutStats {
  played: number;
  won: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  intelPoints: number;
  averageClues: number;
  rank: string;
  distribution: TileBucket[];
  sports: SportPill[];
  club: PremierLeagueClub | null;
  clubPoints: number;
}

const TILES = ["Arena", "Era", "Lineup", "Photo", "Climax"] as const;

const SPORT_PILLS: SportPill[] = [
  { id: "football", icon: "⚽", label: "Football", wins: 0 },
  { id: "hockey", icon: "🏒", label: "Hockey", wins: 0 },
  { id: "boxing", icon: "🥊", label: "Boxing", wins: 0 },
  { id: "tennis", icon: "🎾", label: "Tennis", wins: 0 },
  { id: "athletics", icon: "🏃", label: "Athletics", wins: 0 },
];

export function scoutRank(solved: number): string {
  if (solved >= 11) return "Chief of Intel 🎖️";
  if (solved >= 6) return "Master Historian 🥇";
  if (solved >= 3) return "Tactical Analyst 🥈";
  return "Rookie Scout 🥉";
}

export function emptyStreak(): StreakData {
  return { currentStreak: 0, maxStreak: 0, lastPlayedDate: "" };
}

export function parseStreakData(raw: string | null): StreakData {
  if (!raw) return emptyStreak();
  try {
    const parsed = JSON.parse(raw) as Partial<StreakData>;
    const currentStreak = numberOf(parsed.currentStreak);
    const maxStreak = Math.max(numberOf(parsed.maxStreak), currentStreak);
    const lastPlayedDate = typeof parsed.lastPlayedDate === "string" && DATE_KEY.test(parsed.lastPlayedDate) ? parsed.lastPlayedDate : "";
    return { currentStreak, maxStreak, lastPlayedDate };
  } catch {
    return emptyStreak();
  }
}

export function parseScoutHistory(raw: string | null): ScoutMatch[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const matches: ScoutMatch[] = [];
  const covered = new Set<string>();
  for (const item of parsed) {
    const match = matchFromUnknown(item);
    if (!match) continue;
    matches.push(match);
    if (match.date) covered.add(`${match.date}:${match.id}`);
  }
  for (const item of parsed) {
    if (typeof item !== "string" || !DATE_KEY.test(item) || covered.has(`${item}:${item}`)) continue;
    matches.push({
      id: item,
      date: item,
      sport: "",
      score: 0,
      tilesUnlocked: 0,
      won: true,
      timestamp: 0,
    });
  }
  return matches;
}

export function nextStreakData(current: StreakData, match: ScoutMatch): StreakData {
  if (!match.won) {
    return { ...current, currentStreak: 0, lastPlayedDate: match.date || current.lastPlayedDate };
  }
  if (current.lastPlayedDate === match.date && current.currentStreak > 0) {
    return { ...current, maxStreak: Math.max(current.maxStreak, current.currentStreak) };
  }
  const continued = Boolean(current.lastPlayedDate) && shiftUtcDateKey(current.lastPlayedDate, 1) === match.date;
  const currentStreak = continued ? current.currentStreak + 1 : 1;
  return {
    currentStreak,
    maxStreak: Math.max(current.maxStreak, currentStreak),
    lastPlayedDate: match.date,
  };
}

export function aggregateScoutStats(
  matches: readonly ScoutMatch[],
  streak: StreakData,
  club: PremierLeagueClub | null,
): ScoutStats {
  const played = matches.length;
  const wonMatches = matches.filter((match) => match.won);
  const won = wonMatches.length;
  const intelPoints = wonMatches.reduce((sum, match) => sum + Math.max(0, match.score), 0);
  const revealed = wonMatches.filter((match) => match.tilesUnlocked >= 1 && match.tilesUnlocked <= 5);
  const averageClues = revealed.length === 0 ? 0 : round1(revealed.reduce((sum, match) => sum + match.tilesUnlocked, 0) / revealed.length);
  const distribution = TILES.map((label, index) => ({
    tile: index + 1,
    label,
    count: revealed.filter((match) => match.tilesUnlocked === index + 1).length,
  }));
  const sports = SPORT_PILLS.map((pill) => ({
    ...pill,
    wins: wonMatches.filter((match) => sportPillId(match.sport) === pill.id).length,
  }));
  return {
    played,
    won,
    winRate: played === 0 ? 0 : Math.round((won / played) * 100),
    currentStreak: streak.currentStreak,
    maxStreak: Math.max(streak.maxStreak, streak.currentStreak),
    intelPoints,
    averageClues,
    rank: scoutRank(won),
    distribution,
    sports,
    club,
    clubPoints: club ? intelPoints : 0,
  };
}

export function readScoutDossier(now = new Date()): ScoutStats {
  if (typeof window === "undefined") return aggregateScoutStats([], emptyStreak(), null);
  const matches = parseScoutHistory(window.localStorage.getItem(SOLVED_HISTORY_KEY));
  let streak = parseStreakData(window.localStorage.getItem(STREAK_DATA_KEY));
  if (!streak.lastPlayedDate && streak.currentStreak === 0) {
    const dates = loadSolvedHistory();
    const today = utcDateKey(now);
    const current = activeStreak(dates, today);
    const stored = Number(window.localStorage.getItem("shc_streak"));
    const currentStreak = Number.isFinite(stored) && stored > 0 ? stored : current;
    streak = { currentStreak, maxStreak: currentStreak, lastPlayedDate: dates.at(-1) ?? "" };
  }
  const club = findPremierLeagueClub(window.localStorage.getItem(FAVORITE_CLUB_KEY));
  return aggregateScoutStats(matches, streak, club);
}

export function recordScoutMatch(match: Omit<ScoutMatch, "timestamp"> & { timestamp?: number }): void {
  if (typeof window === "undefined" || !match.id) return;
  const stored: ScoutMatch = { ...match, timestamp: match.timestamp && match.timestamp > 0 ? match.timestamp : Date.now() };
  const current = readRawHistory();
  const duplicate = current.some((item) => {
    if (!item || typeof item !== "object") return false;
    const row = item as Partial<ScoutMatch>;
    return row.id === stored.id && row.date === stored.date && row.won === stored.won && typeof row.tilesUnlocked === "number";
  });
  if (!duplicate) current.push(stored);
  window.localStorage.setItem(SOLVED_HISTORY_KEY, JSON.stringify(current));
  const streak = nextStreakData(parseStreakData(window.localStorage.getItem(STREAK_DATA_KEY)), stored);
  window.localStorage.setItem(STREAK_DATA_KEY, JSON.stringify(streak));
}

function readRawHistory(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SOLVED_HISTORY_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function matchFromUnknown(item: unknown): ScoutMatch | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const row = item as Record<string, unknown>;
  const id = text(row.id) || text(row.challengeId);
  if (!id) return null;
  const date = text(row.date) || text(row.dropDate) || text(row.fixture_date);
  const won = typeof row.won === "boolean" ? row.won : true;
  return {
    id,
    date: DATE_KEY.test(date) ? date : "",
    sport: text(row.sport),
    score: numberOf(row.score),
    tilesUnlocked: numberOf(row.tilesUnlocked),
    won,
    timestamp: numberOf(row.timestamp),
  };
}

function sportPillId(sport: string): string {
  const canonical = canonicalSport(sport);
  if (canonical === "ice_hockey") return "hockey";
  if (canonical === "football" || canonical === "boxing" || canonical === "tennis" || canonical === "athletics") {
    return canonical;
  }
  return "";
}

function numberOf(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
