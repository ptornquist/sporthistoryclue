import { describe, expect, it, vi } from "vitest";
import { findFixtureSolve, lockDropLocally, persistFixtureScore, readLocalDropSolve, recordFixtureWin, solvedDropKey, type FixtureSolve } from "./fixture-solves";

function fakeSolveClient(options?: {
  userId?: string | null;
  existing?: FixtureSolve | null;
  rpcError?: { message: string } | null;
  alreadySolved?: boolean;
}) {
  const rpcCalls: Array<{ p_challenge_id: string; p_score: number }> = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user: options?.userId === null ? null : { id: options?.userId ?? "scout-1" } } }),
    },
    from() {
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
          const row = options?.existing ?? null;
          if (row && filters.challenge_id && filters.user_id) return { data: row, error: null };
          return { data: null, error: null };
        },
      };
      return query;
    },
    async rpc(_fn: "record_fixture_win", args: { p_challenge_id: string; p_score: number }) {
      rpcCalls.push(args);
      if (options?.rpcError) return { data: null, error: options.rpcError };
      return {
        data: options?.alreadySolved
          ? { already_solved: true, score_awarded: 8500 }
          : { already_solved: false, score_awarded: args.p_score },
        error: null,
      };
    },
  };
  return { client, rpcCalls };
}

describe("findFixtureSolve", () => {
  it("returns the saved score for a fixture this scout already cleared", async () => {
    const { client } = fakeSolveClient({
      existing: { id: "solve-1", score_awarded: 8500 },
    });
    await expect(findFixtureSolve("miracle-on-ice-1980", client)).resolves.toEqual({
      id: "solve-1",
      score_awarded: 8500,
    });
  });

  it("returns nothing for a guest", async () => {
    const { client } = fakeSolveClient({ userId: null, existing: { id: "solve-1", score_awarded: 8500 } });
    await expect(findFixtureSolve("miracle-on-ice-1980", client)).resolves.toBeNull();
  });
});

describe("local drop lock", () => {
  it("stores the score under the daily key before a replay can start", () => {
    const bag = new Map<string, string>();
    const storage = {
      getItem: (key: string) => bag.get(key) ?? null,
      setItem: (key: string, value: string) => {
        bag.set(key, value);
      },
    };
    expect(solvedDropKey(undefined)).toBe("shc_solved_today");
    lockDropLocally("2026-10-02", 8500, storage);
    expect(storage.getItem("shc_solved_2026-10-02")).toContain("8500");
    expect(readLocalDropSolve(storage, "2026-10-02")).toBe(8500);
    expect(readLocalDropSolve(storage, "2026-10-01")).toBeNull();
  });
});

describe("persistFixtureScore", () => {
  it("adds career points once and ignores a replay of the same day", async () => {
    const solves: Array<Record<string, unknown>> = [];
    const profile = { career_score: 1000, fixtures_cleared: 2 };
    const updates: Array<Record<string, unknown>> = [];
    const client = {
      auth: { getUser: async () => ({ data: { user: { id: "scout-1" } } }) },
      from(table: string) {
        const filters: Record<string, string> = {};
        return {
          select() {
            return this;
          },
          eq(column: string, value: string) {
            filters[column] = value;
            return this;
          },
          async maybeSingle() {
            const hit = solves.find((row) => row.user_id === filters.user_id && row.fixture_date === filters.fixture_date);
            return { data: hit ? { id: "existing", score_awarded: Number(hit.score_awarded) } : null, error: null };
          },
          async single() {
            return { data: { ...profile }, error: null };
          },
          async upsert(row: Record<string, unknown>) {
            const index = solves.findIndex((item) => item.user_id === row.user_id && item.fixture_date === row.fixture_date);
            if (index >= 0) solves[index] = row;
            else solves.push(row);
            return { error: null };
          },
          update(row: Record<string, unknown>) {
            return {
              async eq() {
                if (table === "profiles") {
                  updates.push(row);
                  profile.career_score = Number(row.career_score);
                  profile.fixtures_cleared = Number(row.fixtures_cleared);
                }
                return { error: null };
              },
            };
          },
        };
      },
    };

    await persistFixtureScore({ id: "daily", date: "2026-10-02" }, 8500, client);
    await persistFixtureScore({ id: "daily", date: "2026-10-02" }, 8500, client);
    expect(solves).toHaveLength(1);
    expect(updates).toHaveLength(1);
    expect(profile).toEqual({ career_score: 9500, fixtures_cleared: 3 });
  });
});

describe("recordFixtureWin", () => {
  it("calls record_fixture_win with the fixture and current score", async () => {
    const { client, rpcCalls } = fakeSolveClient();
    const result = await recordFixtureWin("miracle-on-ice-1980", 8500, client);
    expect(rpcCalls).toEqual([{ p_challenge_id: "miracle-on-ice-1980", p_score: 8500 }]);
    expect(result).toEqual({ already_solved: false, score_awarded: 8500 });
  });

  it("logs a duplicate win and a save error", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const duplicate = fakeSolveClient({ alreadySolved: true });
    await recordFixtureWin("daily", 7000, duplicate.client);
    expect(log).toHaveBeenCalledWith("Fixture was already solved.");

    const failed = fakeSolveClient({ rpcError: { message: "write failed" } });
    await expect(recordFixtureWin("daily", 7000, failed.client)).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith("Score save error:", { message: "write failed" });
    log.mockRestore();
    errorSpy.mockRestore();
  });
});
