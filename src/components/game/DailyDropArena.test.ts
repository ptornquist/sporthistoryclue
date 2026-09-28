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

describe("DailyDropArena tactical board", () => {
  it("opens on 10 000 points with locked tiles and the guess options underneath", () => {
    const html = renderToStaticMarkup(createElement(DailyDropArena, { initialFixture: fixture }));
    expect(html).toContain("Tactical Board");
    expect(html).toContain("10 000");
    expect(html).toContain("FREE / UNLOCKED");
    expect(html).toContain("ACTIVE INTEL:");
    expect(html).toContain("A cold-war winter.");
    expect(html).toContain("Review the opening briefing below.");
    expect(html).toContain("REVEAL -1,500 PTS");
    expect(html).toContain("REVEAL -3,500 PTS");
    expect(html).toContain("Identify the Historical Matchup");
    expect(html).toContain("grid grid-cols-2 gap-2.5 touch-manipulation sm:gap-3");
    expect(html).toContain("p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold");
    expect(html).toContain("1980 Olympics: USA vs Soviet Union");
    expect(html.indexOf("Tactical Board")).toBeLessThan(html.indexOf("A cold-war winter."));
    expect(html.indexOf("A cold-war winter.")).toBeLessThan(html.indexOf("Identify the Historical Matchup"));
    expect(html).not.toContain("The final is 4–3.");
    expect(html).not.toContain("REVEAL -1,000 PTS");
    expect(html).not.toContain("Reveal Next Clue");
    expect(html).not.toContain("Yesterday");
    expect(html).toContain("BROWSE ARCHIVE →");
    expect(html).toContain('href="/archive"');
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
    expect(identified.indexOf("STORYLINE CHAPTER")).toBeLessThan(identified.indexOf("Tactical Board"));
    expect(identified).not.toContain("ARCHIVE FIXTURE");
  });
});
