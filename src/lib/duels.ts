import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

export interface DuelRow {
  id: string;
  challenger_username?: string | null;
  opponent_username?: string | null;
  challenger_score?: number | null;
  opponent_score?: number | null;
  winner_username?: string | null;
  challenge_id?: string | null;
  status?: string | null;
  created_at?: string | null;
}

export interface DuelGroups {
  incoming: DuelRow[];
  sent: DuelRow[];
  completed: DuelRow[];
}

interface DuelResult {
  success?: boolean;
  error?: string;
  duel_id?: string;
}

interface QueryError {
  message?: string;
}

interface ReadChain {
  ilike: (column: string, value: string) => ReadChain;
  eq: (column: string, value: string) => ReadChain;
  is: (column: string, value: null) => ReadChain;
  or: (filters: string) => ReadChain;
  order: (
    column: "created_at",
    options: { ascending: boolean },
  ) => PromiseLike<{ data: DuelRow[] | null; error: QueryError | null }>;
  maybeSingle: () => PromiseLike<{ data: DuelRow | null; error: QueryError | null }>;
}

interface DuelClient {
  from: (table: "duels") => {
    select: (columns: "*") => ReadChain;
    update: (row: {
      opponent_score: number;
      winner_username: string;
      status: "completed";
    }) => {
      eq: (column: "id", value: string) => PromiseLike<{ error: QueryError | null }>;
    };
  };
  rpc: (
    fn: "create_user_duel",
    args: { p_opponent_username: string; p_challenge_id: string; p_challenger_score: number },
  ) => PromiseLike<{ data: DuelResult | null; error: QueryError | null }>;
}

function gameClient(): DuelClient {
  return supabaseClient as unknown as DuelClient;
}

export type DuelRecord = {
  id: string;
  challenge_id: string;
  challenger_username: string;
  challenger_score: number;
  opponent_username: string;
  opponent_score?: number | null;
  winner_username?: string | null;
  status?: string;
  created_at?: string;
};

export type DuelOutcome = "victory" | "defeat" | "draw";

export function cleanHandle(handle: string): string {
  return handle.replace(/^@/, "").trim().toLowerCase();
}

export function validHandle(handle: unknown): boolean {
  return typeof handle === "string" && handle.trim().length > 0;
}

export function validChallengeId(id: unknown): boolean {
  return typeof id === "string" && id.trim().length > 0;
}

export function validScore(score: unknown): boolean {
  return typeof score === "number" && !isNaN(score) && score >= 0;
}

export function decideWinner(
  challengerUser: string,
  challengerScore: number,
  opponentUser: string,
  opponentScore: number,
): string {
  if (challengerScore >= opponentScore) return challengerUser;
  return opponentUser;
}

const DUEL_INBOX_KEY = "shc_duel_inbox";

export function readDuelInbox(): DuelRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DUEL_INBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((row) => (isDuelRecord(row) ? [row] : []));
  } catch {
    return [];
  }
}

export function mergeDuels(remote: DuelRecord[], local: DuelRecord[]): DuelRecord[] {
  const seen = new Set<string>();
  const merged: DuelRecord[] = [];
  for (const row of [...remote, ...local]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(row);
  }
  return merged;
}

export function outcomeFor(username: string, duel: DuelRecord): DuelOutcome {
  const you = cleanHandle(username);
  const challengerScore = duel.challenger_score || 0;
  const opponentScore = duel.opponent_score ?? 0;
  if (duel.opponent_score != null && challengerScore === opponentScore) return "draw";
  const winner = cleanHandle(duel.winner_username || decideWinner(
    duel.challenger_username,
    challengerScore,
    duel.opponent_username,
    opponentScore,
  ));
  return winner === you ? "victory" : "defeat";
}

export function sidesFor(username: string, duel: DuelRecord): { opponent: string; you: number; them: number } {
  const you = cleanHandle(username);
  if (cleanHandle(duel.challenger_username) === you) {
    return {
      opponent: duel.opponent_username.replace(/^@/, ""),
      you: duel.challenger_score || 0,
      them: duel.opponent_score ?? 0,
    };
  }
  return {
    opponent: duel.challenger_username.replace(/^@/, ""),
    you: duel.opponent_score ?? 0,
    them: duel.challenger_score || 0,
  };
}

export function pickRematchSlug(playedIds: string[]): string {
  return playedIds.find((id) => id.trim().length > 0) ?? "";
}

export function rematchLink(username: string, score: number, slug: string): string {
  const params = new URLSearchParams({
    duel: cleanHandle(username),
    pts: String(Math.max(0, score || 0)),
  });
  if (slug.trim()) params.set("match", slug.trim());
  return `/?${params.toString()}`;
}

export function formatAgo(iso: string, now: Date): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function isDuelRecord(value: unknown): value is DuelRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as DuelRecord;
  return validHandle(row.id) && validChallengeId(row.challenge_id) && validHandle(row.challenger_username);
}

export function todayChallengeId(now = new Date()): string {
  return now.toISOString().split("T")[0];
}

export function groupDuels(rows: DuelRow[], myUsername: string): DuelGroups {
  const me = cleanHandle(myUsername).toLowerCase();
  const incoming: DuelRow[] = [];
  const sent: DuelRow[] = [];
  const completed: DuelRow[] = [];
  for (const row of rows) {
    if (row.opponent_score != null) {
      completed.push(row);
      continue;
    }
    if (cleanHandle(row.opponent_username ?? "").toLowerCase() === me) incoming.push(row);
    else if (cleanHandle(row.challenger_username ?? "").toLowerCase() === me) sent.push(row);
  }
  return { incoming, sent, completed };
}

export async function loadMyDuels(
  myUsername: string,
  supabase?: DuelClient,
): Promise<DuelRow[]> {
  const client = supabase ?? (isSupabaseConfigured ? gameClient() : null);
  if (!client) return [];
  const handle = cleanHandle(myUsername).replace(/[^a-zA-Z0-9_]/g, "");
  if (!handle) return [];
  const { data, error } = await client
    .from("duels")
    .select("*")
    .or(`challenger_username.ilike.${handle},opponent_username.ilike.${handle}`)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load duels:", error);
    return [];
  }
  return data ?? [];
}

export async function sendDuelChallenge(
  opponentUsername: string,
  careerScore: number,
  challengeId = todayChallengeId(),
  supabase?: DuelClient,
): Promise<{ data: DuelResult | null; error: QueryError | null }> {
  const client = supabase ?? (isSupabaseConfigured ? gameClient() : null);
  if (!client) {
    return { data: { success: false, error: "Could not send challenge" }, error: null };
  }
  try {
    return await client.rpc("create_user_duel", {
      p_opponent_username: cleanHandle(opponentUsername),
      p_challenge_id: challengeId,
      p_challenger_score: careerScore || 0,
    });
  } catch (error) {
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : "Could not send challenge" },
    };
  }
}

export async function completePendingDuel(
  myUsername: string,
  challengeId: string,
  finalScore: number,
  supabase?: DuelClient,
): Promise<void> {
  const client = supabase ?? (isSupabaseConfigured ? gameClient() : null);
  const handle = cleanHandle(myUsername);
  if (!client || !handle || !challengeId) return;
  try {
    const { data: pendingDuel, error } = await client
      .from("duels")
      .select("*")
      .ilike("opponent_username", handle)
      .eq("challenge_id", challengeId)
      .is("opponent_score", null)
      .maybeSingle();
    if (error || !pendingDuel) return;

    const winner =
      finalScore >= (pendingDuel.challenger_score || 0)
        ? handle
        : cleanHandle(pendingDuel.challenger_username ?? "");
    const { error: updateError } = await client
      .from("duels")
      .update({
        opponent_score: finalScore,
        winner_username: winner,
        status: "completed",
      })
      .eq("id", pendingDuel.id);
    if (updateError) console.error("Failed to complete duel:", updateError);
  } catch (error) {
    console.error("Failed to complete duel:", error);
  }
}
