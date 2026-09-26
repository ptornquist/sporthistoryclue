import { CASE_FILES } from "@/lib/case-files";

export interface DuelRecord {
  id: string;
  created_at: string;
  challenge_id: string;
  challenger_username: string;
  challenger_score: number;
  opponent_username: string;
  opponent_score: number;
  winner_username: string;
}

export type DuelOutcome = "victory" | "defeat" | "draw";

const HANDLE = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,39}$/;
const CHALLENGE = /^[A-Za-z0-9_-]{1,80}$/;

export function cleanHandle(value: string): string {
  return value.replace(/^@/, "").trim().slice(0, 40);
}

export function duelHandleName(name: string): string {
  const handle = cleanHandle(name);
  if (!handle || /^scout$/i.test(handle)) return "Guest Scout";
  return handle;
}

export function validHandle(value: string): boolean {
  return HANDLE.test(value);
}

export function validChallengeId(value: string): boolean {
  return CHALLENGE.test(value);
}

export function validScore(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 100000;
}

export function decideWinner(
  challengerUsername: string,
  challengerScore: number,
  opponentUsername: string,
  opponentScore: number,
): string {
  if (challengerScore === opponentScore) return "TIE";
  return challengerScore > opponentScore ? challengerUsername : opponentUsername;
}

export function outcomeFor(viewer: string, duel: Pick<DuelRecord, "winner_username">): DuelOutcome {
  if (duel.winner_username.toUpperCase() === "TIE") return "draw";
  return duel.winner_username.toLowerCase() === cleanHandle(viewer).toLowerCase() ? "victory" : "defeat";
}

export function sidesFor(viewer: string, duel: DuelRecord): { you: number; them: number; opponent: string } {
  const handle = cleanHandle(viewer).toLowerCase();
  if (duel.opponent_username.toLowerCase() === handle) {
    return { you: duel.opponent_score, them: duel.challenger_score, opponent: duel.challenger_username };
  }
  return { you: duel.challenger_score, them: duel.opponent_score, opponent: duel.opponent_username };
}

export function formatAgo(iso: string, now: Date): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "just now";
  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return days === 1 ? "1 day ago" : `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function pickRematchSlug(playedIds: string[], random: () => number = Math.random): string {
  const played = new Set(playedIds);
  const open = CASE_FILES.filter((file) => !played.has(file.slug) && !file.ids.some((id) => played.has(id)));
  const pool = open.length > 0 ? open : CASE_FILES;
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)));
  return pool[index]?.slug ?? CASE_FILES[0].slug;
}

export function rematchLink(username: string, score: number, slug: string): string {
  const handle = cleanHandle(username) || "Guest Scout";
  const points = Math.max(0, Math.round(score));
  return `https://sportshistoryclue.com/?match=${encodeURIComponent(slug)}&duel=${encodeURIComponent(handle)}&pts=${points}`;
}

export function duelPrompt(opponent: string, playerScore: number, opponentScore: number): string {
  const handle = cleanHandle(opponent);
  const diff = Math.abs(playerScore - opponentScore).toLocaleString();
  if (playerScore > opponentScore) return `⚔️ You defeated @${handle} by +${diff} PTS!`;
  if (playerScore < opponentScore) return `⚔️ Defeated by @${handle} (-${diff} PTS)`;
  return `⚔️ Draw with @${handle}`;
}

export const DUEL_INBOX_KEY = "shc_duel_inbox";

export function readDuelInbox(): DuelRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DUEL_INBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDuelRecord).slice(0, 20);
  } catch {
    return [];
  }
}

export function rememberDuel(record: DuelRecord): DuelRecord[] {
  const next = [record, ...readDuelInbox().filter((row) => row.id !== record.id)].slice(0, 20);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DUEL_INBOX_KEY, JSON.stringify(next));
  }
  return next;
}

export function mergeDuels(remote: DuelRecord[], local: DuelRecord[]): DuelRecord[] {
  const seen = new Set<string>();
  const merged: DuelRecord[] = [];
  for (const row of [...remote, ...local]) {
    if (!isDuelRecord(row) || seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(row);
  }
  return merged
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);
}

function isDuelRecord(value: unknown): value is DuelRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as DuelRecord;
  return typeof row.id === "string" && typeof row.challenger_username === "string" && typeof row.opponent_username === "string";
}
