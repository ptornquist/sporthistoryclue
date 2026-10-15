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
    expect(divisionFor(0).name).toBe("Bronsdivisionen");
    expect(divisionFor(9999).name).toBe("Bronsdivisionen");
    expect(divisionFor(10000).name).toBe("Silverdivisionen");
    expect(divisionFor(29999).name).toBe("Silverdivisionen");
    expect(divisionFor(30000).name).toBe("Guldstrategen");
    expect(divisionFor(59999).name).toBe("Guldstrategen");
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
  it("lists only real profiles, including members with zero points", () => {
    const fake = scout({ id: "legend-pele", username: "pele", total_score: 84200, legend: true });
    const quiet = scout({ id: "quiet", username: "quiet", total_score: 0 });
    const live = scout({ id: "live", username: "live", total_score: 1200 });
    expect(fillStandings([])).toEqual([]);
    expect(fillStandings([fake, quiet, live]).map((row) => row.username)).toEqual(["quiet", "live"]);
  });

  it("ranks this week separately and drops a stale week", () => {
    const fresh = scout({ id: "fresh", username: "fresh", total_score: 1000, week_score: 400, week_start: "2026-09-21" });
    const stale = scout({ id: "me", username: "me", total_score: 50000, week_score: 9000, week_start: "2026-09-14" });
    expect(scoreFor(fresh, "week", "2026-09-21")).toBe(400);
    expect(scoreFor(stale, "week", "2026-09-21")).toBe(0);
    const placed = placeScout([stale, fresh], null, "week", "2026-09-21");
    expect(placed.board.map((row) => row.username)).toEqual(["fresh", "me"]);
  });

  it("keeps a signed-in scout on the position line", () => {
    const viewer = scout({ id: "me", username: "icebreaker", total_score: 800, week_score: 800 });
    const placed = placeScout([], viewer, "all", "2026-09-21");
    expect(placed.rank).toBe(1);
    expect(formatPositionLine({
      rank: placed.rank ?? 1,
      username: viewer.username,
      title: "Isanalytiker",
      score: 800,
      pointsToNext: 9200,
    })).toBe("DIN PLATS: #1 · @icebreaker · Isanalytiker · 800 poäng · Nästa nivå om 9 200 poäng");
  });

  it("keeps scouts from every club on one global board", () => {
    const swedish = scout({ id: "se", username: "gnaget", total_score: 4000, favorite_club: "aik" });
    const international = scout({ id: "en", username: "gunner", total_score: 5000, favorite_club: "arsenal" });
    const placed = placeScout([swedish, international], null, "all", "2026-09-21");
    expect(placed.board.some((row) => row.id === "se")).toBe(true);
    expect(placed.board.some((row) => row.id === "en")).toBe(true);
  });

  it("filters the Sweden board to Swedish clubs", () => {
    expect(fillStandings([], "se")).toEqual([]);

    const international = scout({
      id: "arsenal-fan",
      username: "arsenal-fan",
      total_score: 50000,
      favorite_club: "arsenal",
    });
    const national = scout({
      id: "gnaget",
      username: "gnaget",
      total_score: 4000,
      favorite_club: "aik",
    });
    const board = fillStandings([international, national], "se");
    expect(board.some((row) => row.username === "gnaget")).toBe(true);
    expect(board.some((row) => row.username === "arsenal-fan")).toBe(false);

    const placed = placeScout([international], national, "all", "2026-09-21", "se");
    expect(placed.board.some((row) => row.id === "gnaget")).toBe(true);
    expect(placed.board.some((row) => row.id === "arsenal-fan")).toBe(false);
    expect(placed.rank).toBeGreaterThan(0);
  });

  it("keeps a signed-in scout with no points on the table", () => {
    const viewer = scout({
      id: "me",
      username: "ptornquist",
      total_score: 0,
      week_score: 0,
      streak: 3,
      matches_solved: 2,
    });
    const placed = placeScout([], viewer, "all", "2026-09-21");
    const mine = placed.board.find((row) => row.id === "me");
    expect(mine).toMatchObject({ username: "ptornquist", streak: 3, matches_solved: 2, total_score: 0 });
    expect(placed.rank).toBeGreaterThan(0);
  });
});
