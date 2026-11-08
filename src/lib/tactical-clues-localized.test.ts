import { describe, expect, it } from "vitest";
import { localizedClues, resolveTacticalClueList } from "./tactical-clues";

describe("localizedClues", () => {
  const bilingual = {
    sv: ["Arenan är full.", "Ett kallt krig."],
    en: ["The arena is packed.", "A cold war."],
  };

  it("returns the requested language list", () => {
    expect(localizedClues(bilingual, "en")).toEqual(["The arena is packed.", "A cold war."]);
    expect(localizedClues(bilingual, "sv")).toEqual(["Arenan är full.", "Ett kallt krig."]);
  });

  it("falls back to Swedish when English is missing", () => {
    const onlySwedish = { sv: ["Bara svenska."] };
    expect(localizedClues(onlySwedish, "en")).toEqual(["Bara svenska."]);
  });

  it("falls back to English when Swedish is missing", () => {
    const onlyEnglish = { en: ["Only English."] };
    expect(localizedClues(onlyEnglish, "sv")).toEqual(["Only English."]);
  });

  it("passes through plain arrays and strings unchanged", () => {
    expect(localizedClues(["Enkel ledtråd"], "en")).toEqual(["Enkel ledtråd"]);
    expect(localizedClues("En sträng", "en")).toBe("En sträng");
    expect(localizedClues(null, "en")).toBeNull();
  });

  it("parses a JSON string holding the language map", () => {
    const asString = JSON.stringify(bilingual);
    expect(localizedClues(asString, "en")).toEqual(["The arena is packed.", "A cold war."]);
  });
});

describe("resolveTacticalClueList with localized input", () => {
  it("resolves the picked language list into clue strings", () => {
    const source = {
      sv: ["Svensk ledtråd ett.", "Svensk ledtråd två."],
      en: ["English clue one.", "English clue two."],
    };
    expect(resolveTacticalClueList(localizedClues(source, "en"))).toEqual([
      "English clue one.",
      "English clue two.",
    ]);
    expect(resolveTacticalClueList(localizedClues(source, "sv"))).toEqual([
      "Svensk ledtråd ett.",
      "Svensk ledtråd två.",
    ]);
  });
});
