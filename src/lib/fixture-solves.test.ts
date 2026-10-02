import { describe, expect, it, vi } from "vitest";
import { findFixtureSolve, recordFixtureWin, type FixtureSolve } from "./fixture-solves";

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
