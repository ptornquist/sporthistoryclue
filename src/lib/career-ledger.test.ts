import { describe, expect, it } from "vitest";
import {
  CAREER_SCORE_KEY,
  CAREER_SOLVED_KEY,
  FIXTURES_CLEARED_KEY,
  creditCareerSolve,
  mergeCareerTotals,
  readCareerLedger,
  readCareerSolves,
  reconcileCareerTotals,
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
    expect(readCareerSolves(storage)).toEqual([
      { id: "2026-10-03", score: 10000 },
      { id: "slaget-i-sudden", score: 7000 },
    ]);
  });

  it("keeps the higher total when the server and this browser disagree", () => {
    expect(
      mergeCareerTotals(
        { careerScore: 25000, fixturesCleared: 3 },
        { careerScore: 10000, fixturesCleared: 4 },
      ),
    ).toEqual({ careerScore: 25000, fixturesCleared: 4 });
  });

  it("adds a solve the server has not recorded yet", () => {
    expect(
      reconcileCareerTotals(
        { careerScore: 50000, fixturesCleared: 8 },
        { careerScore: 10000, fixturesCleared: 1 },
        [{ id: "2026-10-03", score: 10000 }],
        ["older-fixture"],
      ),
    ).toEqual({ careerScore: 60000, fixturesCleared: 9 });
  });

  it("does not add a solve the server already stored", () => {
    expect(
      reconcileCareerTotals(
        { careerScore: 60000, fixturesCleared: 9 },
        { careerScore: 10000, fixturesCleared: 1 },
        [{ id: "2026-10-03", score: 10000 }],
        ["2026-10-03"],
      ),
    ).toEqual({ careerScore: 60000, fixturesCleared: 9 });
  });

  it("keeps a legacy local total when individual scores were not stored", () => {
    expect(
      reconcileCareerTotals(
        { careerScore: 0, fixturesCleared: 0 },
        { careerScore: 17000, fixturesCleared: 2 },
        [
          { id: "2026-10-03", score: 0 },
          { id: "slaget-i-sudden", score: 0 },
        ],
        [],
      ),
    ).toEqual({ careerScore: 17000, fixturesCleared: 2 });
  });
});
