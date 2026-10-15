import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';

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

export async function followScout(currentUserId: string, targetUserId: string) {
  const { error } = await supabaseClient.from('scout_connections').insert({
    user_id: currentUserId,
    connected_user_id: targetUserId,
  });
  if (error) throw error;
}

export async function unfollowScout(currentUserId: string, targetUserId: string) {
  const { error } = await supabaseClient
    .from('scout_connections')
    .delete()
    .eq('user_id', currentUserId)
    .eq('connected_user_id', targetUserId);
  if (error) throw error;
}

export async function getFollowingIds(currentUserId: string): Promise<string[]> {
  const { data, error } = await supabaseClient
    .from('scout_connections')
    .select('connected_user_id')
    .eq('user_id', currentUserId);
  if (error) throw error;
  return (data ?? []).map((row) => row.connected_user_id as string);
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
    if (error) console.error(error);
    else legends = (data ?? []).flatMap((row) => (typeof row.legend_id === "string" ? [row.legend_id] : []));
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

export async function searchScouts(query: string, currentUserId?: string): Promise<ScoutProfile[]> {
  const needle = query.trim().replace(/^@/, '');
  if (!needle) return [];

  let request = supabaseClient
    .from('profiles')
    .select('id, username, avatar_url, streak, total_score')
    .ilike('username', `%${needle}%`)
    .limit(10);

  if (currentUserId) {
    request = request.neq('id', currentUserId);
  }

  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []) as ScoutProfile[];
}
