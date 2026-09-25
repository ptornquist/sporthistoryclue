import { describe, expect, it } from "vitest";
import {
  CASE_FILES,
  fixtureSubtitle,
  isSpoilerHeading,
  previewFromArchive,
  previewFromCase,
  safeHeading,
} from "./case-files";
import { scoreStorageKey } from "./solved-cases";

const ANSWER_LEAKS = [
  / vs /i,
  /com[aă]neci/i,
  /usain/i,
  /pel[eé]/i,
  /maradona/i,
  /muhammad ali/i,
  /foreman/i,
  /mcenroe/i,
  /borg/i,
  /dream team/i,
  /soviet/i,
  /sweden/i,
  /canada/i,
  /croatia/i,
];

describe("mystery case files", () => {
  it("uses thematic titles and a clue-count subtitle", () => {
    const perfectTen = CASE_FILES.find((file) => file.slug === "comaneci-1976");
    const bolt = CASE_FILES.find((file) => file.slug === "bolt-beijing-2008");
    expect(perfectTen?.title).toBe("The 1.00 Scoreboard Anomaly");
    expect(bolt?.title).toBe("The Beijing Lightning Bolt");
    expect(fixtureSubtitle(1994, "Olympic Final Shootout")).toBe(
      "1994 · Olympic Final Shootout · 6 Clues",
    );
  });

  it("keeps answers out of public case headings and context", () => {
    for (const file of CASE_FILES) {
      const preview = previewFromCase(file);
      const visible = `${preview.title} ${preview.context} ${fixtureSubtitle(preview.year, preview.context)}`;
      for (const leak of ANSWER_LEAKS) {
        expect(visible).not.toMatch(leak);
      }
    }
  });

  it("replaces raw answer strings before they can be rendered", () => {
    expect(isSpoilerHeading("Nadia Comăneci scores the first perfect 10")).toBe(true);
    expect(isSpoilerHeading("Usain Bolt 100m World Record")).toBe(true);
    expect(isSpoilerHeading("Sweden vs Canada 1994")).toBe(true);
    expect(isSpoilerHeading("The Beijing Lightning Bolt")).toBe(false);
    expect(safeHeading("USA vs Soviet Union (Winter Olympics)", 1980, "miracle-on-ice-1980")).toBe(
      "The Lake Placid Frequency",
    );
    const archived = previewFromArchive({
      id: "row-1",
      title: "Brazil vs Sweden (Pelé’s Breakthrough)",
      category: "Football",
      year: 1958,
    });
    expect(archived.title).toBe("Case File 1958");
    expect(archived.title).not.toMatch(/vs/i);
    expect(archived.context).toBe("Football");
  });

  it("stores solved progress under shc_score keys", () => {
    expect(scoreStorageKey("bolt-beijing-2008")).toBe("shc_score_bolt-beijing-2008");
  });
});
