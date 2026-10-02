import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ShopBoard } from "./ShopBoard";

describe("ShopBoard", () => {
  it("shows the career balance and every unlockable badge", () => {
    const html = renderToStaticMarkup(createElement(ShopBoard, { balance: 7500 }));
    expect(html).toContain("7,500 PTS");
    expect(html).toContain("Rookie Pin");
    expect(html).toContain("Archive Lantern");
    expect(html).toContain("Gold Whistle");
    expect(html).toContain("Hall of Fame Sash");
    expect(html).toContain("Chief of Intel Crest");
    expect(html).toContain("Unlockable badges");
    expect(html).toContain("In reach");
  });
});
