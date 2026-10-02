import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BADGES } from "@/app/shop/page";
import { ShopBoard } from "./ShopBoard";

describe("ShopBoard", () => {
  it("shows emblem cards with unlock, owned, and needs states", () => {
    const html = renderToStaticMarkup(
      createElement(ShopBoard, {
        balance: 7500,
        badges: BADGES,
        ownedIds: new Set(["rookie_pin"]),
        onPurchase: vi.fn(),
      }),
    );

    expect(html).toContain("7,500 PTS");
    expect(html).toContain("📌");
    expect(html).toContain("ROOKIE PIN");
    expect(html).toContain("ARCHIVE LANTERN");
    expect(html).toContain("GOLD WHISTLE");
    expect(html).toContain("HALL OF FAME SASH");
    expect(html).toContain("CHIEF OF INTEL CREST");
    expect(html).toContain("✓ OWNED");
    expect(html).toContain("UNLOCK FOR 1,500 PTS");
    expect(html).toContain("UNLOCK FOR 7,500 PTS");
    expect(html).toContain("NEEDS 12,000 PTS");
    expect(html).not.toContain("UNLOCK FOR 500 PTS");
  });
});
