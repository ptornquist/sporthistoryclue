import { clubSession } from "@/lib/club-api";
import { activityLine, isClubId, rankClubMembers, type ClubRole, type ClubSummary } from "@/lib/clubs";

export const dynamic = "force-dynamic";

interface ProfileEmbed {
  username: string | null;
  total_score: number | null;
  streak: number | null;
  matches_solved: number | null;
  equipped_title: string | null;
  equipped_frame: string | null;
  avatar_url: string | null;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function asRole(value: unknown): ClubRole {
  return value === "owner" ? "owner" : "member";
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isClubId(id)) return Response.json({ error: "Club not found" }, { status: 404 });

  const session = await clubSession();
  if (!session) return Response.json({ error: "Clubs are unavailable" }, { status: 503 });
  if (!session.user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const { data: mine } = await session.supabase
    .from("club_members")
    .select("role, clubs(id, name, code)")
    .eq("club_id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  const membership = mine as { role?: string; clubs?: { id: string; name: string; code: string } | Array<{ id: string; name: string; code: string }> | null } | null;
  const clubRow = one(membership?.clubs ?? null);
  if (!membership || !clubRow) return Response.json({ error: "Club not found" }, { status: 404 });

  const { data: people } = await session.supabase
    .from("club_members")
    .select("role, user_id, profiles(username, total_score, streak, matches_solved, equipped_title, equipped_frame, avatar_url)")
    .eq("club_id", id);

  const { data: events } = await session.supabase
    .from("club_activity")
    .select("id, kind, label, score, profiles(username)")
    .eq("club_id", id)
    .order("created_at", { ascending: false })
    .limit(8);

  const members = rankClubMembers(
    ((people ?? []) as unknown as Array<{ role?: string; user_id?: string; profiles?: ProfileEmbed | ProfileEmbed[] | null }>).flatMap(
      (row) => {
        if (!row.user_id) return [];
        const profile = one(row.profiles);
        return [
          {
            id: row.user_id,
            username: (profile?.username || "Scout").replace(/^@/, ""),
            totalScore: profile?.total_score ?? 0,
            streak: profile?.streak ?? 0,
            matchesSolved: profile?.matches_solved ?? 0,
            equippedTitle: profile?.equipped_title ?? null,
            equippedFrame: profile?.equipped_frame ?? null,
            avatarUrl: profile?.avatar_url ?? null,
            role: asRole(row.role),
          },
        ];
      },
    ),
  );

  const activity = ((events ?? []) as unknown as Array<{
    id?: string;
    kind?: string;
    label?: string;
    score?: number;
    profiles?: { username: string | null } | Array<{ username: string | null }> | null;
  }>).flatMap((row) => {
    if (!row.id || !row.label) return [];
    const profile = one(row.profiles);
    return [
      {
        id: row.id,
        line: activityLine({
          username: profile?.username || "Scout",
          kind: row.kind === "challenge" ? "challenge" : "solve",
          label: row.label,
          score: row.score ?? 0,
        }),
      },
    ];
  });

  const club: ClubSummary = {
    id: clubRow.id,
    name: clubRow.name,
    code: clubRow.code,
    role: asRole(membership.role),
    memberCount: members.length,
  };

  return Response.json({ club, members, activity });
}
