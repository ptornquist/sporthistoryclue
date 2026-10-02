import { describe, expect, it, vi } from "vitest";
import { loadCareerStats, nextCareerTotals, recordCareerSolve, type CareerClient } from "./career-score";

interface PlayRow {
  id: string;
  user_id: string;
  fixture_id: string;
  played_on: string;
  score: number;
}

function fakeClient(options?: { userId?: string | null; profile?: { career_score: number; fixtures_cleared: number } | null; failUpdate?: boolean }) {
  const plays: PlayRow[] = [];
  const profile = options?.profile === undefined
    ? { career_score: 1000, fixtures_cleared: 2 }
    : options.profile;
  const updates: Array<Record<string, unknown>> = [];
  const userId = options?.userId === undefined ? "scout-1" : options.userId;

  const client: CareerClient = {
    auth: {
      getUser: async () => ({ data: { user: userId ? { id: userId } : null } }),
    },
    from(table: string) {
      const filters: Record<string, string> = {};
      const query = {
        select() {
          return query;
        },
        eq(column: string, value: string) {
          filters[column] = value;
          return query;
        },
        async maybeSingle() {
          const hit = plays.find(
            (row) =>
              row.user_id === filters.user_id &&
              row.fixture_id === filters.fixture_id &&
              row.played_on === filters.played_on,
          );
          return { data: hit ? { id: hit.id } : null, error: null };
        },
        async single() {
          if (table !== "profiles" || !profile) {
            return { data: null, error: { message: "missing profile" } };
          }
          return { data: { ...profile }, error: null };
        },
        async insert(row: Record<string, unknown>) {
          plays.push({ id: `play-${plays.length + 1}`, ...(row as Omit<PlayRow, "id">) });
          return { error: null };
        },
        update(row: Record<string, unknown>) {
          return {
            async eq() {
              if (options?.failUpdate) return { error: { message: "update rejected" } };
              updates.push(row);
              if (profile) {
                profile.career_score = Number(row.career_score);
                profile.fixtures_cleared = Number(row.fixtures_cleared);
              }
              return { error: null };
            },
          };
        },
      };
      return query;
    },
  };

  return { client, plays, profile, updates };
}

describe("nextCareerTotals", () => {
  it("adds the fixture score and one cleared fixture", () => {
    expect(nextCareerTotals({ career_score: 8500, fixtures_cleared: 3 }, 7000)).toEqual({
      career_score: 15500,
      fixtures_cleared: 4,
    });
    expect(nextCareerTotals(null, 10000)).toEqual({
      career_score: 10000,
      fixtures_cleared: 1,
    });
  });
});

describe("recordCareerSolve", () => {
  it("writes career totals once for a fixture day", async () => {
    const { client, plays, profile, updates } = fakeClient();
    await recordCareerSolve({ id: "miracle-on-ice-1980", playedOn: "2026-10-02" }, 8500, client);
    await recordCareerSolve({ id: "miracle-on-ice-1980", playedOn: "2026-10-02" }, 8500, client);

    expect(plays).toHaveLength(1);
    expect(updates).toHaveLength(1);
    expect(profile?.career_score).toBe(9500);
    expect(profile?.fixtures_cleared).toBe(3);
    expect(updates[0]?.updated_at).toEqual(expect.any(String));
  });

  it("skips guests", async () => {
    const { client, plays, updates } = fakeClient({ userId: null });
    await recordCareerSolve({ id: "daily", playedOn: "2026-10-02" }, 10000, client);
    expect(plays).toHaveLength(0);
    expect(updates).toHaveLength(0);
  });

  it("logs a rejected profile update", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { client } = fakeClient({ failUpdate: true });
    await recordCareerSolve({ id: "daily", playedOn: "2026-10-02" }, 1000, client);
    expect(errorSpy).toHaveBeenCalledWith("Failed to save score:", { message: "update rejected" });
    errorSpy.mockRestore();
  });
});

describe("loadCareerStats", () => {
  it("reads career_score and fixtures_cleared from profiles", async () => {
    const { client } = fakeClient({ profile: { career_score: 4200, fixtures_cleared: 6 } });
    await expect(loadCareerStats("scout-1", client)).resolves.toEqual({
      careerScore: 4200,
      fixturesCleared: 6,
    });
  });
});
