import { describe, expect, it } from "vitest";
import {
  CAREER_SCORE_KEY,
  CAREER_SOLVED_KEY,
  FIXTURES_CLEARED_KEY,
  creditCareerSolve,
  mergeCareerTotals,
  readCareerLedger,
} from "./career-ledger";

function memoryStorage() {
  const bag = new Map<string, string>();
  return {
    bag,
    getItem: (key: string) => bag.get(key) ?? null,
    setItem: (key: string, value: string) => {
      bag.set(key, value);
    },
  };
}

describe("career ledger", () => {
  it("adds the score and one completed match, then ignores a replay", () => {
    const storage = memoryStorage();
    const first = creditCareerSolve("2026-10-03", 10000, storage);
    const second = creditCareerSolve("2026-10-03", 10000, storage);
    const archive = creditCareerSolve("slaget-i-sudden", 7000, storage);

    expect(first).toEqual({ careerScore: 10000, fixturesCleared: 1, credited: true });
    expect(second).toEqual({ careerScore: 10000, fixturesCleared: 1, credited: false });
    expect(archive).toEqual({ careerScore: 17000, fixturesCleared: 2, credited: true });
    expect(readCareerLedger(storage)).toEqual({ careerScore: 17000, fixturesCleared: 2 });
    expect(storage.bag.get(CAREER_SCORE_KEY)).toBe("17000");
    expect(storage.bag.get(FIXTURES_CLEARED_KEY)).toBe("2");
    expect(storage.bag.get(CAREER_SOLVED_KEY)).toContain("slaget-i-sudden");
  });

  it("keeps the higher total when the server and this browser disagree", () => {
    expect(
      mergeCareerTotals(
        { careerScore: 25000, fixturesCleared: 3 },
        { careerScore: 10000, fixturesCleared: 4 },
      ),
    ).toEqual({ careerScore: 25000, fixturesCleared: 4 });
  });
});
