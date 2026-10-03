import { describe, expect, it, vi } from "vitest";
import { formatShopBalance, loadOwnedBadgeIds, loadShopBalance, purchaseBadge } from "./shop-catalog";

describe("shop catalog", () => {
  it("formats a career balance with a thousands separator", () => {
    expect(formatShopBalance(7500)).toBe("7,500 poäng");
    expect(formatShopBalance(null)).toBe("— poäng");
  });

  it("lists unlockable badges with point costs", async () => {
    const { BADGES } = await import("@/app/shop/page");
    expect(BADGES.map((item) => item.id)).toEqual([
      "rookie_pin",
      "archive_lantern",
      "gold_whistle",
      "hof_sash",
      "chief_intel",
    ]);
    expect(BADGES.map((item) => item.cost)).toEqual([10000, 35000, 75000, 150000, 300000]);
  });

  it("reads the signed-in scout career score", async () => {
    const maybeSingle = vi.fn(async () => ({ data: { career_score: 7500 }, error: null }));
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const getUser = vi.fn(async () => ({ data: { user: { id: "scout-1" } } }));

    const balance = await loadShopBalance({ auth: { getUser }, from } as never);

    expect(from).toHaveBeenCalledWith("profiles");
    expect(select).toHaveBeenCalledWith("career_score");
    expect(eq).toHaveBeenCalledWith("id", "scout-1");
    expect(balance).toBe(7500);
  });

  it("keeps the catalog available when the session lookup fails", async () => {
    const getUser = vi.fn(async () => {
      throw new Error("Supabase is not configured.");
    });
    await expect(loadShopBalance({ auth: { getUser }, from: vi.fn() } as never)).resolves.toBeNull();
  });

  it("reads the scout's unlocked badge ids", async () => {
    const eq = vi.fn(async () => ({
      data: [{ badge_id: "rookie_pin" }, { badge_id: "hof_sash" }],
      error: null,
    }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const getUser = vi.fn(async () => ({ data: { user: { id: "scout-1" } } }));

    const owned = await loadOwnedBadgeIds({ auth: { getUser }, from } as never);

    expect(from).toHaveBeenCalledWith("user_badges");
    expect(select).toHaveBeenCalledWith("badge_id");
    expect(eq).toHaveBeenCalledWith("user_id", "scout-1");
    expect([...owned]).toEqual(["rookie_pin", "hof_sash"]);
  });

  it("asks purchase_badge to spend the listed cost", async () => {
    const rpc = vi.fn(async () => ({ data: { success: true, new_score: 7000 }, error: null }));
    const result = await purchaseBadge("rookie_pin", 10000, { rpc } as never);
    expect(rpc).toHaveBeenCalledWith("purchase_badge", { p_badge_id: "rookie_pin", p_cost: 10000 });
    expect(result.data).toEqual({ success: true, new_score: 7000 });
  });
});
