import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SportArchive } from "@/components/game/SportArchive";
import { ARCHIVE_FIXTURES, deduceHref, loadArchiveIndex } from "./sport-archive";

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

describe("sport archive", () => {
  it("lists every discipline with difficulty, clue count, and a solver link", () => {
    const football = loadArchiveIndex("football");
    expect(football.map((fixture) => fixture.title)).toContain("Genombrottet på värdarnas plan");
    expect(football.every((fixture) => fixture.clueCount > 0 && fixture.difficulty >= 1)).toBe(true);
    expect(deduceHref("pele-sweden-1958")).toBe("/play/pele-sweden-1958");

    const html = renderToStaticMarkup(
      createElement(SportArchive, { selected: "football", fixtures: football }),
    );
    expect(html).toContain("Ishockey");
    expect(html).toContain("Fotboll");
    expect(html).toContain("Boxning");
    expect(html).toContain("Tennis");
    expect(html).toContain("Friidrott");
    expect(html).toContain('href="/archive?sport=football"');
    expect(html).toContain("Svårighet 1 · 5 ledtrådar");
    expect(html).toContain("DEDUCERA →");
    expect(html).toContain('href="/play/pele-sweden-1958"');
    expect(html).toContain("bg-blue-600 border-blue-600 text-white");

    for (const fixture of football) {
      expect(html).not.toContain(`${fixture.year} ·`);
      expect(html).not.toContain(fixture.context);
    }
    expect(html).toContain("Historisk fotbollsmatch");

    expect(loadArchiveIndex("football")).toHaveLength(16);
    expect(loadArchiveIndex("boxing")).toHaveLength(1);
    expect(loadArchiveIndex("tennis")).toHaveLength(2);
    expect(loadArchiveIndex("athletics")).toHaveLength(5);

    const hockey = loadArchiveIndex("ice_hockey");
    expect(hockey.map((fixture) => fixture.id)).toEqual([
      "sverige-sovjet-1984",
      "slaget-i-sudden",
      "guldkampen-i-norr",
      "miracle-on-ice-1980",
      "summit-series-1972",
      "turin-gold-2006",
      "farjestad-skelleftea-2011",
      "brynas-skelleftea-2012",
      "skelleftea-farjestad-2014",
      "frolunda-skelleftea-2016",
    ]);
    expect(ARCHIVE_FIXTURES.find((fixture) => fixture.id === "sverige-sovjet-1984")).toEqual({
      id: "sverige-sovjet-1984",
      sport: "ice_hockey",
      title: "Klassisk drabbning i Scandinavium",
      year: 1984,
      context: "Internationell klassiker",
      difficulty: 2,
      clueCount: 5,
    });
    const hockeyHtml = renderToStaticMarkup(
      createElement(SportArchive, { selected: "ice_hockey", fixtures: hockey }),
    );
    expect(hockeyHtml).toContain("Klassisk drabbning i Scandinavium");
    expect(hockeyHtml).toContain('href="/play/sverige-sovjet-1984"');
    expect(hockeyHtml).toContain("Mysteriet på isen #1");
    expect(hockeyHtml).toContain("Mysteriet på isen #2");
    expect(hockeyHtml).toContain("Klassisk ishockeymatch");
    expect(hockeyHtml).toContain("Sirenen i kylan");
    expect(hockeyHtml).toContain("Sirenen före midnatt");
    expect(hockeyHtml).toContain("Vintermorgonen i alperna");
    expect(hockeyHtml).toContain("Mysteriet på isen #6");
    expect(hockeyHtml).not.toContain("Internationell");
    expect(hockeyHtml).not.toContain("USA");
    expect(hockeyHtml).not.toContain("Sovjet");
    expect(hockeyHtml).not.toContain("Slutspelsdrama");
    expect(hockeyHtml).not.toContain("Finalserie");
    expect(hockeyHtml.replace(/href="[^"]*"/g, "")).not.toMatch(/\b(18|19|20)\d{2}\b/);

    const visible = ARCHIVE_FIXTURES.map((fixture) => `${fixture.title} ${fixture.context}`).join("\n");
    for (const leak of ANSWER_LEAKS) {
      expect(visible).not.toMatch(leak);
    }
    expect(visible).not.toMatch(/Internationell serie|Medaljomgång|Internationell mästerskapsfinal/);
  });
});
