import { describe, expect, it } from "vitest";
import { withLocalWallet } from "./career-score";
import { defaultWallet } from "./cosmetics";
import { mergeWallet, profileFromRow, walletAhead } from "./wallet-sync";

const local = { ...defaultWallet(), totalScore: 77000, matchesSolved: 8, bestStreak: 4, streak: 2, grantedMatchIds: ["a", "b"] };

describe("wallet sync", () => {
  it("never lowers the wallet when the saved row is behind", () => {
    const merged = mergeWallet(local, { total_score: 0, matches_solved: 0, coins: 250, equipped_title: "ringside" });
    expect(merged.totalScore).toBe(77000);
    expect(merged.matchesSolved).toBe(8);
    expect(merged.bestStreak).toBe(4);
    expect(merged.coins).toBe(250);
    expect(merged.equippedTitle).toBe("ringside");
    expect(merged.grantedMatchIds).toEqual(["a", "b"]);
  });

  it("takes the saved totals once the row is ahead", () => {
    const merged = mergeWallet(local, { total_score: 87000, matches_solved: 9 });
    expect(merged.totalScore).toBe(87000);
    expect(merged.matchesSolved).toBe(9);
  });

  it("knows when the browser holds points the row lacks", () => {
    expect(walletAhead(local, { total_score: 0 })).toBe(true);
    expect(walletAhead(local, null)).toBe(true);
    expect(walletAhead(local, { total_score: 77000, matches_solved: 8 })).toBe(false);
    expect(walletAhead({ ...local, totalScore: 0, matchesSolved: 0 }, null)).toBe(false);
    expect(walletAhead(local, { career_score: 80000, matches_solved: 9 })).toBe(false);
  });

  it("reads the career column the row has", () => {
    expect(profileFromRow({ career_score: 1200 }).total_score).toBe(1200);
  });

  it("resolves the viewer's board row exactly like the profile card", () => {
    const row = { id: "u1", total_score: 0, matches_solved: 0 };
    expect(withLocalWallet(row, local)).toEqual({ id: "u1", total_score: 77000, matches_solved: 8 });
    expect(withLocalWallet({ ...row, total_score: 90000 }, local).total_score).toBe(90000);
  });
});
