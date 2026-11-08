import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import { isDateKey, upsertCompletion, type DailyCompletion } from "@/lib/archive-calendar";

export const DAILY_COMPLETIONS_KEY = "shc_daily_completions";

export function readLocalCompletions(storage: Storage | null = browserStorage()): DailyCompletion[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(DAILY_COMPLETIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Partial<DailyCompletion>;
      if (!isDateKey(row.dropDate) || typeof row.solved !== "boolean") return [];
      return [
        {
          dropDate: row.dropDate,
          solved: row.solved,
          score: typeof row.score === "number" ? row.score : 0,
          challengeId: typeof row.challengeId === "string" ? row.challengeId : null,
        },
      ];
    });
  } catch {
    return [];
  }
}

export function writeLocalCompletion(next: DailyCompletion, storage: Storage | null = browserStorage()): DailyCompletion[] {
  const list = upsertCompletion(readLocalCompletions(storage), next);
  storage?.setItem(DAILY_COMPLETIONS_KEY, JSON.stringify(list));
  return list;
}

export async function rememberDailyCompletion(next: DailyCompletion, userId: string | null): Promise<void> {
  writeLocalCompletion(next);
  if (!userId || !isSupabaseConfigured || !isDateKey(next.dropDate)) return;
  try {
    const existing = await supabaseClient
      .from("user_daily_completions")
      .select("solved")
      .eq("user_id", userId)
      .eq("drop_date", next.dropDate)
      .maybeSingle();
    if (existing.data?.solved && !next.solved) return;
    await supabaseClient.from("user_daily_completions").upsert(
      {
        user_id: userId,
        drop_date: next.dropDate,
        solved: existing.data?.solved || next.solved,
        score: next.score,
        challenge_id: next.challengeId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,drop_date" },
    );
  } catch {
    return;
  }
}

export interface CompleteDailyResult {
  error: string | null;
  alreadySolved: boolean;
}

/**
 * Saves a solved drop once per scout and day, then moves the earned points
 * onto profiles.total_score through the increment_user_score RPC.
 */
export async function completeDailyChallenge(
  next: DailyCompletion,
  userId: string | null,
): Promise<CompleteDailyResult> {
  writeLocalCompletion(next);
  if (!userId || !isSupabaseConfigured || !isDateKey(next.dropDate)) {
    return { error: null, alreadySolved: false };
  }
  try {
    const { data: existingCompletion } = await supabaseClient
      .from("user_daily_completions")
      .select("id, solved")
      .eq("user_id", userId)
      .eq("drop_date", next.dropDate)
      .maybeSingle();

    if (existingCompletion?.solved) {
      return { error: "Du har redan löst dagens kluring!", alreadySolved: true };
    }

    const row = {
      user_id: userId,
      challenge_id: next.challengeId ?? null,
      drop_date: next.dropDate,
      score: next.score,
      solved: true,
      updated_at: new Date().toISOString(),
    };
    const { error: saveError } = existingCompletion
      ? await supabaseClient
          .from("user_daily_completions")
          .update(row)
          .eq("user_id", userId)
          .eq("drop_date", next.dropDate)
      : await supabaseClient.from("user_daily_completions").insert(row);
    if (saveError) {
      console.error("Failed to save daily completion:", saveError);
      return { error: "Kunde inte spara resultatet.", alreadySolved: false };
    }

    const { error: scoreError } = await supabaseClient.rpc("increment_user_score", {
      user_id_input: userId,
      score_to_add: next.score,
    });
    if (scoreError) {
      console.error("Failed to increment user score:", scoreError);
      return { error: "Kunde inte uppdatera totalpoängen.", alreadySolved: false };
    }
    return { error: null, alreadySolved: false };
  } catch (error) {
    console.error("Failed to save daily completion:", error);
    return { error: "Kunde inte spara resultatet.", alreadySolved: false };
  }
}

export async function loadRemoteCompletions(userId: string): Promise<DailyCompletion[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseClient
    .from("user_daily_completions")
    .select("drop_date, solved, score, challenge_id")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.flatMap((row) => {
    const dropDate = typeof row.drop_date === "string" ? row.drop_date : "";
    if (!isDateKey(dropDate)) return [];
    return [
      {
        dropDate,
        solved: Boolean(row.solved),
        score: typeof row.score === "number" ? row.score : 0,
        challengeId: typeof row.challenge_id === "string" ? row.challenge_id : null,
      },
    ];
  });
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}
