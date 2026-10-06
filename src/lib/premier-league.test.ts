import { describe, expect, it } from "vitest";
import {
  PREMIER_LEAGUE_CLUBS,
  derbyContributionLine,
  findPremierLeagueClub,
  rankClubs,
  supporterLabel,
} from "./premier-league";

describe("Premier League derby", () => {
  it("lists the 2026–27 field of twenty clubs", () => {
    expect(PREMIER_LEAGUE_CLUBS).toHaveLength(20);
    expect(findPremierLeagueClub("arsenal")?.name).toBe("Arsenal FC");
    expect(findPremierLeagueClub("coventry")?.name).toBe("Coventry City");
    expect(findPremierLeagueClub("wolves")).toBeNull();
    expect(supporterLabel(findPremierLeagueClub("arsenal")!)).toBe("🔴 Arsenal FC Supporter");
  });

  it("ranks cumulative points and the average per scout", () => {
    const memberships = [
      { favorite_club: "arsenal", total_score: 1000 },
      { favorite_club: "arsenal", total_score: 500 },
      { favorite_club: "liverpool", total_score: 2000 },
      { favorite_club: "not-a-club", total_score: 9000 },
    ];

    const byTotal = rankClubs(memberships, "total");
    expect(byTotal).toHaveLength(20);
    expect(byTotal[0]).toMatchObject({ id: "liverpool", rank: 1, totalPoints: 2000, scouts: 1, average: 2000 });
    expect(byTotal[1]).toMatchObject({ id: "arsenal", rank: 2, totalPoints: 1500, scouts: 2, average: 750 });
    expect(byTotal.filter((row) => row.totalPoints === 0)).toHaveLength(18);

    const byAverage = rankClubs(
      [
        { favorite_club: "arsenal", total_score: 1000 },
        { favorite_club: "arsenal", total_score: 1000 },
        { favorite_club: "chelsea", total_score: 1500 },
      ],
      "average",
    );
    expect(byAverage[0].id).toBe("chelsea");
    expect(byAverage[1].id).toBe("arsenal");
    expect(derbyContributionLine(8500, "Arsenal FC")).toBe(
      "⚽ +8 500 poäng till Arsenal FC i supporterderbyt!",
    );
  });
});
