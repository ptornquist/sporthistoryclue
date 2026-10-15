import type { DailyCompletion } from "@/lib/archive-calendar";
import { loadWallet } from "@/lib/cosmetics";
import { loadRemoteCompletions, readLocalCompletions } from "@/lib/daily-completions";
import { readSolvedScore } from "@/lib/solved-cases";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

export interface PriorSolve {
  /** Points recorded the first time; null when only the fact of solving is known. */
  score: number | null;
  source: "remote" | "grant" | "wallet" | "local";
}

export interface PriorSolveSources {
  /** The kluring id being played. */
  id: string;
  /** Drop date for a daily kluring; null for archive matches played by id. */
  dropDate: string | null;
  completions: DailyCompletion[];
  /** Match ids the wallet was paid for. */
  grantedIds: string[];
  /** Score saved in this browser for the id, if any. */
  localScore: number | null;
  /** True when coin_grants holds a row for this scout and id. */
  granted: boolean;
}

/** Pure half of the check so every source is weighed the same way. */
export function priorSolveFrom(sources: PriorSolveSources): PriorSolve | null {
  const hit = sources.completions.find((row) =>
    row.solved && (row.challengeId === sources.id || (sources.dropDate != null && row.dropDate === sources.dropDate)),
  );
  if (hit) return { score: hit.score, source: "remote" };
  if (sources.granted) return { score: sources.localScore, source: "grant" };
  if (sources.grantedIds.includes(sources.id)) return { score: sources.localScore, source: "wallet" };
  if (sources.localScore != null) return { score: sources.localScore, source: "local" };
  return null;
}

async function grantExists(userId: string, id: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from("coin_grants")
      .select("match_id")
      .eq("user_id", userId)
      .eq("match_id", id)
      .maybeSingle();
    return !error && Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Has this scout already solved the kluring? Checks the saved completions for
 * signed-in scouts, the paid grants, and what this browser remembers, so the
 * arena can lock the board instead of paying out twice.
 */
export async function findPriorSolve(input: { id: string; dropDate: string | null; userId: string | null }): Promise<PriorSolve | null> {
  const local = readLocalCompletions();
  const remote = input.userId && isSupabaseConfigured ? await loadRemoteCompletions(input.userId).catch(() => []) : [];
  const granted = input.userId && isSupabaseConfigured ? await grantExists(input.userId, input.id) : false;
  return priorSolveFrom({
    id: input.id,
    dropDate: input.dropDate,
    completions: [...remote, ...local],
    grantedIds: loadWallet().grantedMatchIds,
    localScore: readSolvedScore(input.id),
    granted,
  });
}
