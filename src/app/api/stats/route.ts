import { baselineDistribution, distributionFromRow, type ClueDistribution } from "@/lib/clue-stats";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CHALLENGE_ID = /^[a-z0-9-]{1,80}$/i;
const CLIENT_KEY = /^[a-z0-9]{8,80}$/i;

export async function GET(request: Request) {
  const challengeId = new URL(request.url).searchParams.get("challengeId")?.trim() ?? "";
  if (!CHALLENGE_ID.test(challengeId)) {
    return Response.json({ error: "Invalid challenge" }, { status: 400 });
  }

  const live = await readLiveStats(challengeId);
  return Response.json(live ?? baselineDistribution(challengeId));
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = json as { challengeId?: unknown; clueIndex?: unknown; won?: unknown; clientKey?: unknown };
  const challengeId = typeof body.challengeId === "string" ? body.challengeId.trim() : "";
  const clueIndex = typeof body.clueIndex === "number" ? body.clueIndex : Number(body.clueIndex);
  const won = body.won === true;
  const clientKey = typeof body.clientKey === "string" ? body.clientKey.trim() : "";

  if (!CHALLENGE_ID.test(challengeId) || !CLIENT_KEY.test(clientKey)) {
    return Response.json({ error: "Invalid challenge" }, { status: 400 });
  }
  if (!Number.isInteger(clueIndex) || clueIndex < 0 || clueIndex > 6) {
    return Response.json({ error: "Invalid clue" }, { status: 400 });
  }
  if (won && (clueIndex < 1 || clueIndex > 6)) {
    return Response.json({ error: "Invalid clue" }, { status: 400 });
  }

  const persisted = await recordSolve(challengeId, won ? clueIndex : 0, won, clientKey);
  return Response.json({ ok: true, persisted });
}

async function readLiveStats(challengeId: string): Promise<ClueDistribution | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("challenge_stats")
      .select("clue_1, clue_2, clue_3, clue_4, clue_5, clue_6, missed, total_solves")
      .eq("challenge_id", challengeId)
      .maybeSingle();
    if (error || !data) return null;
    return distributionFromRow(data);
  } catch {
    return null;
  }
}

async function recordSolve(challengeId: string, clueIndex: number, won: boolean, clientKey: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const supabase = createPublicSupabaseClient();
    const { error } = await supabase.rpc("record_clue_solve", {
      challenge_id: challengeId,
      clue_index: clueIndex,
      won,
      client_key: clientKey,
    });
    return !error;
  } catch {
    return false;
  }
}
