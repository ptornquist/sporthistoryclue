import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StorylinesHub } from "@/components/storylines/StorylinesHub";
import { ERA_STORYLINES, chapterHref, storylineProgress } from "./era-storylines";

describe("era storylines", () => {
  it("lists the four curated campaigns and chapter links", () => {
    expect(ERA_STORYLINES.map((storyline) => storyline.title)).toEqual([
      "Cold War on Ice",
      "Heavyweight Golden Era",
      "The Great Finals",
      "Sprint & Scandal",
    ]);
    const chapters = ERA_STORYLINES.flatMap((storyline) => storyline.chapters);
    expect(chapters.map((chapter) => chapter.title)).toEqual([
      "1980 Miracle on Ice",
      "1972 Summit Series",
      "1974 Rumble in the Jungle",
      "1975 Thrilla in Manila",
      "1994 World Cup Final",
      "2008 Wimbledon Final",
      "1988 Olympic 100m Final",
    ]);
    expect(chapterHref(chapters[0])).toBe("/?id=miracle-1980");
    expect(chapterHref(chapters[3])).toBe("/?id=thrilla-in-manila-1975");
    const coldWar = ERA_STORYLINES[0];
    expect(storylineProgress(coldWar, new Set(["miracle-on-ice-1980"]))).toEqual({
      done: 1,
      total: 2,
      percent: 50,
    });
  });

  it("renders the hub with playable chapters before local history loads", () => {
    const html = renderToStaticMarkup(createElement(StorylinesHub));
    expect(html).toContain("STORYLINES &amp; ERAS");
    expect(html).toContain(
      "Curated historical campaigns. Follow legendary rivalries and pivotal eras through tactical dossiers.",
    );
    expect(html).toContain(
      "bg-white border-[3px] border-zinc-900 rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] mb-5 hover:translate-y-[-2px] transition-all",
    );
    expect(html).toContain(
      "bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase px-2.5 py-0.5 rounded-full",
    );
    expect(html).toContain("text-xl font-black text-zinc-900 tracking-tight");
    expect(html).toContain("w-full h-3 bg-zinc-100 rounded-full border border-zinc-300 overflow-hidden my-3");
    expect(html).toContain("h-full bg-blue-600 rounded-full transition-all");
    expect(html).toContain("text-xs font-bold text-zinc-600 flex justify-between");
    expect(html).toContain("PLAY CHAPTER →");
    expect(html).toContain('href="/?id=miracle-1980"');
    expect(html).toContain('href="/?id=summit-series-1972"');
    expect(html).toContain('href="/?id=ali-1974"');
    expect(html).toContain('href="/?id=thrilla-in-manila-1975"');
    expect(html).toContain('href="/?id=world-cup-final-1994"');
    expect(html).toContain('href="/?id=wimbledon-final-2008"');
    expect(html).toContain('href="/?id=seoul-100m-1988"');
    expect(html).toContain("🏒");
    expect(html).toContain("🥊");
    expect(html).toContain("⚽");
    expect(html).toContain("🎾");
    expect(html).toContain("🏃");
    expect(html).not.toContain("COMPLETED ✓");

    const solved = renderToStaticMarkup(
      createElement(StorylinesHub, { solvedIds: new Set(["ali-1974", "seoul-100m-1988"]) }),
    );
    expect(solved).toContain("COMPLETED ✓");
    expect(solved).toContain("1 / 2 chapters");
    expect(solved).toContain("50%");
    expect(solved).toContain("1 / 1 chapters");
    expect(solved).toContain("100%");
    expect(solved).not.toContain('href="/?id=ali-1974"');
    expect(solved).toContain('href="/?id=thrilla-in-manila-1975"');

    const page = readFileSync(new URL("../app/storylines/page.tsx", import.meta.url), "utf8");
    expect(page).not.toContain("redirect");
    expect(page).toContain("StorylinesHub");
    const drawer = readFileSync(new URL("../components/Navbar.tsx", import.meta.url), "utf8");
    expect(drawer).toContain("{ icon: '📖', name: 'Storylines & Eras', href: '/storylines' }");
  });
});
