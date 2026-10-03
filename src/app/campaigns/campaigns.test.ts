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
    expect(html).not.toContain('href="/?match=');
    expect(html).not.toMatch(/w-\[\d+px\]/);
  });
});
