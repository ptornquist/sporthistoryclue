import { describe, expect, it } from "vitest";
import { STORYLINES, arenaHref, firstOpenMatch, nextStorylineMatch, storylineById } from "./storylines";

describe("storyline routing", () => {
  it("points each fixture at that match and campaign", () => {
    expect(arenaHref("comaneci-1976", "olympic-miracles")).toBe(
      "/play/comaneci-1976?campaign=olympic-miracles",
    );
    expect(arenaHref("bolt-beijing-2008")).toBe("/play/bolt-beijing-2008");
  });

  it("starts a campaign on the first unsolved fixture", () => {
    const storyline = storylineById("olympic-miracles");
    expect(storyline).toBeTruthy();
    const next = firstOpenMatch(storyline!.matches, { "comaneci-1976": { score: 8000 } });
    expect(next?.key).toBe("dream-team-1992");
    expect(firstOpenMatch(storyline!.matches, {})?.key).toBe("comaneci-1976");
  });

  it("labels each era without a year range", () => {
    expect(STORYLINES.map((storyline) => storyline.era)).toEqual([
      "COLD WAR ERA",
      "OLYMPIC ERA",
      "CLASSIC ERA",
      "RIVALRY ERA",
      "LANDSLAGSERAN",
    ]);
    for (const storyline of STORYLINES) {
      expect(storyline.era).not.toMatch(/\d/);
      expect(`${storyline.description} ${storyline.matches.map((match) => match.title).join(" ")}`).not.toMatch(
        /Lake Placid|Beijing|Hamilton/,
      );
    }
  });

  it("walks to the next fixture in the storyline", () => {
    expect(nextStorylineMatch("cold-war-on-ice", "miracle-on-ice-1980")?.key).toBe("summit-series-1972");
    expect(nextStorylineMatch("cold-war-on-ice", "summit-series-1972")).toBeNull();
    expect(nextStorylineMatch("svenska-underverk", "pasadena-bronze-1994")?.key).toBe("turin-gold-2006");
    expect(nextStorylineMatch("svenska-underverk", "turin-gold-2006")).toBeNull();
    expect(storylineById("svenska-underverk")?.matches.map((match) => match.title)).toEqual([
      "Sommarnatten i västern",
      "Vintermorgonen i alperna",
    ]);
    expect(storylineById("svenska-underverk")?.matches.map((match) => `${match.year} · ${match.context}`)).toEqual([
      "1994 · Världsmästerskapet",
      "2006 · Internationell mästerskapsfinal",
    ]);
    expect(arenaHref("pasadena-bronze-1994", "svenska-underverk")).toBe(
      "/play/pasadena-bronze-1994?campaign=svenska-underverk",
    );
  });
});
