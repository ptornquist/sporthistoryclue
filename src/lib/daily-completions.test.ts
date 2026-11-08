import { describe, expect, it, vi } from "vitest";

const { state, from, rpc } = vi.hoisted(() => {
  const state = {
    rows: [] as Array<Record<string, unknown>>,
    rpcCalls: [] as Array<{ user_id_input: string; score_to_add: number }>,
    rpcError: null as { message: string } | null,
  };
  const from = vi.fn(() => {
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
        const hit = state.rows.find(
          (row) => row.user_id === filters.user_id && row.drop_date === filters.drop_date,
        );
        return { data: hit ? { id: "completion-1", solved: Boolean(hit.solved) } : null, error: null };
      },
      async insert(row: Record<string, unknown>) {
        state.rows.push(row);
        return { error: null };
      },
      update(row: Record<string, unknown>) {
        return {
          eq(column: string, value: string) {
            filters[column] = value;
            return {
              async eq(nextColumn: string, nextValue: string) {
                filters[nextColumn] = nextValue;
                const index = state.rows.findIndex(
                  (item) => item.user_id === filters.user_id && item.drop_date === filters.drop_date,
                );
                if (index >= 0) state.rows[index] = { ...state.rows[index], ...row };
                return { error: null };
              },
            };
          },
        };
      },
    };
    return query;
  });
  const rpc = vi.fn(async (_fn: string, args: { user_id_input: string; score_to_add: number }) => {
    state.rpcCalls.push(args);
    return { data: null, error: state.rpcError };
  });
  return { state, from, rpc };
});

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: true,
  supabaseClient: { from, rpc },
}));

import { completeDailyChallenge } from "./daily-completions";

describe("completeDailyChallenge", () => {
  it("saves the completion and increments the total score on a first solve", async () => {
    state.rows = [];
    state.rpcCalls = [];
    state.rpcError = null;

    const result = await completeDailyChallenge(
      { dropDate: "2026-11-08", solved: true, score: 8500, challengeId: "miracle-on-ice-1980" },
      "scout-1",
    );

    expect(result).toEqual({ error: null, alreadySolved: false });
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0]).toMatchObject({
      user_id: "scout-1",
      drop_date: "2026-11-08",
      challenge_id: "miracle-on-ice-1980",
      score: 8500,
      solved: true,
    });
    expect(state.rpcCalls).toEqual([{ user_id_input: "scout-1", score_to_add: 8500 }]);
  });

  it("rejects a second solve of the same drop without touching the score", async () => {
    state.rows = [
      {
        user_id: "scout-1",
        drop_date: "2026-11-08",
        challenge_id: "miracle-on-ice-1980",
        score: 8500,
        solved: true,
      },
    ];
    state.rpcCalls = [];
    state.rpcError = null;

    const result = await completeDailyChallenge(
      { dropDate: "2026-11-08", solved: true, score: 4000, challengeId: "miracle-on-ice-1980" },
      "scout-1",
    );

    expect(result).toEqual({ error: "Du har redan löst dagens kluring!", alreadySolved: true });
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0]?.score).toBe(8500);
    expect(state.rpcCalls).toHaveLength(0);
  });

  it("updates an existing unsolved row instead of inserting a duplicate", async () => {
    state.rows = [
      {
        user_id: "scout-1",
        drop_date: "2026-11-08",
        challenge_id: null,
        score: 0,
        solved: false,
      },
    ];
    state.rpcCalls = [];
    state.rpcError = null;

    const result = await completeDailyChallenge(
      { dropDate: "2026-11-08", solved: true, score: 6000, challengeId: "miracle-on-ice-1980" },
      "scout-1",
    );

    expect(result).toEqual({ error: null, alreadySolved: false });
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0]).toMatchObject({ score: 6000, solved: true });
    expect(state.rpcCalls).toEqual([{ user_id_input: "scout-1", score_to_add: 6000 }]);
  });

  it("reports a failure when the score increment fails", async () => {
    state.rows = [];
    state.rpcCalls = [];
    state.rpcError = { message: "write failed" };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await completeDailyChallenge(
      { dropDate: "2026-11-08", solved: true, score: 8500, challengeId: "miracle-on-ice-1980" },
      "scout-1",
    );

    expect(result).toEqual({ error: "Kunde inte uppdatera totalpoängen.", alreadySolved: false });
    expect(errorSpy).toHaveBeenCalledWith("Failed to increment user score:", { message: "write failed" });
    errorSpy.mockRestore();
  });

  it("skips remote writes for guests and invalid drop dates", async () => {
    state.rows = [];
    state.rpcCalls = [];
    state.rpcError = null;

    await expect(
      completeDailyChallenge(
        { dropDate: "2026-11-08", solved: true, score: 8500, challengeId: "daily" },
        null,
      ),
    ).resolves.toEqual({ error: null, alreadySolved: false });
    await expect(
      completeDailyChallenge(
        { dropDate: "today", solved: true, score: 8500, challengeId: "daily" },
        "scout-1",
      ),
    ).resolves.toEqual({ error: null, alreadySolved: false });

    expect(state.rows).toHaveLength(0);
    expect(state.rpcCalls).toHaveLength(0);
  });
});
