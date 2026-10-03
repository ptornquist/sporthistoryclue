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

  it("keeps the Pasadena bronze cryptic until the last card", () => {
    const clues = caseClues({
      slug: "pasadena-bronze-1994",
      context: "VM-bronsmatch",
      year: 1994,
    });
    expect(clues.slice(0, 4).join(" ")).not.toMatch(/Bulgarien|Sverige|Brolin|1994|4–0|4-0/);
    expect(clues[4]).toBe(
      "Bronshjältarna från Pasadena. VM 1994, bronsmatchen mot Bulgarien, slutar 4–0 och Sverige sjunger sig hem med medaljerna.",
    );
    expect(clues.join(" ")).not.toMatch(/\b(the|and|with|winner|scoreboard|clue)\b/i);
  });

  it("saves the Turin final and Lidström's shot for the last card", () => {
    const clues = caseClues({
      slug: "turin-gold-2006",
      context: "OS-final",
      year: 2006,
    });
    expect(clues.slice(0, 4).join(" ")).not.toMatch(/Lidström|Finland|Tre Kronor|Turin|2006|3–2|slagskott/);
    expect(clues[4]).toBe(
      "Guldfeber i Turin. OS-finalen 2006, Tre Kronor mot Finland, slutar 3–2 efter Nicklas Lidströms ikoniska slagskott direkt i början av tredje perioden.",
    );
    expect(clues.join(" ")).not.toMatch(/\b(the|and|with|winner|scoreboard|clue)\b/i);
  });

  it("keeps SHL and Allsvenskan campaigns cryptic until the last card", () => {
    const secret = /Skellefteå|Luleå|Frölunda|Växjö|Hammarby|Djurgården|Trelleborg|Göteborg|Blåvitt|Kiiskinen|Wernbloom|Mrabti|Ullevi|Tele2|Kalmar|2013|2015|2018|2007|4–0|2–1|3–1|2–0|104/;
    for (const slug of [
      "slaget-i-sudden",
      "guldkampen-i-norr",
      "sondagsmorgonen-stockholms-stad",
      "guldstriden-sista-omgangen",
    ]) {
      const clues = caseClues({ slug, context: "Klassiker", year: 2015 });
      expect(clues).toHaveLength(5);
      expect(clues.slice(0, 4).join(" ")).not.toMatch(secret);
      expect(clues.join(" ")).not.toMatch(/\b(the|and|with|winner|scoreboard|clue)\b/i);
    }
    expect(caseClues({ slug: "slaget-i-sudden", context: "Klassiker", year: 2015 })[4]).toMatch(/Växjö/);
    expect(caseClues({ slug: "guldkampen-i-norr", context: "Klassiker", year: 2013 })[4]).toMatch(/Skellefteå/);
    expect(caseClues({ slug: "sondagsmorgonen-stockholms-stad", context: "Klassiker", year: 2018 })[4]).toMatch(/Hammarby/);
    expect(caseClues({ slug: "guldstriden-sista-omgangen", context: "Klassiker", year: 2007 })[4]).toMatch(/Trelleborg/);
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