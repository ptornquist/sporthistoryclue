import { describe, expect, it } from "vitest";
import { caseClues } from "./case-clues";

describe("caseClues", () => {
  it("opens the 1980 Wimbledon final in Swedish", () => {
    const clues = caseClues({
      slug: "wimbledon-epic-1980",
      context: "Wimbledonfinalen, herrar",
      year: 1980,
    });
    expect(clues[0]).toBe(
      "En drömduell mellan två motsatser på Centre Court: den stoiske skandinaviske baslinjemästaren mot den eldige serve-och-volley-spelaren från New York.",
    );
    expect(clues.join(" ")).not.toMatch(/\b(the|and|with|winner|scoreboard)\b/i);
  });

  it("keeps the other case ladders in Swedish", () => {
    for (const slug of ["summit-series-1972", "miracle-on-ice-1980", "rumble-in-the-jungle-1974", "bolt-beijing-2008", "pele-sweden-1958"]) {
      const clues = caseClues({ slug, context: "Klassiker", year: 1980 });
      expect(clues.length).toBeGreaterThanOrEqual(5);
      expect(clues.join(" ")).not.toMatch(/\b(the|and|with|winner|scoreboard|clue)\b/i);
    }
  });
});