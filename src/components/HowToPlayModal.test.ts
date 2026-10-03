import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FirstVisitBriefing, HowToPlayModal, hasSeenTutorial } from "./HowToPlayModal";

describe("HowToPlayModal", () => {
  it("renders the Swedish scout briefing", () => {
    const html = renderToStaticMarkup(createElement(HowToPlayModal, { open: true, onClose: () => undefined }));
    expect(html).toContain("fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4");
    expect(html).toContain("bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 max-w-lg shadow-2xl z-50 text-zinc-900");
    expect(html).toContain("Scoutbriefing");
    expect(html).toContain("Så spelar du");
    expect(html).toContain("Deducera matchen kort för kort");
    expect(html).toContain("Varje extra ledtråd kostar 1 500 poäng");
    expect(html).toContain("−1 500 poäng");
    expect(html).toContain("Lös matchen och klättra");
    expect(html).toContain("utmana vänner");
    expect(html).toContain("Gå in i arenan →");
    expect(html).toContain("w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm tracking-wider uppercase shadow-md transition-all");
    expect(html).toContain("bg-zinc-50");
    expect(html).toContain("✕");
  });

  it("stays closed until the first visit timer or the help button opens it", () => {
    const closed = renderToStaticMarkup(createElement(HowToPlayModal, { open: false, onClose: () => undefined }));
    const briefing = renderToStaticMarkup(createElement(FirstVisitBriefing));
    expect(closed).toBe("");
    expect(briefing).toBe("");
    expect(hasSeenTutorial(null)).toBe(false);
    expect(hasSeenTutorial("true")).toBe(true);
  });
});
