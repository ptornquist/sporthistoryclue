export type ChallengeRow = Record<string, unknown>;

type ChallengeFilter = {
  eq: (column: string, value: string) => ChallengeFilter;
  order: (column: string, options: { ascending: boolean }) => ChallengeFilter;
  limit: (count: number) => ChallengeFilter;
  maybeSingle: () => Promise<{ data: ChallengeRow | null; error: { message: string } | null }>;
};

export type DailyChallengeClient = {
  from: (table: "challenges") => {
    select: (columns: "*") => ChallengeFilter;
  };
};

/**
 * Today's row wins. When that date has no challenge, the newest created row is used.
 * `date_key` is checked after `fixture_date` so older drops that only stored `date_key` still resolve.
 */
export async function fetchDailyChallengeRow(
  supabase: DailyChallengeClient,
  today: string,
  options?: { allowLatestFallback?: boolean },
): Promise<ChallengeRow | null> {
  const dated = await supabase
    .from("challenges")
    .select("*")
    .eq("fixture_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dated.data) return dated.data;

  const byDateKey = await supabase
    .from("challenges")
    .select("*")
    .eq("date_key", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byDateKey.data) return byDateKey.data;

  if (options?.allowLatestFallback === false) return null;

  const { data: latest } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latest;
}
