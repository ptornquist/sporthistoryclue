import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: false,
  supabaseClient: {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
  },
}));

describe("site navigation", () => {
  it("uses one header with the desktop links and a closed hamburger", async () => {
    const { NAV_LINKS, default: Navbar } = await import("./Navbar");
    expect(NAV_LINKS).toEqual([
      { name: "🎯 Arena", href: "/" },
      { name: "📖 Campaigns", href: "/campaigns" },
      { name: "🏅 Archive", href: "/archive" },
      { name: "🏆 Standings", href: "/standings" },
      { name: "🛍 Shop", href: "/shop" },
      { name: "👤 Profile", href: "/profile" },
    ]);

    const html = renderToStaticMarkup(createElement(Navbar));
    expect(html).toContain("SPORTSHISTORYCLUE");
    expect(html).toContain("font-black text-lg md:text-xl tracking-tight text-zinc-950 shrink-0");
    expect(html).toContain("hidden md:flex items-center gap-6 text-sm font-black uppercase");
    expect(html).toContain("md:hidden flex items-center gap-3");
    expect(html).toContain('href="/"');
    expect(html).toContain("🎯 Arena");
    expect(html).toContain('href="/campaigns"');
    expect(html).toContain("📖 Campaigns");
    expect(html).toContain('href="/archive"');
    expect(html).toContain("🏅 Archive");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("🏆 Standings");
    expect(html).toContain('href="/shop"');
    expect(html).toContain("🛍 Shop");
    expect(html).toContain('href="/profile"');
    expect(html).toContain("👤 Profile");
    expect(html).toContain("☰");
    expect(html).not.toContain("✕");
  });

  it("opens a full-width mobile menu that closes from each link", async () => {
    const { MobileNavDrawer } = await import("./Navbar");
    const onNavigate = vi.fn();
    const html = renderToStaticMarkup(createElement(MobileNavDrawer, { onNavigate }));
    expect(html).toContain(
      "absolute top-full left-0 w-full bg-white border-b-2 border-zinc-200 shadow-2xl py-5 px-6 flex flex-col gap-4 z-50 md:hidden",
    );
    expect(html).toContain("font-black uppercase text-sm text-zinc-900 py-1");
    expect(html).toContain("🎯 Arena");
    expect(html).toContain('href="/"');
    expect(html).toContain("📖 Campaigns");
    expect(html).toContain('href="/campaigns"');
    expect(html).toContain("🏅 Archive");
    expect(html).toContain('href="/archive"');
    expect(html).toContain("🏆 Standings");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("🛍 Shop");
    expect(html).toContain('href="/shop"');
    expect(html).toContain("👤 Profile");
    expect(html).toContain('href="/profile"');
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
