import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DailySportPills, sportIdForCategory, sportMatchSlug } from "./DailySportPills";

describe("daily sport pills", () => {
  it("lists the five disciplines and marks the selected one", () => {
    const html = renderToStaticMarkup(
      createElement(DailySportPills, { selectedSport: "football", onSelect: vi.fn() }),
    );
    expect(html).toContain("flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-4 w-full");
    expect(html).toContain("Ice Hockey");
    expect(html).toContain("Football");
    expect(html).toContain("Boxing");
    expect(html).toContain("Tennis");
    expect(html).toContain("Athletics");
    expect(html).toContain("bg-blue-600 border-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]");
    expect(html).toContain("⚽");
  });

  it("maps a sport to a playable case and a category back to a pill", () => {
    expect(sportMatchSlug("ice_hockey")).toBe("miracle-on-ice-1980");
    expect(sportMatchSlug("football")).toBe("pele-sweden-1958");
    expect(sportMatchSlug("boxing")).toBe("rumble-in-the-jungle-1974");
    expect(sportMatchSlug("tennis")).toBe("wimbledon-epic-1980");
    expect(sportMatchSlug("athletics")).toBe("bolt-beijing-2008");
    expect(sportIdForCategory("Ice Hockey")).toBe("ice_hockey");
    expect(sportIdForCategory("Olympic 100m Final")).toBeNull();
    expect(sportIdForCategory("Athletics")).toBe("athletics");
  });
});
