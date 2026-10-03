import { describe, expect, it } from "vitest";
import { distinctOptionValues } from "./option-text";
import {
  ALLSVENSKAN_MATCHUPS,
  domesticLeagueOptions,
  optionSport,
  scopeOptionsToSport,
  SHL_MATCHUPS,
  SPORT_CHOICES,
} from "./sport-options";

const INTERNATIONAL =
  /USA|Sovjet|Kanada|Argentina|Brasilien|Italien|England|Uruguay|Finland|Bulgarien|Pelé|Maradona|Tjeckoslovakien/;

const MIXED = Object.values(SPORT_CHOICES).flat();

describe("scopeOptionsToSport", () => {
  it("keeps a football quiz inside football classics", () => {
    const options = scopeOptionsToSport(MIXED, "football");
    expect(options).toHaveLength(4);
    expect(options).toContain("Argentina mot England (1986)");
    expect(options).toContain("Brasilien mot Italien (1970)");
    expect(options.join(" | ")).not.toMatch(/Borg|McEnroe|Comăneci|Sovjet|Foreman|Bolt|Owens|Fosbury/i);
    expect(options.every((option) => optionSport(option) === "football")).toBe(true);
  });

  it.each(["ice_hockey", "football", "boxing", "tennis", "athletics"])(
    "fills %s with four choices from that sport only",
    (sport) => {
      const options = scopeOptionsToSport(
        [
          "Nadia Comăneci (1976)",
          "Björn Borg mot John McEnroe (1980)",
          "USA mot Sovjetunionen (1980)",
          "Argentina mot England (1986)",
          "Usain Bolt (2008)",
          "Muhammad Ali mot George Foreman (1974)",
        ],
        sport,
      );
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options.every((option) => optionSport(option) === sport)).toBe(true);
    },
  );
});

describe("domestic league campaign options", () => {
  it.each([
    ["slaget-i-sudden", "Växjö mot Frölunda (2015)", "ice_hockey", SHL_MATCHUPS],
    ["guldkampen-i-norr", "Skellefteå mot Luleå (2013)", "ice_hockey", SHL_MATCHUPS],
    ["sondagsmorgonen-stockholms-stad", "Hammarby mot Djurgården (2018)", "football", ALLSVENSKAN_MATCHUPS],
    ["guldstriden-sista-omgangen", "IFK Göteborg mot Trelleborg (2007)", "football", ALLSVENSKAN_MATCHUPS],
  ] as const)("%s uses only Swedish club matchups", (slug, correct, sport, pool) => {
    expect(domesticLeagueOptions(slug)).toEqual(pool);
    expect(domesticLeagueOptions("miracle-on-ice-1980")).toBeNull();
    const options = distinctOptionValues([correct, ...pool], 4);
    expect(options).toHaveLength(4);
    expect(options).toContain(correct);
    expect(options.join(" | ")).not.toMatch(INTERNATIONAL);
    expect(options.every((option) => optionSport(option) === sport)).toBe(true);
    expect(scopeOptionsToSport(options, sport)).toEqual(options);
  });
});
