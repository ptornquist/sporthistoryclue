import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("site navigation", () => {
  it("renders the shared header links and profile pill", async () => {
    const { default: Navbar } = await import("./Navbar");
    const html = renderToStaticMarkup(createElement(Navbar));
    expect(html).toContain("w-full bg-[#fcfbf9] border-b border-zinc-200 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50");
    expect(html).toContain("font-black text-xl tracking-tight text-zinc-950");
    expect(html).toContain("SPORTSHISTORYCLUE");
    expect(html).toContain(">BETA<");
    expect(html).toContain("hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-zinc-700");
    expect(html).toContain('href="/"');
    expect(html).toContain("Daily Drop");
    expect(html).toContain('href="/campaigns"');
    expect(html).toContain("Campaigns");
    expect(html).toContain('href="/archive"');
    expect(html).toContain("Archive");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("Standings");
    expect(html).toContain('href="/shop"');
    expect(html).toContain("Shop");
    expect(html).toContain('href="/profile"');
    expect(html).toContain("👤 Profile");
    expect(html).toContain("px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-zinc-900 text-xs font-black uppercase text-zinc-900 shadow-sm transition-all flex items-center gap-2");
  });
});
