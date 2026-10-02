import { canonicalSport } from "@/lib/decoy-options";

export const VAULT_FILTERS = ["All Sports", "Football", "Ice Hockey", "Boxing", "Tennis", "Athletics"] as const;

export type VaultFilter = (typeof VAULT_FILTERS)[number];

export interface ArchiveFixture {
  id: string;
  sport: string;
  fixtureDate: string;
  year: number | null;
}

export interface SolvedIndex {
  ids: Record<string, number | null>;
  dates: Record<string, number | null>;
}

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

type ArchiveListClient = {
  from: (table: "challenges") => {
    select: (columns: "id, title, sport, fixture_date, year") => {
      order: (
        column: "fixture_date",
        options: { ascending: boolean },
      ) => Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>;
    };
  };
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function yearOf(value: unknown): number | null {
  const year = typeof value === "number" ? value : Number(value);
  return Number.isFinite(year) && year > 0 ? year : null;
}

export function formatVaultDate(dateKey: string): string {
  if (!DATE_KEY.test(dateKey)) return dateKey;
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function sportPresentation(sport: string): { icon: string; label: string } {
  switch (canonicalSport(sport)) {
    case "ice_hockey":
      return { icon: "🏒", label: "Ice Hockey" };
    case "football":
      return { icon: "⚽", label: "Football" };
    case "boxing":
      return { icon: "🥊", label: "Boxing" };
    case "tennis":
      return { icon: "🎾", label: "Tennis" };
    case "athletics":
      return { icon: "🏃", label: "Athletics" };
    default:
      return { icon: "🏟️", label: sport.trim() || "Sports" };
  }
}

export function sportMatchesFilter(sport: string, filter: VaultFilter): boolean {
  if (filter === "All Sports") return true;
  return canonicalSport(sport) === canonicalSport(filter);
}

export function publishVaultRows(rows: readonly Record<string, unknown>[], today: string): ArchiveFixture[] {
  const fixtures = rows.flatMap((row) => {
    const id = text(row.id);
    const fixtureDate = text(row.fixture_date);
    if (!id || !DATE_KEY.test(fixtureDate) || fixtureDate > today) return [];
    return [{ id, sport: text(row.sport) || "Sports", fixtureDate, year: yearOf(row.year) }];
  });
  return fixtures.sort((left, right) => right.fixtureDate.localeCompare(left.fixtureDate));
}

export async function fetchArchiveFixtures(supabase: ArchiveListClient, today: string): Promise<ArchiveFixture[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("id, title, sport, fixture_date, year")
    .order("fixture_date", { ascending: false });
  if (error) {
    console.error("Supabase query error:", error);
  }
  return publishVaultRows(data ?? [], today);
}

function remember(bucket: Record<string, number | null>, key: string, score: number | null) {
  if (!key) return;
  const prior = bucket[key];
  if (prior == null || (score != null && score > prior)) bucket[key] = score;
}

function scoreOf(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Accepts date strings, challenge ids, and `{ id, score }` rows stored in shc_solved_history. */
export function parseSolvedHistory(raw: string | null): SolvedIndex {
  const ids: Record<string, number | null> = {};
  const dates: Record<string, number | null> = {};
  if (!raw) return { ids, dates };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return { ids, dates };
    for (const item of parsed) {
      if (typeof item === "string") {
        if (DATE_KEY.test(item)) remember(dates, item, null);
        else remember(ids, item, null);
        continue;
      }
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const score = scoreOf(row.score);
      const id = text(row.id) || text(row.challengeId);
      const date = text(row.date) || text(row.fixture_date) || text(row.dropDate);
      if (id) remember(ids, id, score);
      if (DATE_KEY.test(date)) remember(dates, date, score);
    }
  } catch {
    return { ids, dates };
  }
  return { ids, dates };
}

export function applyCompletionScores(
  history: SolvedIndex,
  completions: readonly { dropDate?: string; challengeId?: string | null; score?: number; solved?: boolean }[],
): SolvedIndex {
  const ids = { ...history.ids };
  const dates = { ...history.dates };
  for (const row of completions) {
    if (!row.solved) continue;
    const score = scoreOf(row.score);
    if (row.challengeId) remember(ids, row.challengeId, score);
    if (row.dropDate && DATE_KEY.test(row.dropDate)) remember(dates, row.dropDate, score);
  }
  return { ids, dates };
}

export function solvedScore(fixture: Pick<ArchiveFixture, "id" | "fixtureDate">, history: SolvedIndex): number | null | undefined {
  if (Object.prototype.hasOwnProperty.call(history.ids, fixture.id)) return history.ids[fixture.id];
  if (Object.prototype.hasOwnProperty.call(history.dates, fixture.fixtureDate)) return history.dates[fixture.fixtureDate];
  return undefined;
}

export function solvedBadge(score: number | null): string {
  if (score == null) return "SOLVED ✓";
  return `SOLVED · ${score.toLocaleString("en-US")} PTS ✓`;
}
