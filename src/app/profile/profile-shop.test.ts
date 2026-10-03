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
    expect(html).toContain("🛍️ Shop");
    expect(html).toContain(">SPORTS<");
    expect(html).toContain("text-blue-600\">HISTORY");
    expect(html).toContain(">CLUE<");
    expect(html).toContain("👤 Profil");
    expect(html).toContain("🛍️ Handla i Shopen");
    expect(html).toContain("shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]");
    expect(html).toContain("Scoututmärkelser (0)");
    expect(html).toContain("Inga utmärkelser upplåsta ännu. Handla med karriärpoäng i shopen!");
    expect(html.indexOf("Scoututmärkelser")).toBeLessThan(html.indexOf("Sök scouter"));
    expect(html).toContain("Du har inte följt några scouter ännu.");
    expect(html).toContain("Mitt Nätverk");
    expect(html).toContain("LÅST NAMN");
    expect(html).toContain("Karriärpoäng");
    expect(html).toContain("Avklarade matcher");
    expect(html).toContain("Ishockeyklubb (SHL)");
    expect(html).toContain("Fotbollsklubb (Allsvenskan)");
    expect(html).toContain(">Rögle<");
    expect(html).toContain(">Skellefteå AIK<");
    expect(html).toContain(">Växjö Lakers<");
    expect(html).toContain(">AIK<");
    expect(html).toContain(">BK Häcken<");
    expect(html).toContain(">Halmstad<");
    expect(html).toContain('aria-label="Ishockeyklubb (SHL)"');
    expect(html).toContain('aria-label="Fotbollsklubb (Allsvenskan)"');
    expect(html).toContain('accept="image/*"');
    expect(html).toContain(">Byt<");
    expect(html).not.toContain("Change handle");
  });
});
