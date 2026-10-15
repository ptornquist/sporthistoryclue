import { describe, expect, it } from "vitest";
import { priorSolveFrom, type PriorSolveSources } from "./prior-solve";

const base: PriorSolveSources = {
  id: "kluring-2026-10-15",
  dropDate: "2026-10-15",
  completions: [],
  grantedIds: [],
  localScore: null,
  granted: false,
};

describe("prior solve", () => {
  it("lets an unsolved kluring through", () => {
    expect(priorSolveFrom(base)).toBeNull();
  });

  it("locks today's drop once the saved completion says solved", () => {
    const completions = [{ dropDate: "2026-10-15", solved: true, score: 7500, challengeId: "kluring-2026-10-15" }];
    expect(priorSolveFrom({ ...base, completions })).toEqual({ score: 7500, source: "remote" });
  });

  it("ignores a lost attempt and other days", () => {
    const completions = [
      { dropDate: "2026-10-15", solved: false, score: 0, challengeId: "kluring-2026-10-15" },
      { dropDate: "2026-10-14", solved: true, score: 10000, challengeId: "other" },
    ];
    expect(priorSolveFrom({ ...base, completions })).toBeNull();
  });

  it("matches an archive match by id even without a drop date", () => {
    const completions = [{ dropDate: "2026-09-01", solved: true, score: 5500, challengeId: "kluring-2026-10-15" }];
    expect(priorSolveFrom({ ...base, dropDate: null, completions })).toEqual({ score: 5500, source: "remote" });
  });

  it("locks on a paid grant, the wallet, or this browser's saved score", () => {
    expect(priorSolveFrom({ ...base, granted: true, localScore: 8500 })).toEqual({ score: 8500, source: "grant" });
    expect(priorSolveFrom({ ...base, grantedIds: ["kluring-2026-10-15"] })).toEqual({ score: null, source: "wallet" });
    expect(priorSolveFrom({ ...base, localScore: 10000 })).toEqual({ score: 10000, source: "local" });
  });
});
