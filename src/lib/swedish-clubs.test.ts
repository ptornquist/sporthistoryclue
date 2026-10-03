import { describe, expect, it } from "vitest";
import { SWEDISH_CLUBS, rankClubChampionship } from "./swedish-clubs";

describe("Klubbligan", () => {
  it("sums career points for each Swedish club and ranks them", () => {
    const rows = rankClubChampionship([
      { favorite_club: "AIK", career_score: 1000 },
      { favorite_club: "AIK", career_score: 500 },
      { favorite_club: "Djurgården", career_score: 4000 },
      { favorite_club: "arsenal", career_score: 9000 },
      { favorite_club: null, career_score: 200 },
    ]);

    expect(rows[0]).toEqual({ club: "Djurgården", points: 4000, scouts: 1 });
    expect(rows[1]).toEqual({ club: "AIK", points: 1500, scouts: 2 });
    expect(rows).toHaveLength(SWEDISH_CLUBS.length);
    expect(rows.find((row) => row.club === "Hammarby")).toEqual({ club: "Hammarby", points: 0, scouts: 0 });
    expect(rows.map((row) => row.club).join("|")).not.toContain("arsenal");
  });
});
