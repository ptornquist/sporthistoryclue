import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Navbar, { MOBILE_NAV_LINKS, MobileNavDrawer } from "./Navbar";

const DRAWER =
  "fixed inset-x-0 top-16 bg-white border-b-2 border-zinc-900 shadow-xl z-50 p-6 flex flex-col gap-3 md:hidden";
const LINK =
  "text-base font-bold text-zinc-800 hover:text-blue-600 py-2 border-b border-zinc-100 flex items-center justify-between";

describe("Navbar mobile drawer", () => {
  it("keeps the desktop links off the phone header and offers a hamburger", () => {
    const html = renderToStaticMarkup(createElement(Navbar));
    expect(html).toContain("hidden md:flex items-center gap-4");
    expect(html).toContain("flex shrink-0 items-center gap-2");
    expect(html).toContain("How to Play");
    expect(html).toContain("☰");
    expect(html).toContain('aria-label="Open menu"');
    expect(html).toContain("tracking-tighter");
    expect(html).not.toContain(DRAWER);
    expect(html).not.toContain("Daily Drop Archive");
  });

  it("lists the stadium routes and closes when a link is chosen", () => {
    const html = renderToStaticMarkup(
      createElement(MobileNavDrawer, { open: true, onNavigate: () => undefined }),
    );
    expect(html).toContain(DRAWER);
    expect(html).toContain(LINK);
    for (const link of MOBILE_NAV_LINKS) {
      expect(html).toContain(`${link.icon} ${link.name.replaceAll("&", "&amp;")}`);
      expect(html).toContain(`href="${link.href}"`);
    }
    expect(html).toContain('href="/campaigns"');
    expect(renderToStaticMarkup(createElement(MobileNavDrawer, { open: false, onNavigate: () => undefined }))).toBe(
      "",
    );
  });
});
