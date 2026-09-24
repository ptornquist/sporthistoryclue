import { supabaseClient } from '@/lib/supabase/client';

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
