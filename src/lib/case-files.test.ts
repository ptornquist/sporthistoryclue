import { describe, expect, it } from "vitest";
import {
  CASE_FILES,
  fixtureSubtitle,
  isSpoilerHeading,
  mysteryFixtureLabel,
  previewFromArchive,
  previewFromCase,
  publicCaseTitle,
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
    expect(perfectTen?.title).toBe("Siffran som inte fick plats");
    expect(bolt?.title).toBe("Spikarna före bandet");
    expect(CASE_FILES.find((file) => file.slug === "pasadena-bronze-1994")?.title).toBe("Sommarnatten i västern");
    expect(CASE_FILES.find((file) => file.slug === "turin-gold-2006")?.context).toBe("Internationell mästerskapsfinal");
    expect(fixtureSubtitle(1994, "Olympic Final Shootout")).toBe(
      "1994 · Olympic Final Shootout · 6 ledtrådar",
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
    expect(isSpoilerHeading("Spikarna före bandet")).toBe(false);
    expect(isSpoilerHeading("Usain Bolt springer 9,69 i Peking")).toBe(true);
    expect(isSpoilerHeading("Spyridon Louis vinner det första olympiska maratonloppet")).toBe(true);
    expect(publicCaseTitle("The Masterpiece in Hamilton")).toBe("Den 87:e symfonin");
    expect(publicCaseTitle("The Lake Placid Frequency")).toBe("Sirenen i kylan");
    expect(publicCaseTitle("Bronshjältarna från Pasadena")).toBe("Sommarnatten i västern");
    expect(safeHeading("USA vs Soviet Union (Winter Olympics)", 1980, "miracle-on-ice-1980")).toBe(
      "Sirenen i kylan",
    );
    const archived = previewFromArchive({
      id: "row-1",
      title: "Brazil vs Sweden (Pelé’s Breakthrough)",
      category: "Football",
      year: 1958,
    });
    expect(archived.title).toBe("Arkivakt 1958");
    expect(archived.title).not.toMatch(/vs/i);
    expect(archived.context).toBe("Football");
  });

  it("uses sport-shaped placeholders that do not name the match", () => {
    expect(mysteryFixtureLabel("ice_hockey")).toBe("Klassisk ishockeymatch");
    expect(mysteryFixtureLabel("football")).toBe("Historisk fotbollsmatch");
    expect(CASE_FILES.find((file) => file.slug === "slaget-i-sudden")?.title).toBe("Mysteriet på isen #1");
    expect(CASE_FILES.find((file) => file.slug === "guldkampen-i-norr")?.context).toBe("Finalserie");
    expect(CASE_FILES.find((file) => file.slug === "sondagsmorgonen-stockholms-stad")?.title).toBe(
      "Mysteriet på gräset #1",
    );
    expect(CASE_FILES.find((file) => file.slug === "guldstriden-sista-omgangen")?.context).toBe("Guldstrid");
    expect(publicCaseTitle("Slaget i sudden")).toBe("Mysteriet på isen #1");
    expect(publicCaseTitle("Söndagsmorgonen på Stockholms stad")).toBe("Mysteriet på gräset #1");
    expect(mysteryFixtureLabel("basketball")).toBe("Historisk mästerskapsfinal");
    expect(mysteryFixtureLabel("tennis")).toBe("Historisk mästerskapsfinal");
    expect(mysteryFixtureLabel("gymnastics")).toBe("Historiskt mästerskapsögonblick");
    expect(mysteryFixtureLabel("athletics")).toBe("Historiskt mästerskapsögonblick");
    expect(mysteryFixtureLabel("boxing")).toBe("Historisk titelmatch");
    for (const file of CASE_FILES) {
      const label = mysteryFixtureLabel(file.sport);
      expect(isSpoilerHeading(label)).toBe(false);
      expect(label).not.toMatch(/\(\s*(18|19|20)\d{2}\s*\)/);
    }
  });

  it("stores solved progress under shc_score keys", () => {
    expect(scoreStorageKey("bolt-beijing-2008")).toBe("shc_score_bolt-beijing-2008");
  });
});
