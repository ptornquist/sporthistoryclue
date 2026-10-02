import { describe, expect, it, vi } from "vitest";
import { completePendingDuel, groupDuels, sendDuelChallenge } from "./duels";

describe("duels", () => {
  it("groups incoming, sent, and completed rows", () => {
    const groups = groupDuels(
      [
        { id: "1", challenger_username: "ada", opponent_username: "beau", opponent_score: null, challenge_id: "2026-10-02" },
        { id: "2", challenger_username: "beau", opponent_username: "cy", opponent_score: null, challenge_id: "2026-10-02" },
        { id: "3", challenger_username: "ada", opponent_username: "beau", challenger_score: 1000, opponent_score: 2500, winner_username: "beau", challenge_id: "2026-10-01" },
      ],
      "beau",
    );
    expect(groups.incoming.map((row) => row.id)).toEqual(["1"]);
    expect(groups.sent.map((row) => row.id)).toEqual(["2"]);
    expect(groups.completed.map((row) => row.id)).toEqual(["3"]);
  });

  it("sends today's challenge through create_user_duel", async () => {
    const rpc = vi.fn(async () => ({ data: { success: true, duel_id: "d1" }, error: null }));
    const result = await sendDuelChallenge("@ptornquist", 7500, "2026-10-02", { rpc } as never);
    expect(rpc).toHaveBeenCalledWith("create_user_duel", {
      p_opponent_username: "ptornquist",
      p_challenge_id: "2026-10-02",
      p_challenger_score: 7500,
    });
    expect(result.data?.success).toBe(true);
  });

  it("writes the opponent score and winner when a pending duel matches the fixture", async () => {
    const eq = vi.fn(async () => ({ error: null }));
    const update = vi.fn(() => ({ eq }));
    const maybeSingle = vi.fn(async () => ({
      data: { id: "d1", challenger_username: "ada", challenger_score: 1000, opponent_score: null },
      error: null,
    }));
    const is = vi.fn(() => ({ maybeSingle }));
    const eqRead = vi.fn(() => ({ is }));
    const ilike = vi.fn(() => ({ eq: eqRead }));
    const select = vi.fn(() => ({ ilike }));
    const from = vi.fn((table: string) => (table === "duels" ? { select, update } : {}));

    await completePendingDuel("beau", "2026-10-02", 2500, { from } as never);

    expect(ilike).toHaveBeenCalledWith("opponent_username", "beau");
    expect(eqRead).toHaveBeenCalledWith("challenge_id", "2026-10-02");
    expect(update).toHaveBeenCalledWith({
      opponent_score: 2500,
      winner_username: "beau",
      status: "completed",
    });
    expect(eq).toHaveBeenCalledWith("id", "d1");
  });
});
