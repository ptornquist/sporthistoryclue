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
    expect(html).toContain("← Back to Standings");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("@ada");
    expect(html).toContain("CAREER SCORE");
    expect(html).toContain("14,000 PTS");
    expect(html).toContain("FIXTURES CLEARED");
    expect(html).toContain(">6<");
    expect(html).toContain("⚔️ Challenge Scout");
    expect(html).toContain("Follow / Network");
    expect(html).toContain("This scout has not unlocked any honours yet.");
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
    expect(html).toContain("📌 ROOKIE PIN");
    expect(html).toContain("🏮 ARCHIVE LANTERN");
    expect(html).not.toContain("⚔️ Challenge Scout");
  });

  it("explains a missing scout", () => {
    const html = renderToStaticMarkup(
      createElement(ScoutPublicCard, { username: "missing", missing: true }),
    );
    expect(html).toContain("No scout found matching &#x27;@missing&#x27;.");
    expect(html).toContain('href="/standings"');
  });
});
