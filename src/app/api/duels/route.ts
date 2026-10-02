import {
  cleanHandle,
  decideWinner,
  validChallengeId,
  validHandle,
  validScore,
  type DuelRecord,
} from "@/lib/duels";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const memory: DuelRecord[] = [];

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = json as {
    challengeId?: unknown;
    challengerUsername?: unknown;
    challengerScore?: unknown;
    opponentUsername?: unknown;
    opponentScore?: unknown;
  };
  const challengeId = typeof body.challengeId === "string" ? body.challengeId.trim() : "";
  const challengerUsername = typeof body.challengerUsername === "string" ? cleanHandle(body.challengerUsername) : "";
  const opponentUsername = typeof body.opponentUsername === "string" ? cleanHandle(body.opponentUsername) : "";
  const challengerScore = Number(body.challengerScore);
  const opponentScore = Number(body.opponentScore);

  if (!validChallengeId(challengeId) || !validHandle(challengerUsername) || !validHandle(opponentUsername)) {
    return Response.json({ error: "Invalid duel" }, { status: 400 });
  }
  if (!validScore(challengerScore) || !validScore(opponentScore)) {
    return Response.json({ error: "Invalid score" }, { status: 400 });
  }

  const winnerUsername = decideWinner(challengerUsername, challengerScore, opponentUsername, opponentScore);
  const row = {
    challenge_id: challengeId,
    challenger_username: challengerUsername,
    challenger_score: challengerScore,
    opponent_username: opponentUsername,
    opponent_score: opponentScore,
    winner_username: winnerUsername,
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase.from("duels").insert(row).select("id").single();
      if (error || !data?.id) {
        return Response.json({ error: "Could not save duel" }, { status: 500 });
      }
      return Response.json({ success: true, duelId: data.id });
    } catch {
      return Response.json({ error: "Could not save duel" }, { status: 500 });
    }
  }

  const record: DuelRecord = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...row,
  };
  memory.unshift(record);
  if (memory.length > 200) memory.length = 200;
  return Response.json({ success: true, duelId: record.id });
}

export async function GET(request: Request) {
  const username = cleanHandle(new URL(request.url).searchParams.get("username") ?? "");
  if (!validHandle(username)) {
    return Response.json({ error: "Invalid username" }, { status: 400 });
  }

  if (isSupabaseConfigured) {
    try {
      const supabase = createPublicSupabaseClient();
      const needle = username.replace(/[%_,]/g, "");
      const { data, error } = await supabase
        .from("duels")
        .select("id, created_at, challenge_id, challenger_username, challenger_score, opponent_username, opponent_score, winner_username")
        .or(`challenger_username.ilike.${needle},opponent_username.ilike.${needle}`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return Response.json({ duels: [] });
      return Response.json({ duels: data ?? [] });
    } catch {
      return Response.json({ duels: [] });
    }
  }

  const handle = username.toLowerCase();
  const duels = memory
    .filter(
      (row) =>
        row.challenger_username.toLowerCase() === handle || row.opponent_username.toLowerCase() === handle,
    )
    .slice(0, 20);
  return Response.json({ duels });
}
