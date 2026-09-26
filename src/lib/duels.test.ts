import { describe, expect, it } from "vitest";
import {
  decideWinner,
  duelHandleName,
  duelPrompt,
  formatAgo,
  mergeDuels,
  outcomeFor,
  pickRematchSlug,
  rematchLink,
  sidesFor,
  type DuelRecord,
} from "./duels";

function duel(partial: Partial<DuelRecord>): DuelRecord {
  return {
    id: "1",
    created_at: "2026-09-26T08:00:00.000Z",
    challenge_id: "summit-series-1972",
    challenger_username: "icebreaker",
    challenger_score: 5500,
    opponent_username: "Guest Scout",
    opponent_score: 8500,
    winner_username: "Guest Scout",
    ...partial,
  };
}

describe("duel records", () => {
  it("names the higher score and a tie", () => {
    expect(decideWinner("icebreaker", 5500, "Guest Scout", 8500)).toBe("Guest Scout");
    expect(decideWinner("icebreaker", 8500, "Guest Scout", 5500)).toBe("icebreaker");
    expect(decideWinner("icebreaker", 7000, "Guest Scout", 7000)).toBe("TIE");
  });

  it("uses Guest Scout when the player has no handle", () => {
    expect(duelHandleName("Scout")).toBe("Guest Scout");
    expect(duelHandleName("@icebreaker")).toBe("icebreaker");
  });

  it("writes the result from the recipient's side", () => {
    expect(duelPrompt("icebreaker", 8500, 5500)).toBe("⚔️ You defeated @icebreaker by +3,000 PTS!");
    expect(duelPrompt("icebreaker", 4000, 5500)).toBe("⚔️ Defeated by @icebreaker (-1,500 PTS)");
    expect(outcomeFor("Guest Scout", duel({}))).toBe("victory");
    expect(outcomeFor("icebreaker", duel({ winner_username: "TIE" }))).toBe("draw");
    expect(sidesFor("Guest Scout", duel({})).you).toBe(8500);
  });

  it("picks an unplayed archive slug for a rematch link", () => {
    const slug = pickRematchSlug(["summit-series-1972", "miracle-on-ice-1980", "miracle-1980"], () => 0);
    expect(slug).not.toBe("summit-series-1972");
    expect(slug).not.toBe("miracle-on-ice-1980");
    expect(rematchLink("icebreaker", 8500, slug)).toBe(
      `https://sportshistoryclue.com/?match=${slug}&duel=icebreaker&pts=8500`,
    );
  });

  it("says how long ago a clash was logged", () => {
    const now = new Date("2026-09-26T10:00:00.000Z");
    expect(formatAgo("2026-09-26T08:00:00.000Z", now)).toBe("2 hours ago");
    expect(formatAgo("2026-09-26T09:59:40.000Z", now)).toBe("just now");
  });

  it("keeps the newest twenty clashes", () => {
    const remote = [duel({ id: "remote", created_at: "2026-09-26T09:00:00.000Z" })];
    const local = [duel({ id: "local", created_at: "2026-09-26T11:00:00.000Z" }), duel({ id: "remote" })];
    const merged = mergeDuels(remote, local);
    expect(merged.map((row) => row.id)).toEqual(["local", "remote"]);
  });
});
