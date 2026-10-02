import { supabaseClient } from "@/lib/supabase/client";

export interface FixtureSolve {
  id: string;
  score_awarded: number;
}

export interface FixtureWinResult {
  already_solved?: boolean;
  score_awarded?: number;
}

interface QueryError {
  message?: string;
}

interface SolveClient {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  };
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => PromiseLike<{ data: FixtureSolve | null; error: QueryError | null }>;
        };
      };
    };
  };
  rpc: (
    fn: "record_fixture_win",
    args: { p_challenge_id: string; p_score: number },
  ) => PromiseLike<{ data: FixtureWinResult | null; error: QueryError | null }>;
}

function gameClient(): SolveClient {
  return supabaseClient as unknown as SolveClient;
}

/** Prior win for this scout and fixture. Guests have none. */
export async function findFixtureSolve(
  challengeId: string,
  supabase: SolveClient = gameClient(),
): Promise<FixtureSolve | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !challengeId) return null;

  const { data: solvedRecord, error } = await supabase
    .from("user_fixture_solves")
    .select("id, score_awarded")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .maybeSingle();

  if (error) {
    console.error("Score save error:", error);
    return null;
  }
  return solvedRecord;
}

/** Persists a win through record_fixture_win. Returns null when nothing was saved. */
export async function recordFixtureWin(
  challengeId: string,
  currentPotentialScore: number,
  supabase: SolveClient = gameClient(),
): Promise<FixtureWinResult | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return null;

    const { data, error } = await supabase.rpc("record_fixture_win", {
      p_challenge_id: challengeId,
      p_score: currentPotentialScore,
    });

    if (error) {
      console.error("Score save error:", error);
      return null;
    }
    if (data?.already_solved) {
      console.log("Fixture was already solved.");
    }
    return data;
  } catch (error) {
    console.error("Score save error:", error);
    return null;
  }
}
