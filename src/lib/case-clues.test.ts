import { describe, expect, it } from "vitest";
import { caseClues } from "./case-clues";

describe("caseClues", () => {
  it("opens the 1980 Wimbledon final in Swedish", () => {
    const clues = caseClues({
      slug: "wimbledon-epic-1980",
      context: "Wimbledonfinalen, herrar",
      year: 1980,
    });
    expect(clues[0]).not.toMatch(/Centre Court|New York|baslinjemästaren|1980/);
    expect(clues[4]).toBe(
      "En drömduell på Centre Court mellan två raka motsatser: den stoiske skandinaviske baslinjemästaren mot den eldige serve-och-volley-spelaren från New York.",
    );
    expect(clues.join(" ")).not.toMatch(/\b(the|and|with|winner|scoreboard)\b/i);
  });

  it("opens the 1972 Summit Series in Swedish", () => {
    const clues = caseClues({
      slug: "summit-series-1972",
      context: "Summit Series-avgörandet",
      year: 1972,
    });
    expect(clues[0]).not.toMatch(/NHL|Röd Maskinen|1972|Sovjet|Kanada/);
    expect(clues[4]).toBe(
      "En enastående 8-matchers interkontinental drabbning som ställde NHL-superstjärnor mot den hemlighetsfulla Röd Maskinen.",
    );
  });

  it("keeps the other case ladders in Swedish", () => {
    for (const slug of ["summit-series-1972", "miracle-on-ice-1980", "rumble-in-the-jungle-1974", "bolt-beijing-2008", "pele-sweden-1958"]) {
      const clues = caseClues({ slug, context: "Klassiker", year: 1980 });
      expect(clues.length).toBeGreaterThanOrEqual(5);
      expect(clues.slice(0, 4).join(" ")).not.toMatch(/\b(19|20)\d{2}\b/);
      expect(clues.join(" ")).not.toMatch(/\b(the|and|with|winner|scoreboard|clue)\b/i);
    }
  });
});