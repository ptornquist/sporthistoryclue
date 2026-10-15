import { z } from "zod";
import { gradeOption, isMatchKey, loadArchiveMatch, loadDailyFixture, parseDateKey } from "@/lib/daily-drop";
import {
  awardDirectly,
  careerOf,
  MATCH_ID,
  MAX_SOLVE_POINTS,
  type AwardClient,
  type DirectAward,
  type ProfileValues,
} from "@/lib/solve-award";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveScout, type Scout } from "@/lib/supabase/scout-session";
import { utcDateKey } from "@/lib/utc-streak";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  matchId: z.string().regex(MATCH_ID),
  pointScore: z.number().int().min(0).max(MAX_SOLVE_POINTS),
  isDaily: z.boolean(),
  streakContinued: z.boolean().default(false),
  duelWon: z.boolean().default(false),
  newStreak: z.number().int().min(0).max(100000).default(1),
  sport: z.string().max(40).nullable().optional(),
  /** The chosen option plus date key, so the server can re-grade before paying out. */
  option: z.string().min(1).max(200).optional(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

type Payload = z.infer<typeof payloadSchema>;

interface RpcClient {
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }>;
}

function rpcMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return error.code === "PGRST202" || message.includes("could not find the function") || message.includes("does not exist");
}

/** True when the chosen option really solves the kluring; null when nothing to check against. */
async function verified(body: Payload): Promise<boolean | null> {
  if (!body.option) return null;
  if (isMatchKey(body.matchId)) {
    const archive = await loadArchiveMatch(body.matchId);
    if (archive) return gradeOption(archive, body.option);
  }
  const dateKey = parseDateKey(body.dateKey ?? null);
  if (!dateKey) return null;
  const fixture = await loadDailyFixture(dateKey);
  if (fixture.id !== body.matchId) return null;
  return gradeOption(fixture, body.option);
}

/** The RPC path, run as the signed-in scout. Returns null when the RPC is missing. */
async function awardViaRpc(client: RpcClient, body: Payload): Promise<{ profile: ProfileValues; earned: number } | null> {
  const args = {
    match_id: body.matchId,
    point_score: body.pointScore,
    is_daily: body.isDaily,
    streak_continued: body.streakContinued,
    duel_won: body.duelWon,
    new_streak: body.newStreak,
  };
  let result = await client.rpc("award_solve_coins", { ...args, sport: body.sport ?? null });
  if (result.error && /sport|could not find the function|schema cache/i.test(result.error.message ?? "")) {
    result = await client.rpc("award_solve_coins", args);
  }
  if (result.error) {
    if (rpcMissing(result.error)) return null;
    throw new Error(result.error.message);
  }
  const profile = result.data && typeof result.data === "object" ? (result.data as ProfileValues) : null;
  if (!profile) return null;
  const earned = typeof profile.earned === "number" ? profile.earned : 0;
  return { profile, earned };
}

async function rememberDaily(scout: Scout, body: Payload): Promise<void> {
  if (!body.isDaily) return;
  const dropDate = parseDateKey(body.dateKey ?? null) ?? utcDateKey(new Date());
  const writer = supabaseAdmin ?? scout.client;
  try {
    await writer.from("user_daily_completions").upsert(
      {
        user_id: scout.id,
        drop_date: dropDate,
        solved: true,
        score: body.pointScore,
        challenge_id: body.matchId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,drop_date" },
    );
  } catch {
    // The browser already keeps this record; the profile row is what the board needs.
  }
}

/**
 * Saves a solved kluring to the scout's profile right away.
 *
 * Order: the award RPC as the scout; the same update with the service role when
 * the RPC is missing; and finally the update as the scout through RLS, which
 * works in databases that never got the score guard trigger.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return Response.json({ saved: "none", earned: 0, profile: null, reason: "unconfigured" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Missing fields in request" }, { status: 400 });
  }
  const body = parsed.data;

  const scout = await resolveScout(request);
  if (!scout) {
    return Response.json({ error: "Sign in to save points" }, { status: 401 });
  }

  const check = await verified(body);
  if (check === false) {
    return Response.json({ error: "That option does not solve the kluring" }, { status: 403 });
  }

  const headers = { "Cache-Control": "no-store" };
  await rememberDaily(scout, body);

  try {
    const rpc = await awardViaRpc(scout.client as unknown as RpcClient, body);
    if (rpc) return Response.json({ saved: "rpc", earned: rpc.earned, profile: rpc.profile }, { headers });
  } catch (error) {
    console.error("award_solve_coins failed", error);
  }

  const input = { ...body, userId: scout.id, today: utcDateKey(new Date()) };
  let direct: DirectAward | null = null;
  let saved: "direct" | "user" = "direct";

  if (supabaseAdmin) {
    direct = await awardDirectly(supabaseAdmin as unknown as AwardClient, input, scout.username);
  }
  if (!direct?.saved) {
    const asScout = await awardDirectly(scout.client as unknown as AwardClient, input, scout.username);
    if (asScout.saved || !direct) {
      direct = asScout;
      saved = "user";
    }
  }

  if (!direct.saved) {
    return Response.json(
      { saved: "none", earned: 0, profile: direct.profile, reason: direct.reason, message: direct.message },
      { headers },
    );
  }
  const profile = { ...direct.profile, total_score: careerOf(direct.profile) };
  return Response.json({ saved, earned: direct.earned, duplicate: direct.duplicate, profile }, { headers });
}
