import { clubError, clubSession } from "@/lib/club-api";
import {
  normalizeClubCode,
  normalizeClubName,
  normalizeShareLabel,
  type ClubRole,
  type ClubSummary,
} from "@/lib/clubs";

export const dynamic = "force-dynamic";

interface ClubEmbed {
  id: string;
  name: string;
  code: string;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function asRole(value: unknown): ClubRole {
  return value === "owner" ? "owner" : "member";
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const json = await request.json();
    if (!json || typeof json !== "object") return null;
    return json as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await clubSession();
  if (!session) return Response.json({ error: "Clubs are unavailable" }, { status: 503 });
  if (!session.user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const { data, error } = await session.supabase
    .from("club_members")
    .select("role, club_id, clubs(id, name, code)")
    .eq("user_id", session.user.id);

  if (error) return Response.json({ clubs: [] });

  const rows = (data ?? []) as unknown as Array<{ role: string; club_id: string; clubs: ClubEmbed | ClubEmbed[] | null }>;
  const clubs = rows
    .map((row) => {
      const club = one(row.clubs);
      if (!club) return null;
      return { id: club.id, name: club.name, code: club.code, role: asRole(row.role), memberCount: 0 };
    })
    .filter((club): club is ClubSummary => club != null);

  if (clubs.length === 0) return Response.json({ clubs: [] });

  const { data: memberships } = await session.supabase
    .from("club_members")
    .select("club_id")
    .in(
      "club_id",
      clubs.map((club) => club.id),
    );
  const counts = new Map<string, number>();
  for (const row of (memberships ?? []) as Array<{ club_id: string }>) {
    counts.set(row.club_id, (counts.get(row.club_id) ?? 0) + 1);
  }

  return Response.json({
    clubs: clubs
      .map((club) => ({ ...club, memberCount: counts.get(club.id) ?? 1 }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  });
}

const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createFailure(error: { message?: string } | null | undefined, fallback: string) {
  return Response.json({ success: false, error: error?.message || fallback }, { status: 400 });
}

async function createClub(
  session: Awaited<ReturnType<typeof clubSession>>,
  body: Record<string, unknown>,
) {
  const name = typeof body.name === "string" ? normalizeClubName(body.name) : null;
  if (!name) return Response.json({ success: false, error: "Check the club name" }, { status: 400 });

  const bodyUserId = typeof body.userId === "string" ? body.userId.trim() : "";
  const userId = session?.user?.id || bodyUserId;
  if (!USER_ID.test(userId)) {
    return Response.json({ success: false, error: "Sign in required" }, { status: 400 });
  }
  if (!session) {
    return Response.json({ success: false, error: "Clubs are unavailable" }, { status: 400 });
  }

  let lastMessage = "Failed to create club";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) continue;

    const inserted = await session.supabase
      .from("clubs")
      .insert({ name, code, owner_id: userId })
      .select("id, name, code, owner_id")
      .single();
    if (inserted.error || !inserted.data) {
      lastMessage = inserted.error?.message || lastMessage;
      const duplicate = inserted.error?.code === "23505" || lastMessage.toLowerCase().includes("duplicate");
      if (duplicate) continue;
      return createFailure(inserted.error, lastMessage);
    }

    const newClub = inserted.data as { id: string; name: string; code: string; owner_id: string };
    const member = await session.supabase.from("club_members").insert({
      club_id: newClub.id,
      user_id: userId,
      role: "owner",
    });
    if (member.error) return createFailure(member.error, member.error.message);

    try {
      const profile = await session.supabase.from("profiles").update({ club_id: newClub.id }).eq("id", userId);
      if (profile.error) {
        // The club and owner row already exist. A missing profiles.club_id column must not undo that.
      }
    } catch {
      // Profile bookkeeping is optional.
    }

    return Response.json({ success: true, club: newClub }, { status: 200 });
  }

  return Response.json({ success: false, error: lastMessage }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  const action = typeof body.action === "string" ? body.action : "";
  const session = await clubSession();

  if (action === "create") {
    return createClub(session, body);
  }

  if (!session) return Response.json({ error: "Clubs are unavailable" }, { status: 503 });
  if (!session.user) return Response.json({ error: "Sign in required" }, { status: 401 });

  if (action === "join") {
    const code = typeof body.code === "string" ? normalizeClubCode(body.code) : null;
    if (!code) return Response.json({ error: "Check the club name or code" }, { status: 400 });
    const { data, error } = await session.supabase.rpc("join_club_by_code", { join_code: code });
    if (error || !data || typeof data !== "object") {
      const mapped = clubError(error?.message ?? "club not found");
      return Response.json({ error: mapped.error }, { status: mapped.status });
    }
    const joined = data as { id?: string; name?: string; code?: string; role?: string };
    return Response.json({
      club: {
        id: joined.id,
        name: joined.name,
        code: joined.code,
        role: asRole(joined.role),
      },
    });
  }

  if (action === "share") {
    const label = typeof body.matchTitle === "string" ? normalizeShareLabel(body.matchTitle) : null;
    const score = typeof body.userScore === "number" && Number.isFinite(body.userScore) ? Math.floor(body.userScore) : 0;
    if (!label || score < 0 || score > 100000) {
      return Response.json({ error: "Check the club name or code" }, { status: 400 });
    }
    const { data, error } = await session.supabase.rpc("share_club_challenge", { label, score });
    if (error) {
      const mapped = clubError(error.message);
      return Response.json({ error: mapped.error }, { status: mapped.status });
    }
    const shared = typeof data === "number" ? data : 0;
    if (shared < 1) {
      return Response.json({ error: "Join a club before sharing this match." }, { status: 404 });
    }
    return Response.json({ success: true, clubs: shared });
  }

  return Response.json({ error: "Invalid JSON" }, { status: 400 });
}
