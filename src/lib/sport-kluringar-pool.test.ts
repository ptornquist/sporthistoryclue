import { describe, expect, it } from "vitest";
import { englishSurface } from "./i18n/english-surface";
import { dayIndexFromKey, kluringForDay, kluringGuessIsCorrect, SPORT_KLURING_POOL } from "./sport-kluringar-pool";

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
      const swedish = row.cards.map((card) => card.text.sv);
      expect(row.cards).toHaveLength(5);
      expect(row.cards.map((card) => card.step)).toEqual([1, 2, 3, 4, 5]);
      expect(new Set(swedish).size).toBe(5);
      expect(swedish.slice(0, 4).join(" ")).not.toMatch(EARLY_YEAR);
      expect(swedish.join(" ")).not.toMatch(ENGLISH);
      expect(swedish[4]).toMatch(/\b(19|20)\d{2}\b/);
      expect(row.cards.every((card, index) => card.text.en.length > 0 && card.title.sv.length > 0 && card.title.en.length > 0 && card.step === index + 1)).toBe(true);
      expect(row.options.sv).toHaveLength(4);
      expect(row.options.en).toHaveLength(4);
      expect(row.options.en).toEqual(row.options.sv.map((option) => englishSurface(option)));
      expect(new Set(row.options.sv.map((option) => option.toLowerCase())).size).toBe(4);
      expect(new Set(row.options.en.map((option) => option.toLowerCase())).size).toBe(4);
      expect(row.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(row.correctAnswerIndex).toBeLessThan(4);
      expect(row.title.sv.length).toBeGreaterThan(0);
      expect(row.title.en.length).toBeGreaterThan(0);
      expect(row.category.sv.length).toBeGreaterThan(0);
      expect(row.category.en.length).toBeGreaterThan(0);
      expect(kluringGuessIsCorrect(row.id, row.options.sv[row.correctAnswerIndex])).toBe(true);
      expect(kluringGuessIsCorrect(row.id, row.options.en[row.correctAnswerIndex])).toBe(true);
      const decoy = row.options.sv[(row.correctAnswerIndex + 1) % 4];
      expect(kluringGuessIsCorrect(row.id, decoy)).toBe(false);
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
    expect(kluringForDay("2026-10-04").cards[0].text.sv).not.toMatch(/Scandinavium/);
    expect(kluringForDay("2026-10-04").cards[4].text.sv).toMatch(/Calgary/);
    expect(kluringForDay("2026-10-04").options.sv[kluringForDay("2026-10-04").correctAnswerIndex]).toBe(
      "1984 Kanada Cup: Sverige mot Sovjetunionen",
    );
  });
});
