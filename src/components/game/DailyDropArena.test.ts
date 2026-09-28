import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DailyDropArena } from "./DailyDropArena";

const fixture = {
  id: "miracle-1980",
  date_key: "2026-09-27",
  category: "Ice hockey",
  clues: [
    "The rink is loud and the favorite is heavy.",
    "A cold-war winter.",
    "A college line that will not sit.",
    "A flooded sheet under a low roof.",
    "The captain finishes the night.",
    "The final is 4–3.",
  ],
  options: ["1980 Olympics: USA vs Soviet Union", "1984 Olympics: USA vs Canada"],
};

const GUESS =
  "border-[2.5px] border-zinc-950 bg-white hover:bg-zinc-100 active:translate-y-[2px] rounded-xl p-3.5 text-center font-black text-sm md:text-base leading-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all";
const SHELL = "max-w-md mx-auto h-[100dvh] flex flex-col justify-between p-3 overflow-hidden select-none";

describe("DailyDropArena tactical board", () => {
  it("opens as a zero-scroll arcade with the guess grid anchored underneath", () => {
    const html = renderToStaticMarkup(createElement(DailyDropArena, { initialFixture: fixture }));
    expect(html).toContain(SHELL);
    expect(html).toContain("SPORTSHISTORYCLUE");
    expect(html).toContain("10,000 PTS");
    expect(html).toContain("🔥");
    expect(html).toContain('aria-label="Toggle Navigation Menu"');
    expect(html).toContain("CLUE 1: THE ARENA");
    expect(html).toContain("A cold-war winter.");
    expect(html).toContain(GUESS);
    expect(html).toContain("grid shrink-0 grid-cols-2 gap-2");
    expect(html).toContain("1980 Olympics: USA vs Soviet Union");
    expect(html.indexOf("A cold-war winter.")).toBeLessThan(html.indexOf("1980 Olympics: USA vs Soviet Union"));
    expect(html).not.toContain("Review the opening briefing below.");
    expect(html).not.toContain("DROP #");
    expect(html).not.toContain("BROWSE ARCHIVE");
    expect(html).not.toContain("Contact Scout HQ");
    expect(html).not.toContain("The final is 4–3.");
    expect(html).not.toContain("Reveal Next Clue");
    expect(html).not.toContain("Yesterday");
    expect(html).not.toContain("ARCHIVE FIXTURE");
  });

  it("marks a dated or identified fixture as an archive dossier", () => {
    const dated = renderToStaticMarkup(
      createElement(DailyDropArena, { initialFixture: fixture, archiveDate: "2026-09-20" }),
    );
    const identified = renderToStaticMarkup(
      createElement(DailyDropArena, { initialFixture: fixture, archiveId: "miracle-1980" }),
    );
    const badge =
      "bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider";
    expect(dated).toContain(badge);
    expect(dated).toContain("📅 ARCHIVE FIXTURE");
    expect(dated).not.toContain("STORYLINE CHAPTER");
    expect(identified).toContain("STORYLINE CHAPTER");
    expect(identified.indexOf("STORYLINE CHAPTER")).toBeLessThan(identified.indexOf("CLUE 1: THE ARENA"));
    expect(identified).not.toContain("ARCHIVE FIXTURE");
  });
});
