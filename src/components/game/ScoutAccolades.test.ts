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
    expect(html).toContain("Scoututmärkelser (0)");
    expect(html).toContain("Inga utmärkelser upplåsta ännu. Handla med karriärpoäng i shopen!");
    expect(html).toContain('href="/shop"');
    expect(html).toContain("+ Hämta fler");
  });

  it("renders each unlocked badge and the handle flair", () => {
    const card = renderToStaticMarkup(createElement(ScoutAccolades, { badges: owned }));
    expect(card).toContain("Scoututmärkelser (2)");
    expect(card).toContain("NYBÖRJARNÅL");
    expect(card).toContain("Avklarade de första matcherna");
    expect(card).toContain("HALL OF FAME-SKÄRP");
    expect(card).toContain("Veteran i tabellen");
    expect(card).toContain("bg-amber-100 border-amber-300 text-amber-900");

    const flair = renderToStaticMarkup(createElement(BadgeHandleFlair, { badges: owned }));
    expect(flair).toContain("📌");
    expect(flair).toContain("🎖️");
  });
});