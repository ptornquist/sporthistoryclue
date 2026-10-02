import { supabaseClient } from "@/lib/supabase/client";

export interface CareerTotals {
  career_score: number | null;
  fixtures_cleared: number | null;
}

interface QueryError {
  message?: string;
}

interface RowQuery {
  eq: (column: string, value: string) => RowQuery;
  maybeSingle: () => PromiseLike<{ data: { id: string } | null; error: QueryError | null }>;
  single: () => PromiseLike<{ data: CareerTotals | null; error: QueryError | null }>;
}

interface TableQuery {
  select: (columns: string) => RowQuery;
  insert: (row: Record<string, unknown>) => PromiseLike<{ error: QueryError | null }>;
  update: (row: Record<string, unknown>) => {
    eq: (column: string, value: string) => PromiseLike<{ error: QueryError | null }>;
  };
}

export interface CareerClient {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  };
  from: (table: string) => TableQuery;
}

function gameClient(): CareerClient {
  return supabaseClient as unknown as CareerClient;
}

export function nextCareerTotals(profile: CareerTotals | null, finalScore: number): {
  career_score: number;
  fixtures_cleared: number;
} {
  return {
    career_score: (profile?.career_score || 0) + finalScore,
    fixtures_cleared: (profile?.fixtures_cleared || 0) + 1,
  };
}

/** Adds a solved fixture to the signed-in profile once per fixture day. */
export async function recordCareerSolve(
  fixture: { id: string; playedOn: string },
  finalScore: number,
  supabase: CareerClient = gameClient(),
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id || !fixture.id || !fixture.playedOn) return;

    const { data: existing, error: existingError } = await supabase
      .from("played_fixtures")
      .select("id")
      .eq("user_id", user.id)
      .eq("fixture_id", fixture.id)
      .eq("played_on", fixture.playedOn)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to save score:", existingError);
      return;
    }
    if (existing) return;

    const { error: insertError } = await supabase.from("played_fixtures").insert({
      user_id: user.id,
      fixture_id: fixture.id,
      played_on: fixture.playedOn,
      score: finalScore,
    });
    if (insertError) {
      console.error("Failed to save score:", insertError);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("career_score, fixtures_cleared")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Failed to save score:", profileError);
      return;
    }

    const { career_score: updatedScore, fixtures_cleared: updatedCleared } = nextCareerTotals(
      profile,
      finalScore,
    );
    const { error } = await supabase
      .from("profiles")
      .update({
        career_score: updatedScore,
        fixtures_cleared: updatedCleared,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) console.error("Failed to save score:", error);
  } catch (error) {
    console.error("Failed to save score:", error);
  }
}

export async function loadCareerStats(
  userId: string,
  supabase: CareerClient = gameClient(),
): Promise<{ careerScore: number; fixturesCleared: number }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("career_score, fixtures_cleared")
    .eq("id", userId)
    .single();

  if (error) console.error("Failed to load career stats:", error);
  return {
    careerScore: data?.career_score || 0,
    fixturesCleared: data?.fixtures_cleared || 0,
  };
}
