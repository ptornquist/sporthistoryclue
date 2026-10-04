import { describe, expect, it } from "vitest";
import { DAILY_SPORT_IDS, dailyFixtureSources, fixtureIdForSportDay } from "./daily-sport";
import { publishDailyClues } from "./daily-clue-copy";

const BANNED = /Avgörandet sparas till det sista kortet|Ett beskuret arkivfoto|Lake Placid|Centre Court|Amateurs against/i;

describe("publishDailyClues", () => {
  it("gives every daily fixture five unique Swedish cards", () => {
    const packs: string[] = [];
    for (const id of dailyFixtureSources()) {
      const clues = publishDailyClues(id, ["Amateurs against a machine."], "Sports History");
      expect(clues).toHaveLength(5);
      expect(new Set(clues).size).toBe(5);
      expect(clues.join(" ")).not.toMatch(BANNED);
      packs.push(clues.join(" | "));
    }
    expect(new Set(packs).size).toBe(packs.length);
  });

  it("keeps the same date's sports on different ladders", () => {
    const date = "2026-10-04";
    const sets = DAILY_SPORT_IDS.map((sport) =>
      publishDailyClues(fixtureIdForSportDay(sport, date), [], sport).join(" | "),
    );
    expect(new Set(sets).size).toBe(DAILY_SPORT_IDS.length);
  });

  it("does not repeat one fallback when the stored clues are English", () => {
    const clues = publishDailyClues(
      "unknown-row",
      [
        "Amateurs against a professional machine.",
        "Amateurs against a professional machine.",
        "The winner takes the scoreboard.",
      ],
      "ice_hockey",
    );
    expect(clues).toHaveLength(5);
    expect(new Set(clues).size).toBe(5);
    expect(clues.join(" ")).not.toMatch(BANNED);
    expect(clues.join(" ")).toMatch(/ishall|hockey|puck|byte|siren/i);
  });

  it("keeps a written ladder when the id later becomes a dated sport key", () => {
    const source = fixtureIdForSportDay("tennis", "2026-10-04");
    const first = publishDailyClues(source, ["Centre Court epic."], "Tennis");
    const second = publishDailyClues("daily-tennis-2026-10-04", first, "Tennis");
    expect(second).toEqual(first);
  });
});
