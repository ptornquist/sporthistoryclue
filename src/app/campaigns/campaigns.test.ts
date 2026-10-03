import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/campaigns",
}));

describe("storylines layout", () => {
  it("hides the desktop links on small screens and keeps the page fluid", async () => {
    const { default: CampaignsPage } = await import("./page");
    const html = renderToStaticMarkup(createElement(CampaignsPage));

    expect(html).toContain("overflow-x-hidden w-full max-w-full");
    expect(html).toContain("font-black text-sm min-[420px]:text-base md:text-xl tracking-tight text-zinc-950 flex items-center gap-1");
    expect(html).toContain(">SPORTS<");
    expect(html).toContain("text-blue-600\">HISTORY");
    expect(html).toContain(">CLUE<");
    expect(html).toContain(">BETA<");
    expect(html).toContain("hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-zinc-700");
    expect(html).toContain("Dagens Drop");
    expect(html).toContain("Kampanjer");
    expect(html).toContain("Arkiv");
    expect(html).toContain("Tabell");
    expect(html).toContain("Shop");
    expect(html).toContain("👤 Profil");
    expect(html).not.toContain("overflow-x-auto no-scrollbar");
    expect(html).toContain("w-full max-w-3xl mx-auto px-4 py-6 overflow-x-hidden");
    expect(html).toContain("flex w-full max-w-full flex-col justify-between gap-2");
    expect(html).toContain("sm:flex-row sm:items-center");
    expect(html).toContain("DEDUCERA →");
    expect(html).toContain("Starta kampanj");
    expect(html).toContain('href="/play/miracle-on-ice-1980?campaign=cold-war-on-ice"');
    expect(html).toContain('href="/play/pele-sweden-1958?campaign=world-cup-epics"');
    expect(html).toContain("Svenska Underverk &amp; Dramatik");
    expect(html).toContain("Magiska landslagsögonblick och dramatiska triumfer som fyllde Sverige med idrottsglädje.");
    expect(html).toContain("1994 – 2006");
    expect(html).toContain("Sommarnatten i västern");
    expect(html).toContain("1994 · Världsmästerskapet");
    expect(html).toContain("Vintermorgonen i alperna");
    expect(html).toContain("2006 · Internationell mästerskapsfinal");
    expect(html).not.toContain("Bronshjältarna från Pasadena");
    expect(html).not.toContain("Guldfeber i Turin");
    expect(html).not.toContain("Pasadena");
    expect(html).not.toContain("Turin");
    expect(html).not.toContain("Bulgarien");
    expect(html).not.toContain("Solna");
    expect(html).not.toContain("Azteca");
    expect(html).not.toContain("Kinshasa");
    expect(html).not.toContain("Barcelona");
    expect(html).not.toContain("Wimbledon");
    expect(html).not.toContain("Summit Series");
    expect(html).not.toContain("Lake Placid");
    expect(html).not.toContain("100 meter");
    expect(html).not.toContain("1,00");
    expect(html).not.toContain("Sverige mot");
    expect(html).toContain('href="/play/pasadena-bronze-1994?campaign=svenska-underverk"');
    expect(html).toContain('href="/play/turin-gold-2006?campaign=svenska-underverk"');
    expect(html).not.toContain('href="/?match=');
    expect(html).not.toMatch(/w-\[\d+px\]/);
  });
});
