import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { mapProfile, type ProfileRow } from '@/lib/standings-source';

const LEGEND_FOLLOW_KEY = "shc_legend_follows";

export function isLegendTarget(id: string): boolean {
  return /^legend-[a-z0-9-]{1,40}$/.test(id);
}

function readLocalLegendFollows(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGEND_FOLLOW_KEY);
    const parsed = raw ? JSON.parse(raw) as unknown : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && isLegendTarget(id)) : [];
  } catch {
    return [];
  }
}

function writeLocalLegendFollows(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEGEND_FOLLOW_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    // The in-memory follow state still updates the button.
  }
}

export interface ScoutProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  streak: number | null;
  total_score: number | null;
}

/**
 * Follow graph tables. `scout_follows` is the current table; `scout_connections`
 * is the older name some projects still run. Both store one row per follow.
 */
export type FollowTable = "scout_follows" | "scout_connections";

interface FollowColumns {
  follower: string;
  following: string;
}

export const FOLLOW_COLUMNS: Record<FollowTable, FollowColumns> = {
  scout_follows: { follower: "follower_id", following: "following_id" },
  scout_connections: { follower: "user_id", following: "connected_user_id" },
};

const FOLLOW_ORDER: FollowTable[] = ["scout_follows", "scout_connections"];

export interface FollowError {
  code?: string;
  message?: string;
}

interface FollowResult {
  data: Array<Record<string, unknown>> | null;
  error: FollowError | null;
}

interface FollowFilter {
  eq(column: string, value: string): FollowFilter & PromiseLike<FollowResult>;
}

export interface FollowClient {
  from(table: FollowTable): {
    select(columns: string): FollowFilter;
    insert(row: Record<string, string>): PromiseLike<FollowResult>;
    delete(): FollowFilter;
  };
}

/** PostgREST reports an unknown table as PGRST205; Postgres as 42P01. */
export function isMissingTable(error: FollowError | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  const text = (error.message ?? "").toLowerCase();
  return text.includes("could not find the table") || text.includes("does not exist");
}

let resolvedTable: FollowTable | null = null;

/** Test hook. Production code never needs it. */
export function resetFollowTable() {
  resolvedTable = null;
}

function followClient(): FollowClient {
  return supabaseClient as unknown as FollowClient;
}

async function withFollowTable<T>(
  run: (table: FollowTable, columns: FollowColumns) => Promise<{ value: T; error: FollowError | null }>,
): Promise<T> {
  const candidates = resolvedTable ? [resolvedTable] : FOLLOW_ORDER;
  let lastError: FollowError | null = null;
  for (const table of candidates) {
    const { value, error } = await run(table, FOLLOW_COLUMNS[table]);
    if (!error) {
      resolvedTable = table;
      return value;
    }
    lastError = error;
    if (!isMissingTable(error)) break;
  }
  throw lastError ?? new Error("Follow graph unavailable");
}

export async function followScout(currentUserId: string, targetUserId: string, client: FollowClient = followClient()) {
  await withFollowTable(async (table, columns) => {
    const { error } = await client
      .from(table)
      .insert({ [columns.follower]: currentUserId, [columns.following]: targetUserId });
    // A duplicate follow is already the state the player asked for.
    return { value: undefined, error: error && error.code !== "23505" ? error : null };
  });
}

export async function unfollowScout(currentUserId: string, targetUserId: string, client: FollowClient = followClient()) {
  await withFollowTable(async (table, columns) => {
    const { error } = await client
      .from(table)
      .delete()
      .eq(columns.follower, currentUserId)
      .eq(columns.following, targetUserId);
    return { value: undefined, error };
  });
}

export async function getFollowingIds(currentUserId: string, client: FollowClient = followClient()): Promise<string[]> {
  return withFollowTable(async (table, columns) => {
    const { data, error } = await client.from(table).select(columns.following).eq(columns.follower, currentUserId);
    const ids = (data ?? []).flatMap((row) => {
      const id = row[columns.following];
      return typeof id === "string" ? [id] : [];
    });
    return { value: ids, error };
  });
}

export async function listFollowedIds(currentUserId: string): Promise<string[]> {
  const local = readLocalLegendFollows();
  let scouts: string[] = [];
  try {
    scouts = await getFollowingIds(currentUserId);
  } catch (error) {
    console.error(error);
  }
  let legends: string[] = [];
  if (isSupabaseConfigured) {
    const { data, error } = await supabaseClient
      .from("legend_follows")
      .select("legend_id")
      .eq("user_id", currentUserId);
    if (error) {
      if (!isMissingTable(error)) console.error(error);
    } else {
      legends = (data ?? []).flatMap((row) => (typeof row.legend_id === "string" ? [row.legend_id] : []));
    }
  }
  return [...new Set([...scouts, ...legends, ...local])];
}

export async function followTarget(currentUserId: string, targetId: string): Promise<boolean> {
  if (!currentUserId || currentUserId === targetId) return false;
  if (isLegendTarget(targetId)) {
    writeLocalLegendFollows([...readLocalLegendFollows(), targetId]);
    if (!isSupabaseConfigured) return true;
    const { error } = await supabaseClient.from("legend_follows").insert({ user_id: currentUserId, legend_id: targetId });
    if (error && error.code !== "23505") console.error(error);
    return true;
  }
  try {
    await followScout(currentUserId, targetId);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function unfollowTarget(currentUserId: string, targetId: string): Promise<boolean> {
  if (isLegendTarget(targetId)) {
    writeLocalLegendFollows(readLocalLegendFollows().filter((id) => id !== targetId));
    if (!isSupabaseConfigured) return true;
    const { error } = await supabaseClient
      .from("legend_follows")
      .delete()
      .eq("user_id", currentUserId)
      .eq("legend_id", targetId);
    if (error) console.error(error);
    return true;
  }
  try {
    await unfollowScout(currentUserId, targetId);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/** A profiles row reduced to what the network cards show. Score and handle resolve across column layouts. */
export function toScoutProfile(row: ProfileRow): ScoutProfile {
  const mapped = mapProfile(row);
  return {
    id: mapped.id,
    username: mapped.username,
    avatar_url: mapped.avatar_url,
    streak: mapped.streak,
    total_score: mapped.total_score,
  };
}

function profileRows(data: unknown): ProfileRow[] {
  return ((Array.isArray(data) ? data : []) as unknown[]).filter(
    (row): row is ProfileRow => Boolean(row) && typeof (row as ProfileRow).id === "string",
  );
}

/** Every followed scout's profile row, including members who have not scored yet. */
export async function loadScoutProfiles(ids: string[]): Promise<ScoutProfile[]> {
  const profileIds = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (profileIds.length === 0 || !isSupabaseConfigured) return [];
  const { data, error } = await supabaseClient.from("profiles").select("*").in("id", profileIds);
  if (error) {
    console.error(error);
    return [];
  }
  return profileRows(data)
    .map(toScoutProfile)
    .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0) || (a.username ?? "").localeCompare(b.username ?? ""));
}

export async function searchScouts(query: string, currentUserId?: string): Promise<ScoutProfile[]> {
  const needle = query.trim().replace(/^@/, '');
  if (!needle) return [];

  let request = supabaseClient
    .from('profiles')
    .select('*')
    .ilike('username', `%${needle}%`)
    .limit(10);

  if (currentUserId) {
    request = request.neq('id', currentUserId);
  }

  const { data, error } = await request;
  if (error) throw error;
  return profileRows(data).map(toScoutProfile);
}
