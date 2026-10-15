import { z } from "zod";
import {
  careerOf,
  MATCH_ID,
  MAX_SOLVE_POINTS,
  raiseProfileTotals,
  type AwardClient,
  type DirectAward,
} from "@/lib/solve-award";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveScout } from "@/lib/supabase/scout-session";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  totalScore: z.number().int().min(0),
  matchesSolved: z.number().int().min(0).max(100000).default(0),
  bestStreak: z.number().int().min(0).max(100000).default(0),
  /** Every match the wallet was paid for. Caps how many points it may claim. */
  grantedMatchIds: z.array(z.string().regex(MATCH_ID)).max(5000).default([]),
});

/**
 * Lifts points that only exist in a browser wallet onto the profiles row.
 *
 * Earlier builds kept solve points in localStorage whenever the award RPC was
 * missing, so the profile page showed them while the board read 0 from the
 * database. The wallet can claim at most the per-solve maximum for each match
 * it was paid for, and the row is only ever raised.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return Response.json({ saved: "none", profile: null, reason: "unconfigured" }, { status: 503 });
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

  const ceiling = new Set(body.grantedMatchIds).size * MAX_SOLVE_POINTS;
  const totals = {
    totalScore: Math.min(body.totalScore, ceiling),
    matchesSolved: Math.min(body.matchesSolved, new Set(body.grantedMatchIds).size),
    bestStreak: body.bestStreak,
  };

  const headers = { "Cache-Control": "no-store" };
  let result: DirectAward | null = null;
  let saved: "direct" | "user" = "direct";
  if (supabaseAdmin) {
    result = await raiseProfileTotals(supabaseAdmin as unknown as AwardClient, scout.id, totals, scout.username);
  }
  if (!result?.saved) {
    const asScout = await raiseProfileTotals(scout.client as unknown as AwardClient, scout.id, totals, scout.username);
    if (asScout.saved || !result) {
      result = asScout;
      saved = "user";
    }
  }

  if (!result.saved) {
    return Response.json(
      { saved: "none", profile: result.profile, reason: result.reason, message: result.message },
      { headers },
    );
  }
  const profile = { ...result.profile, total_score: careerOf(result.profile) };
  return Response.json({ saved, unchanged: result.duplicate, profile }, { headers });
}
