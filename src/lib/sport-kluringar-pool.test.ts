import { describe, expect, it } from "vitest";
import { dayIndexFromKey, kluringForDay, SPORT_KLURING_POOL } from "./sport-kluringar-pool";

const ENGLISH = /\b(the|and|with|winner|game|jab|volley|knockout|tiebreak|centre)\b/i;
const EARLY_YEAR = /\b(19|20)\d{2}\b/;

describe("sport kluring pool", () => {
  it("balances seven sports and keeps five clues on every row", () => {
    expect(SPORT_KLURING_POOL).toHaveLength(30);
    expect(20730 % SPORT_KLURING_POOL.length).toBe(0);
    expect(new Set(SPORT_KLURING_POOL.map((item) => item.id)).size).toBe(30);
    expect(new Set(SPORT_KLURING_POOL.map((item) => item.sport))).toEqual(
      new Set(["ice_hockey", "football", "boxing", "tennis", "athletics", "equestrian", "handball"]),
    );

    const counts = Object.fromEntries(
      ["ice_hockey", "football", "boxing", "tennis", "athletics", "equestrian", "handball"].map((sport) => [
        sport,
        SPORT_KLURING_POOL.filter((item) => item.sport === sport).length,
      ]),
    );
    expect(counts).toEqual({
      ice_hockey: 6,
      football: 5,
      boxing: 5,
      tennis: 5,
      athletics: 3,
      equestrian: 3,
      handball: 3,
    });

    for (const row of SPORT_KLURING_POOL) {
      expect(row.clues).toHaveLength(5);
      expect(new Set(row.clues).size).toBe(5);
      expect(row.clues.slice(0, 4).join(" ")).not.toMatch(EARLY_YEAR);
      expect(row.clues.join(" ")).not.toMatch(ENGLISH);
      expect(row.clues[4]).toMatch(/\b(19|20)\d{2}\b/);
    }
  });

  it("pins 2026-10-04 to the first row in each sport that divides the day index", () => {
    expect(dayIndexFromKey("2026-10-04")).toBe(20730);
    expect(kluringForDay("2026-10-04").id).toBe("sverige-sovjet-1984");
    expect(kluringForDay("2026-10-04", "ice_hockey").id).toBe("sverige-sovjet-1984");
    expect(kluringForDay("2026-10-04", "football").id).toBe("pele-1958");
    expect(kluringForDay("2026-10-04", "boxing").id).toBe("ali-1974");
    expect(kluringForDay("2026-10-04", "tennis").id).toBe("wimbledon-epic-1980");
    expect(kluringForDay("2026-10-04", "athletics").id).toBe("duplantis-2026");
    expect(kluringForDay("2026-10-04", "equestrian").id).toBe("saint-cyr-1956");
    expect(kluringForDay("2026-10-04", "handball").id).toBe("handboll-vm-1999");
    expect(kluringForDay("2026-10-04").clues[0]).not.toMatch(/Scandinavium/);
    expect(kluringForDay("2026-10-04").clues[4]).toMatch(/Calgary/);
  });
});
