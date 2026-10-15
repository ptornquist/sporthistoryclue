import { supabaseClient } from "@/lib/supabase/client";
import {
  isStandingRow,
  loadStandingsRows,
  sortByScore,
  type StandingsClient,
  type StandingsSnapshot,
} from "@/lib/standings-source";

/**
 * Every profile for the boards. The server route reads with the service role
 * and lists all scouts, including members with 0 points. A browser query is the
 * fallback; it only sees the rows the select policy on profiles allows.
 */
export async function fetchAllStandings(weekStart: string): Promise<StandingsSnapshot> {
  try {
    const response = await fetch(`/api/standings?week=${encodeURIComponent(weekStart)}`, { cache: "no-store" });
    if (response.ok) {
      const json = (await response.json()) as { rows?: unknown; weekly?: unknown; scoreColumn?: unknown };
      const rows = Array.isArray(json.rows) ? json.rows.filter(isStandingRow) : [];
      if (rows.length > 0) {
        const scoreColumn = json.scoreColumn === "total_score" || json.scoreColumn === "career_score" ? json.scoreColumn : null;
        return { rows: sortByScore(rows), weekly: json.weekly !== false, scoreColumn };
      }
    }
  } catch (error) {
    console.error("Standings route failed:", error);
  }
  return loadStandingsRows(supabaseClient as unknown as StandingsClient, weekStart);
}
