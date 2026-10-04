import { describe, expect, it } from "vitest";
import { SVERIGE_SOVJET_1984_CARDS } from "./case-clues";
import { publishDailyClues } from "./daily-clue-copy";
import { dayIndexFromKey, kluringForDay, SPORT_KLURING_POOL } from "./sport-kluringar-pool";

describe("sport kluring pool", () => {
  it("selects Scandinavium 1984 for kluring 20730", () => {
    expect(dayIndexFromKey("2026-10-04")).toBe(20730);
    expect(kluringForDay("2026-10-04").id).toBe("sverige-sovjet-1984");
    expect(kluringForDay("2026-10-04", "ice_hockey").id).toBe("sverige-sovjet-1984");
    expect(publishDailyClues(kluringForDay("2026-10-04").id, [], "ice_hockey")).toEqual([
      ...SVERIGE_SOVJET_1984_CARDS,
    ]);
    expect(publishDailyClues(kluringForDay("2026-10-04").id, [], "ice_hockey").join(" ")).not.toMatch(/andetagen/);
  });

  it("moves to the next authored row on the next day", () => {
    expect(kluringForDay("2026-10-05").id).not.toBe(kluringForDay("2026-10-04").id);
    expect(new Set(SPORT_KLURING_POOL.map((item) => item.id)).size).toBe(SPORT_KLURING_POOL.length);
  });
});
