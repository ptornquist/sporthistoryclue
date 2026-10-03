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

    const visible = ARCHIVE_FIXTURES.map((fixture) => `${fixture.title} ${fixture.context}`).join("\n");
    for (const leak of ANSWER_LEAKS) {
      expect(visible).not.toMatch(leak);
    }
  });
});
