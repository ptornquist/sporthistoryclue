import { supabaseClient } from '@/lib/supabase/client';

export interface ScoutProfile {
  id: string;
  username: string | null;
  avatar_url?: string | null;
  streak?: number | null;
  total_score?: number | null;
  career_score?: number | null;
  fixtures_cleared?: number | null;
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

interface ScoutSearchClient {
  from: (table: "profiles") => {
    select: (columns: "id, username, career_score, fixtures_cleared") => {
      ilike: (
        column: "username",
        pattern: string,
      ) => {
        neq: (column: "id", value: string) => ScoutSearchLimit;
        limit: (count: number) => PromiseLike<{ data: ScoutProfile[] | null; error: { message?: string } | null }>;
      };
    };
  };
}

interface ScoutSearchLimit {
  limit: (count: number) => PromiseLike<{ data: ScoutProfile[] | null; error: { message?: string } | null }>;
}

function searchClient(): ScoutSearchClient {
  return supabaseClient as unknown as ScoutSearchClient;
}

export function cleanScoutQuery(query: string): string {
  return query.trim().replace(/^@/, "");
}

export async function searchScouts(
  query: string,
  currentUserId?: string,
  supabase: ScoutSearchClient = searchClient(),
): Promise<ScoutProfile[]> {
  const cleanTerm = cleanScoutQuery(query);
  if (!cleanTerm) return [];

  const matched = supabase
    .from("profiles")
    .select("id, username, career_score, fixtures_cleared")
    .ilike("username", `%${cleanTerm}%`);

  const limited = currentUserId ? matched.neq("id", currentUserId) : matched;
  const { data, error } = await limited.limit(10);
  if (error) throw error;
  return data ?? [];
}
