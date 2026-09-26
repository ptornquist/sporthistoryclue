import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FixturePreview } from "./FixturePreview";
import { readSolvedScoreForIds, rememberSolvedCase } from "@/lib/solved-cases";

describe("FixturePreview", () => {
  it("hides the matchup and links PLAY while the case is open", () => {
    const html = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "The 1.00 Scoreboard Anomaly",
        year: 1976,
        context: "Olympic All-Around",
        solvedScore: null,
        matchup: "Nadia Comăneci (1976)",
        href: "/?match=comaneci-1976&campaign=olympic-miracles",
      }),
    );
    expect(html).toContain("The 1.00 Scoreboard Anomaly");
    expect(html).toContain("Classified Dossier · 6 Clues · 10 000 Max PTS");
    expect(html).toContain('class="text-xs font-mono text-zinc-400 font-medium"');
    expect(html).not.toContain("1976 ·");
    expect(html).not.toContain("Olympic All-Around");
    expect(html).toContain("PLAY →");
    expect(html).toContain(
      "bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider",
    );
    expect(html).not.toContain("DEDUCE");
    expect(html).toContain('href="/?match=comaneci-1976&amp;campaign=olympic-miracles"');
    expect(html).not.toContain("Nadia");
    expect(html).not.toContain("SOLVED");
  });

  it("reveals the matchup and score only after the case is solved", () => {
    const html = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "The Beijing Lightning Bolt",
        year: 2008,
        context: "Olympic 100m Final",
        solvedScore: 8500,
        matchup: "Usain Bolt (2008)",
        href: "/?match=bolt-beijing-2008",
        density: "row",
      }),
    );
    expect(html).toContain("The Golden Spikes");
    expect(html).not.toContain("Beijing");
    expect(html).not.toContain("Lightning Bolt");
    expect(html).toContain("✓ SOLVED · 8500 PTS");
    expect(html).toContain("Usain Bolt (2008)");
    expect(html).toContain("2008 · Olympic 100m Final · 6 Clues");
    expect(html).toContain('href="/?match=bolt-beijing-2008"');
    expect(html).not.toContain("PLAY");
    expect(html).not.toContain("DEDUCE");
  });

  it("uses the same PLAY button on archive rows", () => {
    const html = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "The Summit Series",
        year: 1972,
        context: "Hockey",
        solvedScore: null,
        matchup: null,
        href: "/?match=summit-series-1972",
        density: "row",
      }),
    );
    expect(html).toContain("PLAY →");
    expect(html).toContain(
      "bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider",
    );
    expect(html).toContain("Classified Dossier · 6 Clues · 10 000 Max PTS");
    expect(html).not.toContain("1972 ·");
    expect(html).not.toContain("Hockey");
    expect(html).not.toContain("DEDUCE");
  });

  it("renames a venue giveaway and hides the year on an unplayed row", () => {
    const html = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "The Masterpiece in Hamilton",
        year: 1987,
        context: "ice_hockey",
        solvedScore: null,
        matchup: "Canada vs Soviet Union (1987)",
        href: "/?match=symphony",
        density: "row",
      }),
    );
    expect(html).toContain("The 87th Symphony");
    expect(html).toContain("Classified Dossier · 6 Clues · 10 000 Max PTS");
    expect(html).toContain("PLAY →");
    expect(html).not.toContain("Hamilton");
    expect(html).not.toContain("1987");
    expect(html).not.toContain("ice_hockey");
    expect(html).not.toContain("Canada");
    expect(html).not.toContain("DEDUCE");
  });
});

describe("rememberSolvedCase", () => {
  it("writes the score under the played id and its public aliases", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      },
    });
    rememberSolvedCase("bolt-2008", 8500);
    expect(store.get("shc_score_bolt-2008")).toBe("8500");
    expect(store.get("shc_score_bolt-beijing-2008")).toBe("8500");
    expect(readSolvedScoreForIds(["bolt-beijing-2008"])).toBe(8500);
    vi.unstubAllGlobals();
  });
});
