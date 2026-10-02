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
