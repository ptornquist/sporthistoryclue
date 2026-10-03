import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/standings",
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: false,
  supabaseClient: {
    auth: { getUser: async () => ({ data: { user: null } }) },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null }) }),
      }),
    }),
  },
}));

vi.mock("@/lib/career-standings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/career-standings")>("@/lib/career-standings");
  return {
    ...actual,
    fetchCareerStandings: async () => [],
  };
});

vi.mock("@/lib/supabase/network", () => ({
  getFollowingIds: async () => [],
}));

import { ClubChampionshipBoard, ClubLeagueTabs, StandingsBoard } from "./page";

describe("StandingsBoard", () => {
  it("shows podium cards and the full table when profiles exist, including zero scores", () => {
    const html = renderToStaticMarkup(
      createElement(StandingsBoard, {
        rows: [
          { id: "a", username: "ada", career_score: 0, fixtures_cleared: 0 },
          { id: "b", username: "beau", career_score: 0, fixtures_cleared: 1 },
        ],
      }),
    );
    expect(html).toContain("@ada");
    expect(html).toContain("@beau");
    expect(html).toContain('href="/scout/ada"');
    expect(html).toContain('href="/scout/beau"');
    expect(html).toContain("<table");
    expect(html).toContain("Ledare");
    expect(html).not.toContain("No career scores yet");
  });

  it("offers the club championship tab and ranks Klubbligan by poäng", async () => {
    const { default: StandingsPage } = await import("./page");
    const page = renderToStaticMarkup(createElement(StandingsPage));
    expect(page).toContain("🌐 GLOBALA SCOUTER");
    expect(page).toContain("🏒 HOCKEYLIGAN");
    expect(page).toContain("⚽ FOTBOLLSLIGAN");
    expect(page).toContain('href="/archive"');

    const tabs = renderToStaticMarkup(
      createElement(ClubLeagueTabs, { league: "hockey", onLeague: () => undefined }),
    );
    expect(tabs).toContain("🏒 HOCKEYLIGAN");
    expect(tabs).toContain("⚽ FOTBOLLSLIGAN");
    expect(tabs).toContain('aria-selected="true"');

    const board = renderToStaticMarkup(
      createElement(ClubChampionshipBoard, {
        rows: [
          { club: "Djurgården", points: 4000, scouts: 1 },
          { club: "AIK", points: 1500, scouts: 2 },
        ],
      }),
    );
    expect(board).toContain("Klubbligan");
    expect(board).toContain("Poäng");
    expect(board).toContain("Djurgården");
    expect(board.indexOf("Djurgården")).toBeLessThan(board.indexOf(">AIK<"));
  });
});
