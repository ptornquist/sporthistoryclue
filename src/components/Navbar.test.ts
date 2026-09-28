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
  "fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white border-l-[3px] border-zinc-950 p-6 z-50 shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-y-auto";
const BACKDROP = "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity";

describe("Navbar mobile menu", () => {
  it("keeps help, a compact header, and the hamburger on phones", () => {
    const html = renderToStaticMarkup(createElement(Navbar));
    expect(html).toContain("hidden md:flex");
    expect(html).toContain(HELP);
    expect(html).toContain(BURGER);
    expect(html).toContain('aria-label="Toggle Navigation Menu"');
    expect(html).toContain("☰");
    expect(html).toContain('aria-label="Scout Dossier"');
    expect(html).toContain("🏆");
    expect(html).not.toContain("SCOUT DOSSIER");
    expect(html).not.toContain(DRAWER);
  });

  it("opens a slide-over drawer on every screen width", () => {
    const html = renderToStaticMarkup(
      createElement(MobileNavDrawer, { open: true, onNavigate: () => undefined }),
    );
    expect(html).toContain(DRAWER);
    expect(html).toContain(BACKDROP);
    expect(html).not.toContain("md:hidden");
    expect(html).toContain(ITEM);
    expect(html).toContain("📅 Daily Drop Archive");
    expect(html).toContain('href="/archive"');
    expect(html).toContain("🏆 Premier League Derby");
    expect(html).toContain('href="/derby"');
    expect(html).toContain("📜 Storylines &amp; Eras");
    expect(html).toContain('href="/storylines"');
    expect(html).toContain(">X<");
    for (const link of MOBILE_NAV_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
    }
    expect(
      renderToStaticMarkup(createElement(MobileNavDrawer, { open: false, onNavigate: () => undefined })),
    ).toBe("");
    expect(html).not.toContain("Scout Dossier / Stats");
    expect(html).not.toContain("How to Play / Rules");
  });

  it("adds the scout dossier and rules controls when the drawer can open them", () => {
    const html = renderToStaticMarkup(
      createElement(MobileNavDrawer, {
        open: true,
        onNavigate: () => undefined,
        onOpenDossier: () => undefined,
        onOpenHelp: () => undefined,
      }),
    );
    expect(html).toContain("📊 Scout Dossier / Stats");
    expect(html).toContain("❓ How to Play / Rules");
    expect(html).toContain('href="/disciplines"');
  });
});
