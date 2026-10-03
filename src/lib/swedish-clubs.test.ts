import { describe, expect, it } from "vitest";
import { FOOTBALL_CLUBS, HOCKEY_CLUBS, rankLeague } from "./swedish-clubs";

describe("Klubbligan leagues", () => {
  it("ranks SHL clubs from favorite hockey allegiance and ignores other sports", () => {
    const rows = rankLeague(HOCKEY_CLUBS, [
      { club: "Frölunda", career_score: 2500 },
      { club: "Frölunda", career_score: 1500 },
      { club: "Djurgården", career_score: 4000 },
      { club: "AIK", career_score: 9000 },
      { club: "arsenal", career_score: 8000 },
      { club: null, career_score: 200 },
    ]);

    expect(rows[0]).toEqual({ club: "Djurgården", points: 4000, scouts: 1 });
    expect(rows[1]).toEqual({ club: "Frölunda", points: 4000, scouts: 2 });
    expect(rows).toHaveLength(HOCKEY_CLUBS.length);
    expect(rows.find((row) => row.club === "Rögle")).toEqual({ club: "Rögle", points: 0, scouts: 0 });
    expect(rows.find((row) => row.club === "AIK Hockey")).toEqual({ club: "AIK Hockey", points: 0, scouts: 0 });
    expect(rows.some((row) => row.club === "AIK")).toBe(false);
    expect(rows.some((row) => row.club === "arsenal")).toBe(false);
  });

  it("ranks Allsvenskan clubs separately from hockey allegiance", () => {
    const rows = rankLeague(FOOTBALL_CLUBS, [
      { club: "AIK", career_score: 1000 },
      { club: "AIK", career_score: 500 },
      { club: "Hammarby", career_score: 3000 },
      { club: "Frölunda", career_score: 9000 },
      { club: "Djurgården", career_score: 200 },
    ]);

    expect(rows[0]).toEqual({ club: "Hammarby", points: 3000, scouts: 1 });
    expect(rows[1]).toEqual({ club: "AIK", points: 1500, scouts: 2 });
    expect(rows.find((row) => row.club === "Djurgården")).toEqual({ club: "Djurgården", points: 200, scouts: 1 });
    expect(rows).toHaveLength(FOOTBALL_CLUBS.length);
    expect(rows.some((row) => row.club === "Frölunda")).toBe(false);
  });

  it("lists AIK Hockey first in SHL and AIK first in Allsvenskan", () => {
    expect(HOCKEY_CLUBS[0]).toBe("AIK Hockey");
    expect(HOCKEY_CLUBS).not.toContain("AIK");
    expect(FOOTBALL_CLUBS[0]).toBe("AIK");
    expect(FOOTBALL_CLUBS.indexOf("AIK")).toBeLessThan(FOOTBALL_CLUBS.indexOf("Djurgården"));
    expect(FOOTBALL_CLUBS.indexOf("Djurgården")).toBeLessThan(FOOTBALL_CLUBS.indexOf("Hammarby"));
  });
});
