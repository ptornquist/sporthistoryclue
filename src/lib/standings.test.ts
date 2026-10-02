import { describe, expect, it } from "vitest";
import {
  divisionFor,
  fillStandings,
  formatPositionLine,
  placeScout,
  pointsToNextTier,
  scoreFor,
  type StandingRow,
} from "./standings";

function scout(partial: Partial<StandingRow> & Pick<StandingRow, "id" | "username" | "total_score">): StandingRow {
  return {
    week_score: 0,
    week_start: "2026-09-21",
    streak: 1,
    equipped_title: "rookie",
    equipped_frame: "standard",
    matches_solved: 1,
    avatar_url: null,
    ...partial,
  };
}

describe("division tiers", () => {
  it("places the boundaries on the published ranges", () => {
    expect(divisionFor(0).name).toBe("Bronze League");
    expect(divisionFor(9999).name).toBe("Bronze League");
    expect(divisionFor(10000).name).toBe("Silver League");
    expect(divisionFor(29999).name).toBe("Silver League");
    expect(divisionFor(30000).name).toBe("Gold Tactician");
    expect(divisionFor(59999).name).toBe("Gold Tactician");
    expect(divisionFor(60000).name).toBe("Hall of Fame");
  });

  it("counts the points left until the next tier", () => {
    expect(pointsToNextTier(8800)).toBe(1200);
    expect(pointsToNextTier(10000)).toBe(20000);
    expect(pointsToNextTier(59999)).toBe(1);
    expect(pointsToNextTier(60000)).toBeNull();
  });
});

describe("standings board", () => {
  it("fills an empty table with legends and leaves a full table alone", () => {
    expect(fillStandings([])).toHaveLength(8);
    const live = ["a", "b", "c", "d", "e"].map((id, index) =>
      scout({ id, username: id, total_score: 1000 * (index + 1) }),
    );
    expect(fillStandings(live).every((row) => !row.legend)).toBe(true);
  });

  it("ranks this week separately and drops a stale week", () => {
    const bolt = scout({ id: "legend-bolt", username: "bolt", total_score: 22100, week_score: 7600, legend: true });
    const pele = scout({ id: "legend-pele", username: "pele", total_score: 84200, week_score: 9100, legend: true });
    expect(scoreFor(bolt, "week", "2026-09-21")).toBe(7600);
    const stale = scout({ id: "me", username: "me", total_score: 50000, week_score: 9000, week_start: "2026-09-14" });
    expect(scoreFor(stale, "week", "2026-09-21")).toBe(0);
    const placed = placeScout([stale], null, "week", "2026-09-21");
    expect(placed.board[0]?.username).not.toBe("me");
    expect(pele.total_score).toBeGreaterThan(bolt.total_score);
  });

  it("keeps a signed-in scout on the position line even below the top of the card", () => {
    const viewer = scout({ id: "me", username: "icebreaker", total_score: 800, week_score: 800 });
    const placed = placeScout([], viewer, "all", "2026-09-21");
    expect(placed.rank).toBe(9);
    expect(formatPositionLine({
      rank: placed.rank ?? 1,
      username: viewer.username,
      title: "Ice Analyst",
      score: 800,
      pointsToNext: 9200,
    })).toBe("YOUR RANK: #9 · @icebreaker · Ice Analyst · 800 PTS · Next Tier in 9,200 PTS");
  });
});
