import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveUnlockedBadges } from "@/lib/scout-badges";
import { ScoutProfileActions } from "./ScoutProfileActions";
import { ScoutPublicCard } from "./ScoutPublicCard";

describe("ScoutPublicCard", () => {
  it("shows career points, fixtures, and empty honours", () => {
    const html = renderToStaticMarkup(
      createElement(ScoutPublicCard, {
        username: "@ada",
        careerScore: 14000,
        fixturesCleared: 6,
        badges: [],
        actions: createElement(ScoutProfileActions, {
          profileId: "p1",
          username: "ada",
          viewerId: "viewer",
          viewerScore: 100,
          initiallyFollowing: false,
        }),
      }),
    );
    expect(html).toContain("← Tillbaka till tabellen");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("@ada");
    expect(html).toContain("Karriärpoäng");
    expect(html).toContain("14,000 poäng");
    expect(html).toContain("Avklarade matcher");
    expect(html).toContain(">6<");
    expect(html).toContain("⚔️ Utmana scout");
    expect(html).toContain("Följ i nätverket");
    expect(html).toContain("Den här scouten har inga medaljer ännu.");
  });

  it("lists unlocked badge icons and names", () => {
    const html = renderToStaticMarkup(
      createElement(ScoutPublicCard, {
        username: "beau",
        careerScore: 500,
        fixturesCleared: 1,
        badges: resolveUnlockedBadges([
          { badge_id: "rookie_pin" },
          { badge_id: "archive_lantern" },
        ]),
      }),
    );
    expect(html).toContain("🥉 BRONSMEDALJ");
    expect(html).toContain("🥈 SILVERMEDALJ");
    expect(html).not.toContain("⚔️ Utmana scout");
  });

  it("explains a missing scout", () => {
    const html = renderToStaticMarkup(
      createElement(ScoutPublicCard, { username: "missing", missing: true }),
    );
    expect(html).toContain("Ingen scout matchar &#x27;@missing&#x27;.");
    expect(html).toContain('href="/standings"');
  });
});
