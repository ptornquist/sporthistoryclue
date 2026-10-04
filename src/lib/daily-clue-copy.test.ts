import { describe, expect, it } from "vitest";
import { DAILY_SPORT_IDS, dailyFixtureSources, fixtureIdForSportDay, sportForFixture } from "./daily-sport";
import { SUMMIT_SERIES_1972_CARDS, SVERIGE_SOVJET_1984_CARDS } from "./case-clues";
import { dailyClueFitsSport, publishDailyClues } from "./daily-clue-copy";

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
      const sport = sportForFixture(id);
      expect(sport).toBeTruthy();
      for (const clue of clues) {
        expect(dailyClueFitsSport(clue, sport!)).toBe(true);
      }
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
    expect(clues.join(" ")).not.toMatch(/mittcirkeln|avspark|volley|nickmål|bollen/i);
  });

  it("drops football wording from a hockey row and fills with rink language", () => {
    const clues = publishDailyClues(
      "okand-hockeykvall",
      [
        "Pucken ligger still i ishallen innan första perioden.",
        "Domaren pekar mot mittcirkeln innan avspark.",
        "Ett inlägg möts på volley.",
        "Nickmålet avgör på gräset.",
        "Special teams avgör mot NHL.",
      ],
      "Ishockey",
    );
    expect(clues).toHaveLength(5);
    expect(new Set(clues).size).toBe(5);
    expect(clues[0]).toMatch(/Pucken ligger still/);
    expect(clues.join(" ")).not.toMatch(/mittcirkeln|avspark|volley|nickmål|gräset|special teams|nhl/i);
    expect(clues.join(" ")).toMatch(/puck|ishall|byte|blålinje|siren|sarg|period/i);
  });

  it("writes every hockey classic in rink Swedish and drops football or English lines", () => {
    const hockey = dailyFixtureSources().filter(
      (id) =>
        sportForFixture(id) === "ice_hockey" && id !== "summit-series-1972" && id !== "sverige-sovjet-1984",
    );
    expect(hockey.length).toBeGreaterThan(0);
    for (const id of hockey) {
      const text = publishDailyClues(
        id,
        ["8,500 roaring spectators pack the rink.", "Domaren pekar mot mittcirkeln innan avspark och ett inlägg på bollen."],
        "Football",
      ).join(" ");
      expect(text).toMatch(/puck/i);
      expect(text).toMatch(/sarg/i);
      expect(text).toMatch(/period/i);
      expect(text).toMatch(/blålinj/i);
      expect(text).toMatch(/utvisningsbås/i);
      expect(text).not.toMatch(/avspark|mittcirkel|inlägg|\bboll|roaring|spectators|\brink\b|nhl|8-matchers/i);
    }
  });

  it("publishes the Scandinavium 1984 cards in order", () => {
    const cards = publishDailyClues("sverige-sovjet-1984", ["Amateurs against a machine."], "ice_hockey");
    expect(cards).toEqual([...SVERIGE_SOVJET_1984_CARDS]);
    expect(cards[0]).toMatch(/Scandinavium/);
    expect(cards[3]).toMatch(/sargen/);
    expect(cards[4]).toMatch(/Slutsignalen/);
    expect(publishDailyClues("daily-ice_hockey-2026-10-04", cards, "ice_hockey")).toEqual(cards);
  });

  it("publishes the 1972 Summit Series cards in order", () => {
    const cards = publishDailyClues("summit-series-1972", ["Amateurs against a machine."], "ice_hockey");
    expect(cards).toEqual([...SUMMIT_SERIES_1972_CARDS]);
    expect(publishDailyClues("daily-ice_hockey-2026-10-04", cards, "ice_hockey")).toEqual(cards);
  });

  it("keeps the climax on the last card", () => {
    const clues = publishDailyClues("hurst-1966", [], "football");
    expect(clues[0]).toMatch(/arena|sidlinje|hemmaplan|Wembley/i);
    expect(clues[3]).toMatch(/förlängning|ribban|linjedomaren/i);
    expect(clues[4]).toMatch(/1966/);
    expect(clues[4]).toMatch(/4–2/);
    expect(clues[4]).toMatch(/Hurst/);
    expect(clues.slice(0, 4).join(" ")).not.toMatch(/Geoff Hurst/);
  });

  it("saves the hockey result for the last card", () => {
    const clues = publishDailyClues("miracle-1980", [], "ice_hockey");
    expect(clues[0]).toMatch(/ishall|sarg|puck/i);
    expect(clues[2]).toMatch(/blålinj|utvisningsbås/i);
    expect(clues[4]).toMatch(/1980/);
    expect(clues[4]).toMatch(/4–3/);
    expect(clues.slice(0, 4).join(" ")).not.toMatch(/Sovjetunionen|4–3/);
  });

  it("keeps a written ladder when the id later becomes a dated sport key", () => {
    const source = fixtureIdForSportDay("tennis", "2026-10-04");
    const first = publishDailyClues(source, ["Centre Court epic."], "Tennis");
    const second = publishDailyClues("daily-tennis-2026-10-04", first, "Tennis");
    expect(second).toEqual(first);
  });
});
