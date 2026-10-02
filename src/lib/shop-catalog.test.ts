import { describe, expect, it, vi } from "vitest";
import { formatShopBalance, loadShopBalance, SHOP_ITEMS } from "./shop-catalog";

describe("shop catalog", () => {
  it("formats a career balance with a thousands separator", () => {
    expect(formatShopBalance(7500)).toBe("7,500 PTS");
    expect(formatShopBalance(null)).toBe("— PTS");
  });

  it("lists unlockable badges with point costs", () => {
    expect(SHOP_ITEMS.map((item) => item.name)).toEqual([
      "Rookie Pin",
      "Archive Lantern",
      "Gold Whistle",
      "Hall of Fame Sash",
      "Chief of Intel Crest",
    ]);
    expect(SHOP_ITEMS.every((item) => item.cost > 0)).toBe(true);
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
});
