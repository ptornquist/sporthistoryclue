import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FixturePreview } from "./FixturePreview";
import { readSolvedScoreForIds, rememberSolvedCase } from "@/lib/solved-cases";

describe("FixturePreview", () => {
  it("hides the matchup and keeps DEDUCE while the case is open", () => {
    const html = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "1,00-poängsanomalin",
        year: 1976,
        context: "OS-mångkamp",
        solvedScore: null,
        matchup: "Nadia Comăneci (1976)",
        onDeduce: () => undefined,
      }),
    );
    expect(html).toContain("1,00-poängsanomalin");
    expect(html).toContain("1976 · OS-mångkamp · 6 ledtrådar");
    expect(html).toContain("DEDUCERA →");
    expect(html).not.toContain("Nadia");
    expect(html).not.toContain("SOLVED");
  });

  it("shows a mysterious placeholder instead of the matchup until the fixture is solved", () => {
    const open = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "Siffran som inte fick plats",
        year: 1976,
        context: "Individuell final",
        solvedScore: null,
        matchup: "Nadia Comăneci (1976)",
        mysteryLabel: "Historiskt mästerskapsögonblick",
        clueCount: false,
      }),
    );
    expect(open).toContain("Historiskt mästerskapsögonblick");
    expect(open).not.toContain("Nadia");
    expect(open).not.toContain("Comăneci");

    const solved = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "Sirenen i kylan",
        year: 1980,
        context: "Medaljomgång",
        solvedScore: 10000,
        matchup: "USA mot Sovjetunionen (1980)",
        mysteryLabel: "Klassisk ishockeyduell",
        clueCount: false,
      }),
    );
    expect(solved).toContain("USA mot Sovjetunionen (1980)");
    expect(solved).not.toContain("Klassisk ishockeyduell");
  });

  it("reveals the matchup and score only after the case is solved", () => {
    const html = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "The Beijing Lightning Bolt",
        year: 2008,
        context: "Olympic 100m Final",
        solvedScore: 8500,
        matchup: "Usain Bolt (2008)",
        onDeduce: () => undefined,
        density: "row",
      }),
    );
    expect(html).toContain("The Beijing Lightning Bolt");
    expect(html).toContain("✓ AVKLARAD · 8500 POÄNG");
    expect(html).toContain("Usain Bolt (2008)");
    expect(html).toContain("2008 · Olympic 100m Final · 6 ledtrådar");
    expect(html).not.toContain("DEDUCERA");
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
