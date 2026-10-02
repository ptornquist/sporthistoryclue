import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
  },
}));

describe("site navigation", () => {
  it("keeps the shop link in the header and the mobile drawer list", async () => {
    const { NAV_LINKS, default: Navbar } = await import("./Navbar");
    expect(NAV_LINKS).toEqual(
      expect.arrayContaining([{ name: "🛍️ SHOP", href: "/shop" }]),
    );

    const html = renderToStaticMarkup(createElement(Navbar));
    expect(html).toContain('href="/shop"');
    expect(html).toContain("🛍️ SHOP");
    expect(html).toContain("font-bold text-sm tracking-wide uppercase hover:text-blue-600 transition-colors");
    expect(html).toContain("hidden md:flex items-center gap-6");
    expect(html).toContain("☰");
    expect(html).not.toContain("🎯 Daily Drop");
  });

  it("opens a full-width mobile menu that closes from each link", async () => {
    const { MobileNavDrawer } = await import("./Navbar");
    const onNavigate = vi.fn();
    const html = renderToStaticMarkup(
      createElement(MobileNavDrawer, { onNavigate, onLogout: vi.fn() }),
    );
    expect(html).toContain(
      "bg-white border-b-2 border-zinc-200 shadow-xl py-4 px-6 flex flex-col gap-4 absolute top-full left-0 w-full z-50 animate-in slide-in-from-top-2",
    );
    expect(html).toContain("🎯 Daily Drop");
    expect(html).toContain('href="/"');
    expect(html).toContain("📖 Campaigns");
    expect(html).toContain('href="/campaigns"');
    expect(html).toContain("🏅 Disciplines");
    expect(html).toContain('href="/disciplines"');
    expect(html).toContain("🏆 Leaderboard");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("🛍️ Shop");
    expect(html).toContain("👤 Profile");
    expect(html).toContain('href="/profile"');
    expect(html).toContain("🚪 Log Out");
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
