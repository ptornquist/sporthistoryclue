import { describe, expect, it } from "vitest";
import { STORYLINES, arenaHref, firstOpenMatch, nextStorylineMatch, storylineById } from "./storylines";

describe("storyline routing", () => {
  it("points each fixture at that match and campaign", () => {
    expect(arenaHref("comaneci-1976", "olympic-miracles")).toBe(
      "/play/comaneci-1976?campaign=olympic-miracles",
    );
    expect(arenaHref("bolt-beijing-2008")).toBe("/play/bolt-beijing-2008");
  });

  it("starts a campaign on the first unsolved fixture", () => {
    const storyline = storylineById("shl-klassiker");
    expect(storyline).toBeTruthy();
    const next = firstOpenMatch(storyline!.matches, { "slaget-i-sudden": { score: 8000 } });
    expect(next?.key).toBe("guldkampen-i-norr");
    expect(firstOpenMatch(storyline!.matches, {})?.key).toBe("slaget-i-sudden");
  });

  it("labels each era without a year range", () => {
    expect(STORYLINES.map((storyline) => storyline.era)).toEqual(["SHL-ERAN", "ALLSVENSKAN"]);
    for (const storyline of STORYLINES) {
      expect(storyline.era).not.toMatch(/\d/);
      expect(`${storyline.description} ${storyline.matches.map((match) => match.title).join(" ")}`).not.toMatch(
        /Lake Placid|Beijing|Hamilton/,
      );
    }
  });

  it("walks to the next fixture in the storyline", () => {
    expect(nextStorylineMatch("shl-klassiker", "slaget-i-sudden")?.key).toBe("guldkampen-i-norr");
    expect(nextStorylineMatch("shl-klassiker", "guldkampen-i-norr")).toBeNull();
    expect(nextStorylineMatch("allsvenska-derbyn", "sondagsmorgonen-stockholms-stad")?.key).toBe(
      "guldstriden-sista-omgangen",
    );
    expect(nextStorylineMatch("allsvenska-derbyn", "guldstriden-sista-omgangen")).toBeNull();
    expect(storylineById("shl-klassiker")?.matches.map((match) => match.title)).toEqual([
      "Slaget i sudden",
      "Guldkampen i norr",
    ]);
    expect(storylineById("allsvenska-derbyn")?.matches.map((match) => `${match.year} · ${match.context}`)).toEqual([
      "2018 · Klassiskt derbydrama",
      "2007 · Mästerskapsavgörande",
    ]);
    expect(arenaHref("slaget-i-sudden", "shl-klassiker")).toBe("/play/slaget-i-sudden?campaign=shl-klassiker");
  });
});
