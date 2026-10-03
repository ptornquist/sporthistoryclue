import { resolveUnlockedBadges, type UnlockedAccolade } from "@/lib/scout-badges";

export interface PublicScoutProfile {
  id: string;
  username: string | null;
  career_score: number | null;
  fixtures_cleared: number | null;
  created_at: string | null;
}

export interface PublicScoutRecord {
  profile: PublicScoutProfile;
  badges: UnlockedAccolade[];
}

export interface ScoutActionState {
  showActions: boolean;
  viewerId: string | null;
  viewerScore: number;
  following: boolean;
}

interface QueryError {
  message?: string;
}

interface ProfileLookup {
  maybeSingle: () => PromiseLike<{ data: PublicScoutProfile | null; error: QueryError | null }>;
}

interface BadgeLookup extends PromiseLike<{ data: { badge_id: string; unlocked_at?: string | null }[] | null; error: QueryError | null }> {
  eq: (column: string, value: string) => BadgeLookup;
}

interface ViewerRow {
  username?: string | null;
  career_score?: number | null;
}

interface ViewerFilter {
  eq: (column: string, value: string) => ViewerFilter;
  maybeSingle: () => PromiseLike<{ data: ViewerRow | null; error: QueryError | null }>;
}

interface PublicScoutClient {
  from: (table: "profiles" | "user_badges") => {
    select: (columns: string) => {
      ilike: (column: "username", value: string) => ProfileLookup;
      eq: (column: string, value: string) => BadgeLookup;
    };
  };
}

interface ViewerClient {
  auth: {
    getUser: () => PromiseLike<{ data: { user: { id: string } | null } }>;
  };
  from: (table: "profiles" | "scout_follows") => {
    select: (columns: string) => ViewerFilter;
  };
}

/** A scout name the player can save. Empty or oversized names are rejected. */
export function normalizeScoutName(raw: string): string | null {
  const handle = raw.trim().replace(/^@+/, "").trim();
  if (!handle || handle.length > 40) return null;
  if (/[\u0000-\u001f]/.test(handle)) return null;
  return handle;
}

export function cleanScoutHandle(raw: string | null | undefined): string {
  if (!raw) return "";
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  return decoded.replace(/^@/, "").trim();
}

export function scoutProfilePath(username: string | null | undefined): string | null {
  const handle = cleanScoutHandle(username);
  if (!handle) return null;
  return `/scout/${encodeURIComponent(handle)}`;
}

export function formatCareerPoints(score: number | null | undefined): string {
  return `${(score || 0).toLocaleString("en-US")} poäng`;
}

export function sameScout(left: string | null | undefined, right: string | null | undefined): boolean {
  const a = cleanScoutHandle(left).toLowerCase();
  const b = cleanScoutHandle(right).toLowerCase();
  return Boolean(a) && a === b;
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function findProfile(client: PublicScoutClient, username: string): Promise<PublicScoutProfile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, username, career_score, fixtures_cleared, created_at")
    .ilike("username", escapeIlike(username))
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function loadPublicScout(
  supabase: unknown,
  rawUsername: string,
): Promise<PublicScoutRecord | null> {
  const cleanUsername = cleanScoutHandle(rawUsername);
  if (!cleanUsername) return null;

  const client = supabase as PublicScoutClient;
  const profile =
    (await findProfile(client, cleanUsername)) ??
    (await findProfile(client, `@${cleanUsername}`));
  if (!profile?.id) return null;

  const { data: badges, error } = await client
    .from("user_badges")
    .select("badge_id, unlocked_at")
    .eq("user_id", profile.id);

  return {
    profile,
    badges: resolveUnlockedBadges(error ? [] : badges),
  };
}

export async function loadScoutActions(
  supabase: unknown,
  profileId: string,
  profileUsername: string | null,
): Promise<ScoutActionState> {
  const guest: ScoutActionState = {
    showActions: true,
    viewerId: null,
    viewerScore: 0,
    following: false,
  };
  try {
    const client = supabase as ViewerClient;
    const { data } = await client.auth.getUser();
    const user = data.user;
    if (!user) return guest;

    const { data: me } = await client
      .from("profiles")
      .select("username, career_score")
      .eq("id", user.id)
      .maybeSingle();
    const viewerScore = me?.career_score || 0;
    if (sameScout(me?.username, profileUsername)) {
      return { showActions: false, viewerId: user.id, viewerScore, following: false };
    }

    const { data: link } = await client
      .from("scout_follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .eq("following_id", profileId)
      .maybeSingle();

    return {
      showActions: true,
      viewerId: user.id,
      viewerScore,
      following: Boolean(link),
    };
  } catch {
    return guest;
  }
}
