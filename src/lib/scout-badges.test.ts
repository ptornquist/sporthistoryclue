import { describe, expect, it } from "vitest";
import { resolveUnlockedBadges } from "./scout-badges";

describe("resolveUnlockedBadges", () => {
  it("matches owned badge ids to accolade emblems and skips unknown ids", () => {
    const badges = resolveUnlockedBadges([
      { badge_id: "chief_intel", unlocked_at: "2026-10-02T00:00:00Z" },
      { badge_id: "not_a_badge", unlocked_at: "2026-10-01T00:00:00Z" },
      { badge_id: "rookie_pin", unlocked_at: "2026-09-01T00:00:00Z" },
    ]);

    expect(badges.map((badge) => badge.id)).toEqual(["rookie_pin", "chief_intel"]);
    expect(badges[0]).toMatchObject({
      name: "NYBÖRJARNÅL",
      icon: "📌",
      desc: "Avklarade de första matcherna",
    });
    expect(badges[1]?.icon).toBe("👑");
  });
});
