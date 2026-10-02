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
  });
});
