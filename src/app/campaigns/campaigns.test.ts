import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("storylines layout", () => {
  it("hides the desktop links on small screens and keeps the page fluid", async () => {
    const { default: CampaignsPage } = await import("./page");
    const html = renderToStaticMarkup(createElement(CampaignsPage));

    expect(html).toContain("overflow-x-hidden w-full max-w-full");
    expect(html).toContain("shrink-0 text-lg font-black uppercase tracking-tighter md:text-xl");
    expect(html).toContain("hidden md:flex items-center gap-4");
    expect(html).toContain("flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4 border-b border-zinc-100");
    expect(html).toContain("w-full max-w-3xl mx-auto px-4 py-6 overflow-x-hidden");
    expect(html).toContain("flex w-full max-w-full flex-col justify-between gap-2");
    expect(html).toContain("sm:flex-row sm:items-center");
    expect(html).toContain("DEDUCE →");
    expect(html).toContain("Storylines");
    expect(html).toContain("Daily Drop");
    expect(html).toContain("By Sport");
    expect(html).toContain("Standings");
    expect(html).not.toMatch(/w-\[\d+px\]/);
  });
});
