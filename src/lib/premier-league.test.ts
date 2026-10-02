import { readFileSync } from "node:fs";
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
      "⚽ +8,500 PTS bagged for Arsenal FC in the Supporters Derby!",
    );
  });

  it("seeds derby_clubs with ids the allegiance check already allows", () => {
    const sql = readFileSync(
      new URL("../../supabase/migrations/20260927185517_derby_clubs.sql", import.meta.url),
      "utf8",
    );
    const ids = [...sql.matchAll(/\('([a-z-]+)',/g)].map((match) => match[1]);
    expect(ids).toEqual([
      "arsenal",
      "liverpool",
      "manchester-city",
      "manchester-united",
      "chelsea",
      "tottenham",
      "newcastle",
      "aston-villa",
    ]);
    expect(ids.every((id) => PREMIER_LEAGUE_CLUBS.some((club) => club.id === id))).toBe(true);
    expect(sql).toContain('enable row level security');
    expect(sql).toContain('create policy "Public read and update derby_clubs"');
    expect(sql).toContain("using (true)");
    expect(sql).toContain("with check (true)");
  });
});
