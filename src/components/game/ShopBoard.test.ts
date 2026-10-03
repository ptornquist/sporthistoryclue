import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BADGES } from "@/app/shop/page";
import { ShopBoard } from "./ShopBoard";

describe("ShopBoard", () => {
  it("shows emblem cards with unlock, owned, and needs states", () => {
    const html = renderToStaticMarkup(
      createElement(ShopBoard, {
        balance: 40000,
        badges: BADGES,
        ownedIds: new Set(["rookie_pin"]),
        onPurchase: vi.fn(),
      }),
    );

    expect(html).toContain("40,000 poäng");
    expect(html).toContain("📌");
    expect(html).toContain("NYBÖRJARNÅL");
    expect(html).toContain("ARKIVLYKTA");
    expect(html).toContain("GULDPIPA");
    expect(html).toContain("HALL OF FAME-SKÄRP");
    expect(html).toContain("UNDERRÄTTELSEVAPNET");
    expect(html).toContain("✓ ÄGD");
    expect(html).toContain("LÅS UPP FÖR 35,000 poäng");
    expect(html).toContain("KRÄVER 75,000 poäng");
    expect(html).toContain("KRÄVER 150,000 poäng");
    expect(html).toContain("KRÄVER 300,000 poäng");
    expect(html).not.toContain("LÅS UPP FÖR 10,000 poäng");
  });
});
