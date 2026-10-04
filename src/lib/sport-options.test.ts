import { describe, expect, it } from "vitest";
import { distinctOptionValues } from "./option-text";
import {
  AIK_DJURGARDEN_2017_OPTIONS,
  ALLSVENSKAN_MATCHUPS,
  BRYNAS_SKELLEFTEA_2012_OPTIONS,
  ELFSBORG_DJURGARDEN_2006_OPTIONS,
  FARJESTAD_SKELLEFTEA_2011_OPTIONS,
  FROLUNDA_SKELLEFTEA_2016_OPTIONS,
  HAMMARBY_AIK_2016_OPTIONS,
  MALMO_IFK_2015_OPTIONS,
  SKELLEFTEA_FARJESTAD_2014_OPTIONS,
  domesticLeagueOptions,
  ensureFourDailyOptions,
  gradesDailyOption,
  SUMMIT_SERIES_1972_OPTIONS,
  SVERIGE_SOVJET_1984_OPTIONS,
  inferOptionSport,
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

  it.each([
    ["farjestad-skelleftea-2011", "Färjestad mot Skellefteå", 2011, "ice_hockey", FARJESTAD_SKELLEFTEA_2011_OPTIONS],
    ["brynas-skelleftea-2012", "Brynäs mot Skellefteå", 2012, "ice_hockey", BRYNAS_SKELLEFTEA_2012_OPTIONS],
    ["skelleftea-farjestad-2014", "Skellefteå mot Färjestad", 2014, "ice_hockey", SKELLEFTEA_FARJESTAD_2014_OPTIONS],
    ["frolunda-skelleftea-2016", "Frölunda mot Skellefteå", 2016, "ice_hockey", FROLUNDA_SKELLEFTEA_2016_OPTIONS],
    ["aik-djurgarden-2017", "AIK mot Djurgården", 2017, "football", AIK_DJURGARDEN_2017_OPTIONS],
    ["malmo-ifk-2015", "Malmö FF mot IFK Göteborg", 2015, "football", MALMO_IFK_2015_OPTIONS],
    ["elfsborg-djurgarden-2006", "Elfsborg mot Djurgården", 2006, "football", ELFSBORG_DJURGARDEN_2006_OPTIONS],
    ["hammarby-aik-2016", "Hammarby mot AIK", 2016, "football", HAMMARBY_AIK_2016_OPTIONS],
  ] as const)("%s grades its own four club buttons", (slug, subject, year, sport, pool) => {
    expect(domesticLeagueOptions(slug)).toEqual(pool);
    const correct = pool[0];
    const options = ensureFourDailyOptions([correct], sport, slug, () => 0);
    expect([...options].sort()).toEqual([...pool].sort());
    expect(options).toContain(correct);
    expect(gradesDailyOption(correct, subject, year, sport)).toBe(true);
    for (const decoy of pool.slice(1)) {
      expect(gradesDailyOption(decoy, subject, year, sport)).toBe(false);
    }
    expect(options.every((option) => optionSport(option) === sport)).toBe(true);
  });
});

describe("ensureFourDailyOptions", () => {
  const stable = () => 0;

  it("turns one raw international hockey string into four Swedish choices", () => {
    const options = ensureFourDailyOptions(
      ["1980 Olympics: USA vs Soviet Union"],
      "ice_hockey",
      "miracle-on-ice-1980",
      stable,
    );
    expect(domesticLeagueOptions("miracle-on-ice-1980")).toBeNull();
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options.some((option) => option.includes("USA mot Sovjetunionen"))).toBe(true);
    expect(options.join(" ")).not.toMatch(/\bvs\b|Olympics:|defeats/);
    expect(options.every((option) => !SHL_MATCHUPS.includes(option as (typeof SHL_MATCHUPS)[number]))).toBe(true);
  });

  it("keeps a football milestone in Swedish and outside Allsvenskan", () => {
    const options = ensureFourDailyOptions(["1999 football: Brandi Chastain"], "football", null, stable);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options.some((option) => option.includes("Brandi Chastain") && option.includes("1999"))).toBe(true);
    expect(options.join(" ")).not.toMatch(/1999 football:|\bvs\b/);
    expect(options.every((option) => !ALLSVENSKAN_MATCHUPS.includes(option as (typeof ALLSVENSKAN_MATCHUPS)[number]))).toBe(
      true,
    );
  });

  it.each([null, undefined, [] as string[]])("fills an empty %s football list from Allsvenskan", (input) => {
    const options = ensureFourDailyOptions(input, "football", null, stable);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options.every((option) => ALLSVENSKAN_MATCHUPS.includes(option as (typeof ALLSVENSKAN_MATCHUPS)[number]))).toBe(
      true,
    );
    expect(options.join(" ")).not.toMatch(/USA|Argentina/);
  });

  it("fills an empty hockey list from the SHL", () => {
    const options = ensureFourDailyOptions([], "ice_hockey", null, stable);
    expect(options).toHaveLength(4);
    expect([...options].sort()).toEqual([...SHL_MATCHUPS].sort());
    expect(options.join(" ")).not.toMatch(INTERNATIONAL);
  });

  it("keeps Scandinavium 1984 on its four hockey buttons", () => {
    const options = ensureFourDailyOptions(
      ["Sverige mot Sovjetunionen (1984)"],
      "ice_hockey",
      "sverige-sovjet-1984",
      stable,
    );
    expect([...options].sort()).toEqual([...SVERIGE_SOVJET_1984_OPTIONS].sort());
    const again = ensureFourDailyOptions(options, "ice_hockey", "daily-ice_hockey-2026-10-04", stable);
    expect([...again].sort()).toEqual([...SVERIGE_SOVJET_1984_OPTIONS].sort());
    expect(gradesDailyOption("Sverige mot Sovjetunionen (1984)", "Sverige mot Sovjetunionen", 1984, "ice_hockey")).toBe(
      true,
    );
    expect(gradesDailyOption("Kanada mot Sovjetunionen (1972)", "Sverige mot Sovjetunionen", 1984, "ice_hockey")).toBe(
      false,
    );
    expect(gradesDailyOption("Sverige mot Kanada (1987)", "Sverige mot Sovjetunionen", 1984, "ice_hockey")).toBe(
      false,
    );
    expect(gradesDailyOption("Sverige mot Sovjetunionen (1981)", "Sverige mot Sovjetunionen", 1984, "ice_hockey")).toBe(
      false,
    );
    expect(options).toContain("Sverige mot Sovjetunionen (1981)");
    expect(options).toContain("Sverige mot Sovjetunionen (1984)");
    expect(SVERIGE_SOVJET_1984_OPTIONS[3]).toBe("Sverige mot Sovjetunionen (1984)");
    expect(
      gradesDailyOption("Tjeckoslovakien mot Sovjetunionen (1976)", "Sverige mot Sovjetunionen", 1984, "ice_hockey"),
    ).toBe(false);
  });

  it("keeps the 1972 Summit Series on its four hockey buttons", () => {
    const options = ensureFourDailyOptions(
      ["Kanada mot Sovjetunionen (1972)"],
      "ice_hockey",
      "summit-series-1972",
      stable,
    );
    expect([...options].sort()).toEqual([...SUMMIT_SERIES_1972_OPTIONS].sort());
    const again = ensureFourDailyOptions(options, "ice_hockey", "daily-ice_hockey-2026-10-04", stable);
    expect([...again].sort()).toEqual([...SUMMIT_SERIES_1972_OPTIONS].sort());
    expect(gradesDailyOption("Kanada mot Sovjetunionen (1972)", "Kanada mot Sovjetunionen", 1972, "ice_hockey")).toBe(
      true,
    );
    expect(gradesDailyOption("Sverige mot Sovjetunionen (1977)", "Kanada mot Sovjetunionen", 1972, "ice_hockey")).toBe(
      false,
    );
    expect(gradesDailyOption("Kanada mot USA (1980)", "Kanada mot Sovjetunionen", 1972, "ice_hockey")).toBe(false);
    expect(
      gradesDailyOption("Tjeckoslovakien mot Sovjetunionen (1976)", "Kanada mot Sovjetunionen", 1972, "ice_hockey"),
    ).toBe(false);
  });

  it("keeps a league campaign on Swedish clubs", () => {
    const options = ensureFourDailyOptions(
      ["Växjö mot Frölunda (2015)"],
      "ice_hockey",
      "slaget-i-sudden",
      stable,
    );
    expect(options).toHaveLength(4);
    expect([...options].sort()).toEqual([...SHL_MATCHUPS].sort());
    expect(options.join(" ")).not.toMatch(INTERNATIONAL);
  });

  it("pads an unknown sport without leaving a raw English singleton", () => {
    const options = ensureFourDailyOptions(
      ["1980 Olympics: USA vs Soviet Union"],
      "Sports History",
      null,
      stable,
    );
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options.join(" ")).not.toMatch(/\bvs\b|Olympics:/);
  });

  it("reads a general hockey button set as ice hockey", () => {
    const options = [
      "USA mot Sovjetunionen (1980)",
      "Kanada mot Sovjetunionen (Summit Series) (1972)",
      "Sverige mot Sovjetunionen (1984)",
      "Tjeckoslovakien mot Sovjetunionen (1976)",
    ];
    expect(inferOptionSport(options)).toBe("ice_hockey");
    const resolved = ensureFourDailyOptions(options, "general", null, stable);
    expect(resolved).toHaveLength(4);
    expect(resolved.every((option) => optionSport(option) === "ice_hockey" || /sovjet/i.test(option))).toBe(true);
    expect(resolved.join(" ")).not.toMatch(/Hammarby|Hurst|Pelé|Italien|Allsvenskan/i);
    expect(resolved.join(" ")).not.toMatch(/Summit Series/);
  });

  it("replaces hockey buttons when the sport is football", () => {
    const options = ensureFourDailyOptions(
      [
        "USA mot Sovjetunionen (1980)",
        "Kanada mot Sovjetunionen (1972)",
        "Sverige mot Finland (2006)",
        "Skellefteå mot Luleå (2013)",
      ],
      "football",
      null,
      stable,
    );
    expect(options).toHaveLength(4);
    expect(options.every((option) => optionSport(option) === "football")).toBe(true);
    expect(options.join(" ")).not.toMatch(/Sovjet|Skellefteå|Frölunda|Summit/i);
    expect(SPORT_CHOICES.football.some((option) => option.includes("Sverige mot Italien"))).toBe(true);
  });

  it("still grades the Swedish wording of an international milestone", () => {
    const chastain = ensureFourDailyOptions(["1999 football: Brandi Chastain"], "football", null, stable).find(
      (option) => option.includes("Brandi Chastain"),
    );
    expect(gradesDailyOption(chastain ?? "", "Brandi Chastain", 1999, "football")).toBe(true);
    expect(gradesDailyOption("Hammarby mot Djurgården (2018)", "Brandi Chastain", 1999, "football")).toBe(false);
    const miracle = ensureFourDailyOptions(
      ["1980 Olympics: USA vs Soviet Union"],
      "ice_hockey",
      null,
      stable,
    ).find((option) => option.includes("USA mot Sovjetunionen"));
    expect(miracle).toBeTruthy();
    expect(gradesDailyOption(miracle ?? "", "USA vs Soviet Union", 1980, "ice_hockey")).toBe(true);
  });
});
