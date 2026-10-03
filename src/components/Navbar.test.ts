import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

describe("site navigation", () => {
  it("renders the shared header links and profile pill", async () => {
    const { default: Navbar, MobileNavDropdown } = await import("./Navbar");
    const html = renderToStaticMarkup(createElement(Navbar));
    expect(html).toContain("w-full bg-[#fcfbf9] border-b border-zinc-200 py-4 px-3 min-[360px]:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50");
    expect(html).toContain("font-black text-sm min-[420px]:text-base md:text-xl tracking-tight text-zinc-950 flex items-center gap-1");
    expect(html).toContain(">SPORTS<");
    expect(html).toContain("text-blue-600\">HISTORY");
    expect(html).toContain(">CLUE<");
    expect(html).toContain(">BETA<");
    expect(html).toContain("hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-zinc-700");
    expect(html).toContain('href="/"');
    expect(html).toContain("Dagens Drop");
    expect(html).toContain('href="/campaigns"');
    expect(html).toContain("Utmaningar");
    expect(html).toContain('href="/archive"');
    expect(html).toContain("Historik");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("Tabell");
    expect(html).toContain('href="/shop"');
    expect(html).toContain("Shop");
    expect(html).toContain('href="/profile"');
    expect(html).toContain("Hur spelar man");
    expect(html).toContain('aria-label="Hur spelar man"');
    expect(html).toContain("👤 Profil");
    expect(html).toContain("hidden md:flex px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-zinc-900 text-xs font-black uppercase text-zinc-900 shadow-sm transition-all items-center gap-2");
    expect(html).toContain("flex items-center gap-2 md:hidden");
    expect(html).toContain('aria-label="Profil"');
    expect(html).toContain("w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm text-base font-black");
    expect(html).toContain('aria-label="Öppna meny"');
    expect(html).toContain("☰");

    const menu = renderToStaticMarkup(createElement(MobileNavDropdown, { onNavigate: vi.fn() }));
    expect(menu).toContain("absolute top-full left-0 w-full bg-white border-b border-zinc-200 shadow-2xl py-5 px-6 flex flex-col gap-1 z-50 md:hidden");
    expect(menu).toContain("Dagens Drop");
    expect(menu).toContain("Utmaningar");
    expect(menu).toContain("Historik");
    expect(menu).toContain("Tabell");
    expect(menu).toContain("Shop");
  });
});
