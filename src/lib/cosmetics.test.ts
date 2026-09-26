import { describe, expect, it } from "vitest";
import {
  applyEquip,
  applyPurchase,
  applySolveReward,
  badgeUnlocked,
  defaultWallet,
  scoutLevel,
  solveCoinReward,
} from "./cosmetics";

describe("scoutLevel", () => {
  it("starts scouts at level 1 with a bar toward 200", () => {
    expect(scoutLevel(0)).toEqual({ level: 1, progress: 0, nextScore: 200 });
    expect(scoutLevel(100).progress).toBeCloseTo(0.5);
  });

  it("uses the square-root curve from total score", () => {
    expect(Math.floor(Math.sqrt(800 / 200))).toBe(2);
    expect(scoutLevel(800).level).toBe(2);
    expect(scoutLevel(200).nextScore).toBe(800);
  });
});

describe("solveCoinReward", () => {
  it("pays the daily drop, streak, and duel bonuses", () => {
    expect(solveCoinReward({ isDaily: true, streakContinued: false, duelWon: false })).toBe(100);
    expect(solveCoinReward({ isDaily: false, streakContinued: true, duelWon: false })).toBe(50);
    expect(solveCoinReward({ isDaily: false, streakContinued: false, duelWon: true })).toBe(150);
    expect(solveCoinReward({ isDaily: true, streakContinued: true, duelWon: true })).toBe(300);
  });
});

describe("applyPurchase", () => {
  it("refuses a purchase when coins are short", () => {
    const result = applyPurchase(defaultWallet(), "hall-of-famer");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("coins");
    expect(result.wallet.coins).toBe(0);
  });

  it("deducts coins and equips the unlocked title", () => {
    const rich = { ...defaultWallet(), coins: 3000 };
    const result = applyPurchase(rich, "hall-of-famer");
    expect(result.ok).toBe(true);
    expect(result.wallet.coins).toBe(500);
    expect(result.wallet.unlockedTitles).toContain("hall-of-famer");
    expect(result.wallet.equippedTitle).toBe("hall-of-famer");
  });

  it("does not charge twice for an owned item", () => {
    const once = applyPurchase({ ...defaultWallet(), coins: 3000 }, "ice-analyst");
    const twice = applyPurchase(once.wallet, "ice-analyst");
    expect(twice.wallet.coins).toBe(once.wallet.coins);
  });

  it("unlocks the club key grants", () => {
    const result = applyPurchase({ ...defaultWallet(), coins: 5000 }, "club-key");
    expect(result.wallet.unlockedTitles).toContain("hall-of-famer");
    expect(result.wallet.unlockedFrames).toContain("golden-glow");
    expect(result.wallet.equippedTitle).toBe("hall-of-famer");
    expect(result.wallet.equippedFrame).toBe("golden-glow");
  });
});

describe("applyEquip", () => {
  it("equips an unlocked frame and ignores a locked one", () => {
    const owned = {
      ...defaultWallet(),
      unlockedFrames: ["standard", "arena-lights"],
    };
    expect(applyEquip(owned, "arena-lights").equippedFrame).toBe("arena-lights");
    expect(applyEquip(defaultWallet(), "golden-glow").equippedFrame).toBe("standard");
  });
});

describe("applySolveReward", () => {
  it("grants coins once per match id", () => {
    const first = applySolveReward(defaultWallet(), {
      matchId: "daily-1",
      pointScore: 8500,
      isDaily: true,
      streakContinued: true,
      duelWon: false,
      newStreak: 2,
    });
    expect(first.earned).toBe(150);
    expect(first.wallet.coins).toBe(150);
    expect(first.wallet.matchesSolved).toBe(1);
    expect(first.wallet.totalScore).toBe(8500);
    expect(first.wallet.bestStreak).toBe(2);

    const second = applySolveReward(first.wallet, {
      matchId: "daily-1",
      pointScore: 8500,
      isDaily: true,
      streakContinued: true,
      duelWon: true,
      newStreak: 3,
    });
    expect(second.earned).toBe(0);
    expect(second.wallet.coins).toBe(150);
    expect(second.wallet.matchesSolved).toBe(1);
    expect(second.wallet.bestStreak).toBe(3);
  });
});

describe("badgeUnlocked", () => {
  it("opens featured badges from career milestones", () => {
    const wallet = { ...defaultWallet(), matchesSolved: 1, bestStreak: 7 };
    expect(badgeUnlocked("first-blood", wallet, [])).toBe(true);
    expect(badgeUnlocked("week-1-streak", wallet, [])).toBe(true);
    expect(badgeUnlocked("cold-war-veteran", wallet, ["summit-series-1972"])).toBe(true);
    expect(badgeUnlocked("cold-war-veteran", defaultWallet(), [])).toBe(false);
  });
});
