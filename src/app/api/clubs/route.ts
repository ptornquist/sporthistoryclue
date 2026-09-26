import { clubError, clubSession } from "@/lib/club-api";
import {
  generateClubCode,
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

export async function POST(request: Request) {
  const session = await clubSession();
  if (!session) return Response.json({ error: "Clubs are unavailable" }, { status: 503 });
  if (!session.user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const body = await readJson(request);
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "create") {
    const name = typeof body.name === "string" ? normalizeClubName(body.name) : null;
    if (!name) return Response.json({ error: "Check the club name or code" }, { status: 400 });

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = generateClubCode(crypto.getRandomValues(new Uint8Array(6)));
      const { data, error } = await session.supabase.rpc("create_scout_club", {
        club_name: name,
        club_code: code,
      });
      if (!error && data && typeof data === "object") {
        const created = data as { id?: string; name?: string; code?: string; role?: string };
        return Response.json({
          club: {
            id: created.id,
            name: created.name,
            code: created.code,
            role: asRole(created.role),
            memberCount: 1,
          },
        });
      }
      if (!error?.message?.includes("code taken")) {
        const mapped = clubError(error?.message ?? "");
        return Response.json({ error: mapped.error }, { status: mapped.status });
      }
    }
    return Response.json({ error: "Could not update the club" }, { status: 500 });
  }

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
