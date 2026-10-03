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
    expect(html).toContain("SHL-KLASSIKER &amp; RIVALER");
    expect(html).toContain("Avgörande ögonblick, nagelbitare och klassiska rivaliteter från den svenska hockeyscenen.");
    expect(html).toContain("2013 – 2015");
    expect(html).toContain("ALLSVENSKA DERBYN &amp; DRAMAT");
    expect(html).toContain("Känslor, läktarfest och oförglömliga guldstrider i Allsvenskan.");
    expect(html).toContain("2007 – 2018");
    expect(html).toContain("Mysteriet på isen #1");
    expect(html).toContain("2015 · Slutspelsdrama");
    expect(html).toContain("Mysteriet på isen #2");
    expect(html).toContain("2013 · Finalserie");
    expect(html).toContain("Mysteriet på gräset #1");
    expect(html).toContain("2018 · Derbyklassiker");
    expect(html).toContain("Mysteriet på gräset #2");
    expect(html).toContain("2007 · Guldstrid");
    expect(html).toContain("Klassisk ishockeymatch");
    expect(html).toContain("Historisk fotbollsmatch");
    expect(html).not.toContain("Slaget i sudden");
    expect(html).not.toContain("Guldkampen i norr");
    expect(html).not.toContain("Stockholm");
    expect(html).not.toContain("slutspelsrysare");
    expect(html).not.toContain("finalduell");
    expect(html).not.toContain("derbydrama");
    expect(html).not.toContain("Mästerskapsavgörande");
    expect(html).not.toContain("Klassisk ishockeyduell");
    expect(html).not.toContain("Historisk mästerskapsfinal");
    expect(html).not.toContain("Kalla kriget");
    expect(html).not.toContain("Olympiska mirakel");
    expect(html).not.toContain("Svenska Underverk");
    expect(html).not.toContain("Skellefteå");
    expect(html).not.toContain("Luleå");
    expect(html).not.toContain("Frölunda");
    expect(html).not.toContain("Växjö");
    expect(html).not.toContain("Hammarby");
    expect(html).not.toContain("Djurgården");
    expect(html).not.toContain("Trelleborg");
    expect(html).not.toContain("IFK");
    expect(html).not.toContain("Kiiskinen");
    expect(html).not.toContain("Wernbloom");
    expect(html).not.toContain("Ullevi");
    expect(html).not.toContain("Tele2");
    expect(html).not.toContain("USA mot Sovjetunionen");
    expect(html).not.toContain("Nadia");
    expect(html).not.toContain("Comăneci");
    expect(html).toContain('href="/play/slaget-i-sudden?campaign=shl-klassiker"');
    expect(html).toContain('href="/play/guldkampen-i-norr?campaign=shl-klassiker"');
    expect(html).toContain('href="/play/sondagsmorgonen-stockholms-stad?campaign=allsvenska-derbyn"');
    expect(html).toContain('href="/play/guldstriden-sista-omgangen?campaign=allsvenska-derbyn"');
    expect(html).not.toContain('href="/?match=');
    expect(html).not.toMatch(/w-\[\d+px\]/);
  });
});
