import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Navbar, { MOBILE_NAV_LINKS, MobileNavDrawer } from "./Navbar";

const HELP =
  "w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-xs font-bold shrink-0";
const BURGER =
  "md:hidden w-9 h-9 rounded-xl border-2 border-zinc-900 bg-white flex items-center justify-center text-zinc-900 font-black text-lg shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-y-[1px] shrink-0";
const ITEM =
  "border-2 border-zinc-200 hover:border-zinc-900 rounded-xl px-4 py-3 font-bold text-zinc-900 flex items-center justify-between transition-all";
const DRAWER =
  "fixed inset-x-0 top-[60px] bg-white border-b-4 border-zinc-900 shadow-2xl z-50 p-5 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150";

describe("Navbar mobile menu", () => {
  it("keeps help, a compact header, and the hamburger on phones", () => {
    const html = renderToStaticMarkup(createElement(Navbar));
    expect(html).toContain("hidden md:flex");
    expect(html).toContain(HELP);
    expect(html).toContain(BURGER);
    expect(html).toContain('aria-label="Toggle Navigation Menu"');
    expect(html).toContain("☰");
    expect(html).not.toContain(DRAWER);
  });

  it("opens a stadium drawer whose links close on tap", () => {
    const html = renderToStaticMarkup(
      createElement(MobileNavDrawer, { open: true, onNavigate: () => undefined }),
    );
    expect(html).toContain(DRAWER);
    expect(html).toContain(ITEM);
    for (const link of MOBILE_NAV_LINKS) {
      expect(html).toContain(`${link.icon} ${link.name.replaceAll("&", "&amp;")}`);
      expect(html).toContain(`href="${link.href}"`);
    }
    expect(
      renderToStaticMarkup(createElement(MobileNavDrawer, { open: false, onNavigate: () => undefined })),
    ).toBe("");
  });
});
