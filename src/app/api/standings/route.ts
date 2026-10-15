import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { loadStandingsRows, type StandingsClient } from "@/lib/standings-source";
import { mondayOfUtcWeek, utcDateKey } from "@/lib/utc-streak";

export const dynamic = "force-dynamic";

const WEEK_START = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Public leaderboard rows for every saved profile.
 * The service-role client lists all scouts even when row-level security
 * limits browser reads to the signed-in user's own row.
 */
export async function GET(request: Request) {
  if (!isSupabaseConfigured) {
    return Response.json({ rows: [], weekly: false, scoreColumn: null, history: false, daily: false, source: "none" });
  }

  const requested = new URL(request.url).searchParams.get("week") ?? "";
  const weekStart = WEEK_START.test(requested) ? requested : mondayOfUtcWeek(utcDateKey(new Date()));

  try {
    const client = (supabaseAdmin ?? createPublicSupabaseClient()) as unknown as StandingsClient;
    const snapshot = await loadStandingsRows(client, weekStart);
    return Response.json(
      { ...snapshot, weekStart, source: supabaseAdmin ? "service" : "anon" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Standings read failed:", error);
    return Response.json(
      { rows: [], weekly: false, scoreColumn: null, history: false, daily: false, weekStart, source: "error" },
      { status: 200 },
    );
  }
}
