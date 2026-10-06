import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DailyDropArena } from "./DailyDropArena";

const fixture = {
  id: "miracle-1980",
  date_key: "2026-09-27",
  category: "Ice hockey",
  clues: ["The building is quiet and the favorite is heavy."],
  options: ["1980 Olympics: USA vs Soviet Union", "1984 Olympics: USA vs Canada", "1976 Olympics: USA vs Czechoslovakia", "1988 Olympics: Soviet Union vs Finland"],
};

describe("DailyDropArena archive navigation", () => {
  it("links today's drop to the archive calendar", () => {
    const html = renderToStaticMarkup(createElement(DailyDropArena, { initialFixture: fixture }));
    expect(html).toContain("📅 Öppna kalendern");
    expect(html).toContain("mb-6 flex items-center justify-center gap-4");
    expect(html).toContain(
      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider transition-all border border-zinc-200",
    );
    expect(html.indexOf("KLURING #")).toBeLessThan(html.indexOf("Öppna kalendern"));
    expect(html.indexOf("Öppna kalendern")).toBeLessThan(html.indexOf("Ledtråd 1 av"));
    expect(html).not.toContain("Yesterday");
    expect(html).not.toContain("Full Calendar");
  });

  it("offers today and the full calendar on a dated dossier", () => {
    const html = renderToStaticMarkup(
      createElement(DailyDropArena, { initialFixture: fixture, archiveDate: "2026-09-24" }),
    );
    expect(html).toContain("← Tillbaka till idag");
    expect(html).toContain("text-blue-600 font-bold text-xs hover:underline");
    expect(html).toContain("📅 Hela kalendern");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/archive"');
    expect(html.indexOf("KLURING #")).toBeLessThan(html.indexOf("Hela kalendern"));
    expect(html.indexOf("Hela kalendern")).toBeLessThan(html.indexOf("Ledtråd 1 av"));
    expect(html).not.toContain("Yesterday");
    expect(html).not.toContain("Öppna kalendern");
  });
});
