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

export function solvedDropKey(date: string | null | undefined): string {
  return `shc_solved_${date || "today"}`;
}

export function readLocalDropSolve(
  storage: Pick<Storage, "getItem">,
  date: string | null | undefined,
): number | null {
  const raw = storage.getItem(solvedDropKey(date));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { score?: unknown };
    return typeof parsed.score === "number" ? parsed.score : null;
  } catch {
    return null;
  }
}

/** Locks this drop in the browser before any network call. */
export function lockDropLocally(
  date: string | null | undefined,
  score: number,
  storage: Pick<Storage, "setItem">,
): void {
  storage.setItem(
    solvedDropKey(date),
    JSON.stringify({ score, date: new Date().toISOString() }),
  );
}

interface SaveClient {
  auth: SolveClient["auth"];
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => SaveFilter;
    };
    upsert: (
      row: Record<string, unknown>,
      options: { onConflict: string },
    ) => PromiseLike<{ error: QueryError | null }>;
    update: (row: Record<string, unknown>) => {
      eq: (column: string, value: string) => PromiseLike<{ error: QueryError | null }>;
    };
  };
}

interface SaveFilter {
  eq: (column: string, value: string) => SaveFilter;
  maybeSingle: () => PromiseLike<{ data: FixtureSolve | null; error: QueryError | null }>;
  single: () => PromiseLike<{
    data: { career_score: number | null; fixtures_cleared: number | null } | null;
    error: QueryError | null;
  }>;
}

/** Saves the win once. A second call for the same day does not add career points. */
export async function persistFixtureScore(
  fixture: { id: string; date: string | null | undefined },
  currentScore: number,
  supabase: SaveClient = gameClient() as unknown as SaveClient,
): Promise<void> {
  try {
    const fixtureDate = fixture.date || "today";
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    const { data: existing, error: existingError } = await supabase
      .from("user_fixture_solves")
      .select("id, score_awarded")
      .eq("user_id", user.id)
      .eq("fixture_date", fixtureDate)
      .maybeSingle();
    if (existingError) console.error("Score save error:", existingError);

    const { error: upsertError } = await supabase.from("user_fixture_solves").upsert(
      {
        user_id: user.id,
        fixture_date: fixtureDate,
        challenge_id: fixture.id,
        score_awarded: currentScore,
      },
      { onConflict: "user_id,fixture_date" },
    );
    if (upsertError) {
      console.error("Score save error:", upsertError);
      return;
    }
    if (existing) return;

    const { data: prof, error: profileError } = await supabase
      .from("profiles")
      .select("career_score, fixtures_cleared")
      .eq("id", user.id)
      .single();
    if (profileError) console.error("Score save error:", profileError);

    const { error } = await supabase
      .from("profiles")
      .update({
        career_score: (prof?.career_score || 0) + currentScore,
        fixtures_cleared: (prof?.fixtures_cleared || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) console.error("Score save error:", error);
  } catch (error) {
    console.error("Score save error:", error);
  }
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
