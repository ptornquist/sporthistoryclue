import { describe, expect, it } from "vitest";
import { optionSport, scopeOptionsToSport, SPORT_CHOICES } from "./sport-options";

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
