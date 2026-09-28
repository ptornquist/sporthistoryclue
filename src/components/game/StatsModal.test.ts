import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { findPremierLeagueClub } from "@/lib/premier-league";
import { aggregateScoutStats } from "@/lib/scout-dossier";
import { StatsModal } from "./StatsModal";

const STAT_BOX =
  "border-2 border-zinc-900 bg-white rounded-xl p-3 text-center shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]";
const RANK_BADGE =
  "border-2 border-zinc-900 bg-amber-100 text-amber-950 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider";

describe("StatsModal", () => {
  it("renders the scout dossier from injected stats", () => {
    const stats = aggregateScoutStats(
      [
        { id: "a", date: "2026-09-01", sport: "football", score: 2400, tilesUnlocked: 2, won: true, timestamp: 1 },
        { id: "b", date: "2026-09-02", sport: "football", score: 1000, tilesUnlocked: 3, won: true, timestamp: 2 },
      ],
      { currentStreak: 2, maxStreak: 5, lastPlayedDate: "2026-09-02" },
      findPremierLeagueClub("liverpool"),
    );
    const html = renderToStaticMarkup(createElement(StatsModal, { open: true, onClose: () => undefined, stats }));
    expect(html).toContain("SCOUT DOSSIER");
    expect(html).toContain(RANK_BADGE);
    expect(html).toContain("Rookie Scout 🥉");
    expect(html).toContain(STAT_BOX);
    expect(html).toContain("Played");
    expect(html).toContain("Win %");
    expect(html).toContain("Current Streak 🔥");
    expect(html).toContain("Max Streak ⚡");
    expect(html).toContain("2.5 / 5");
    expect(html).toContain("1 Arena");
    expect(html).toContain("5 Climax");
    expect(html).toContain("⚽ Football 2");
    expect(html).toContain("🏒 Hockey 0");
    expect(html).toContain("🔴 Liverpool");
    expect(html).toContain("3,400 PTS");
    expect(html).toContain('aria-label="Scout Dossier"');
  });

  it("renders nothing while closed", () => {
    const html = renderToStaticMarkup(createElement(StatsModal, { open: false, onClose: () => undefined }));
    expect(html).toBe("");
  });
});
