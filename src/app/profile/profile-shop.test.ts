import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/profile",
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: false,
  supabaseClient: {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      signOut: async () => undefined,
    },
    from: () => ({
      select: () => ({
        eq: () => ({ order: async () => ({ data: [] }) }),
        in: async () => ({ data: [] }),
      }),
      upsert: async () => ({ error: null }),
    }),
  },
}));

vi.mock("@/lib/career-standings", () => ({
  fetchCareerStandings: async () => [],
}));

vi.mock("@/lib/supabase/network", () => ({
  followScout: async () => undefined,
  unfollowScout: async () => undefined,
  getFollowingIds: async () => [],
  searchScouts: async () => [],
}));

describe("career stats shop access", () => {
  it("links the header and the career score card to the shop", async () => {
    const { default: ProfilePage } = await import("./page");
    const html = renderToStaticMarkup(createElement(ProfilePage));
    expect(html).toContain('href="/shop"');
    expect(html).toContain(">Shop<");
    expect(html).toContain(">SPORTS<");
    expect(html).toContain("text-blue-600\">HISTORY");
    expect(html).toContain(">CLUE<");
    expect(html).toContain("👤 Profile");
    expect(html).toContain("🛍️ Spend Points in Shop");
    expect(html).toContain("shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]");
    expect(html).toContain("Scout Accolades (0)");
    expect(html).toContain("No badges unlocked yet. Spend career points in the shop!");
    expect(html.indexOf("Scout Accolades")).toBeLessThan(html.indexOf("Find Scouts"));
    expect(html).toContain("You haven&#x27;t followed any scouts yet.");
    expect(html).toContain("My Network");
    expect(html).toContain("LOCKED HANDLE");
    expect(html).toContain("Poäng");
    expect(html).toContain("Avklarade matcher");
    expect(html).toContain("Din klubb");
    expect(html).toContain(">AIK<");
    expect(html).toContain(">Djurgården<");
    expect(html).toContain(">AIK Fotboll<");
    expect(html).toContain(">Linköping HC<");
    expect(html).toContain('accept="image/*"');
    expect(html).toContain(">Change<");
    expect(html).not.toContain("Change handle");
  });
});
