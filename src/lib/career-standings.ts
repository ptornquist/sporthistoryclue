import { supabaseClient } from "@/lib/supabase/client";

export interface CareerStanding {
  id: string;
  username?: string | null;
  display_name?: string | null;
  career_score?: number | null;
  fixtures_cleared?: number | null;
  avatar_url?: string | null;
  streak?: number | null;
}

interface StandingsClient {
  from: (table: "profiles") => {
    select: (columns: string) => {
      order: (
        column: "career_score",
        options: { ascending: boolean },
      ) => PromiseLike<{ data: CareerStanding[] | null; error: { message?: string } | null }>;
    };
  };
}

function gameClient(): StandingsClient {
  return supabaseClient as unknown as StandingsClient;
}

export const LOCAL_STANDING_ID = "local-scout";

/** Replaces this scout's board row with the shared totals. Never adds those points on top. */
export function placeOwnStanding(
  rows: CareerStanding[],
  own: {
    userId: string | null;
    username: string | null;
    careerScore: number;
    fixturesCleared: number;
  } | null,
): CareerStanding[] {
  if (!own || (own.careerScore <= 0 && own.fixturesCleared <= 0)) return rows;
  const id = own.userId || LOCAL_STANDING_ID;
  const username = own.username?.replace(/^@/, "") || "Du";
  let found = false;
  const next = rows.map((row) => {
    if (row.id !== id) return row;
    found = true;
    return {
      ...row,
      username: row.username || username,
      career_score: own.careerScore,
      fixtures_cleared: own.fixturesCleared,
    };
  });
  const placed = found
    ? next
    : [...next, { id, username, career_score: own.careerScore, fixtures_cleared: own.fixturesCleared }];
  return placed.sort(
    (left, right) =>
      (right.career_score || 0) - (left.career_score || 0) ||
      (right.fixtures_cleared || 0) - (left.fixtures_cleared || 0),
  );
}

/** Fresh career board. Called on each standings and profile load. */
export async function fetchCareerStandings(
  supabase: StandingsClient = gameClient(),
): Promise<CareerStanding[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, career_score, fixtures_cleared")
    .order("career_score", { ascending: false });

  if (error) console.error("Failed to load standings:", error);
  return data ?? [];
}
