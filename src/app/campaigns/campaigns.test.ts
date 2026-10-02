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
    expect(html).toContain("shrink-0 text-lg md:text-xl font-black tracking-tighter uppercase");
    expect(html).toContain("hidden md:flex items-center gap-6");
    expect(html).toContain("☰");
    expect(html).not.toContain("overflow-x-auto no-scrollbar");
    expect(html).toContain("w-full max-w-3xl mx-auto px-4 py-6 overflow-x-hidden");
    expect(html).toContain("flex w-full max-w-full flex-col justify-between gap-2");
    expect(html).toContain("sm:flex-row sm:items-center");
    expect(html).toContain("DEDUCE →");
    expect(html).toContain("Storylines");
    expect(html).toContain("Daily Drop");
    expect(html).toContain("Disciplines");
    expect(html).toContain("Leaderboard");
    expect(html).not.toMatch(/w-\[\d+px\]/);
  });
});
