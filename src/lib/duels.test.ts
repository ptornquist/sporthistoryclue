import { describe, expect, it, vi } from "vitest";
import {
  cleanHandle,
  completePendingDuel,
  decideWinner,
  formatAgo,
  groupDuels,
  mergeDuels,
  outcomeFor,
  rematchLink,
  sendDuelChallenge,
  validChallengeId,
  validHandle,
  validScore,
} from "./duels";

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

  it("keeps a pending duel open when the opponent starts at 0", () => {
    const groups = groupDuels(
      [
        {
          id: "4",
          challenger_username: "ada",
          opponent_username: "beau",
          challenger_score: 8500,
          opponent_score: 0,
          status: "pending",
          challenge_id: "hand-of-god-1986",
        },
      ],
      "beau",
    );
    expect(groups.incoming.map((row) => row.id)).toEqual(["4"]);
    expect(groups.completed).toEqual([]);
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
      data: { id: "d1", challenger_username: "ada", challenger_score: 1000, opponent_score: 0, status: "pending" },
      error: null,
    }));
    const or = vi.fn(() => ({ maybeSingle }));
    const eqRead = vi.fn(() => ({ or }));
    const ilike = vi.fn(() => ({ eq: eqRead }));
    const select = vi.fn(() => ({ ilike }));
    const from = vi.fn((table: string) => (table === "duels" ? { select, update } : {}));

    await completePendingDuel("beau", "2026-10-02", 2500, { from } as never);

    expect(ilike).toHaveBeenCalledWith("opponent_username", "beau");
    expect(eqRead).toHaveBeenCalledWith("challenge_id", "2026-10-02");
    expect(or).toHaveBeenCalledWith("status.eq.pending,opponent_score.is.null");
    expect(update).toHaveBeenCalledWith({
      opponent_score: 2500,
      winner_username: "beau",
      status: "completed",
    });
    expect(eq).toHaveBeenCalledWith("id", "d1");
  });

  it("normalizes handles and picks the challenger on a tie", () => {
    expect(cleanHandle("@Ada")).toBe("ada");
    expect(validHandle("ada")).toBe(true);
    expect(validHandle("  ")).toBe(false);
    expect(validChallengeId("2026-10-02")).toBe(true);
    expect(validScore(0)).toBe(true);
    expect(validScore(Number.NaN)).toBe(false);
    expect(decideWinner("ada", 1000, "beau", 1000)).toBe("ada");
    expect(decideWinner("ada", 1000, "beau", 2500)).toBe("beau");
    expect(outcomeFor("beau", {
      id: "d1",
      challenge_id: "2026-10-02",
      challenger_username: "ada",
      challenger_score: 1000,
      opponent_username: "beau",
      opponent_score: 2500,
      winner_username: "beau",
    })).toBe("victory");
    expect(mergeDuels(
      [{ id: "1", challenge_id: "a", challenger_username: "ada", challenger_score: 1, opponent_username: "beau" }],
      [{ id: "1", challenge_id: "a", challenger_username: "ada", challenger_score: 1, opponent_username: "beau" }],
    )).toHaveLength(1);
    expect(rematchLink("Ada", 2500, "miracle-on-ice-1980")).toBe("/?duel=ada&pts=2500&match=miracle-on-ice-1980");
    expect(formatAgo(new Date(Date.now() - 5_000).toISOString(), new Date())).toBe("just now");
  });
});
