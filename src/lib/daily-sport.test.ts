import { describe, expect, it } from "vitest";
import { DAILY_SPORT_IDS, fixtureIdForSportDay, sportDailyKey } from "./daily-sport";

describe("daily sport fixtures", () => {
  const date = "2026-10-04";

  it("gives each sport its own fixture and solve key for the same date", () => {
    const fixtures = DAILY_SPORT_IDS.map((sport) => fixtureIdForSportDay(sport, date));
    const keys = DAILY_SPORT_IDS.map((sport) => sportDailyKey(date, sport));
    expect(new Set(fixtures).size).toBe(DAILY_SPORT_IDS.length);
    expect(new Set(keys).size).toBe(DAILY_SPORT_IDS.length);
    expect(keys.every((key) => key.includes(date))).toBe(true);
    expect(keys.some((key) => key === date)).toBe(false);
  });

  it("keeps the same sport on the same date stable and can change on another date", () => {
    for (const sport of DAILY_SPORT_IDS) {
      expect(fixtureIdForSportDay(sport, date)).toBe(fixtureIdForSportDay(sport, date));
    }
    const changed = DAILY_SPORT_IDS.some(
      (sport) => fixtureIdForSportDay(sport, date) !== fixtureIdForSportDay(sport, "2026-10-05"),
    );
    expect(changed).toBe(true);
  });
});
