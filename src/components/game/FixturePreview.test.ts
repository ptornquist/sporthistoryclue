import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FixturePreview } from "./FixturePreview";
import { readSolvedScoreForIds, rememberSolvedCase } from "@/lib/solved-cases";

describe("FixturePreview", () => {
  it("hides the matchup and keeps DEDUCE while the case is open", () => {
    const html = renderToStaticMarkup(
      createElement(FixturePreview, {
        title: "The 1.00 Scoreboard Anomaly",
        year: 1976,
        context: "Olympic All-Around",
        solvedScore: null,
        matchup: "Nadia Comăneci (1976)",
        onDeduce: () => undefined,
      }),
    );
    expect(html).toContain("The 1.00 Scoreboard Anomaly");
    expect(html).toContain("1976 · Olympic All-Around · 6 Clues");
    expect(html).toContain("DEDUCE →");
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
        onDeduce: () => undefined,
        density: "row",
      }),
    );
    expect(html).toContain("The Beijing Lightning Bolt");
    expect(html).toContain("✓ SOLVED · 8500 PTS");
    expect(html).toContain("Usain Bolt (2008)");
    expect(html).toContain("2008 · Olympic 100m Final · 6 Clues");
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
