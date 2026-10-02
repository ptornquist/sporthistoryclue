import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveUnlockedBadges } from "@/lib/scout-badges";
import { BadgeHandleFlair, ScoutAccolades } from "./ScoutAccolades";

const owned = resolveUnlockedBadges([
  { badge_id: "rookie_pin", unlocked_at: "2026-09-01T00:00:00Z" },
  { badge_id: "hof_sash", unlocked_at: "2026-10-02T00:00:00Z" },
]);

describe("ScoutAccolades", () => {
  it("shows the empty shop prompt when the scout has no badges", () => {
    const html = renderToStaticMarkup(createElement(ScoutAccolades, { badges: [] }));
    expect(html).toContain("Scout Accolades (0)");
    expect(html).toContain("No badges unlocked yet. Spend career points in the shop!");
    expect(html).toContain('href="/shop"');
    expect(html).toContain("+ Get More");
  });

  it("renders each unlocked badge and the handle flair", () => {
    const card = renderToStaticMarkup(createElement(ScoutAccolades, { badges: owned }));
    expect(card).toContain("Scout Accolades (2)");
    expect(card).toContain("ROOKIE PIN");
    expect(card).toContain("Cleared opening fixtures");
    expect(card).toContain("HALL OF FAME SASH");
    expect(card).toContain("Standings veteran");
    expect(card).toContain("bg-amber-100 border-amber-300 text-amber-900");

    const flair = renderToStaticMarkup(createElement(BadgeHandleFlair, { badges: owned }));
    expect(flair).toContain("📌");
    expect(flair).toContain("🎖️");
  });
});