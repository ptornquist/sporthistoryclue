import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArchiveVault } from "@/components/archive/ArchiveVault";
import {
  ARCHIVE_WEEKDAYS,
  MONTH_ARROW_CLASS,
  STATS_CLASS,
  TILE_CLASS,
  TILE_FUTURE,
  TILE_SOLVED,
  TILE_TODAY,
  TILE_UNPLAYED,
  WEEKDAY_CLASS,
  archiveStats,
  buildArchiveMonth,
  tileClass,
} from "./archive-month";
import {
  dropNumber,
  fetchArchiveFixtures,
  parseSolvedHistory,
  publishVaultRows,
  solvedBadge,
  solvedScore,
} from "./archive-vault";

const today = "2026-09-27";

describe("archive vault fixtures", () => {
  it("lists released challenges by fixture date and leaves the title off the client row", async () => {
    const supabase = {
      from(table: string) {
        expect(table).toBe("challenges");
        return {
          select(columns: string) {
            expect(columns).toBe("id, title, sport, fixture_date, year");
            return {
              async order(column: string, options: { ascending: boolean }) {
                expect(column).toBe("fixture_date");
                expect(options.ascending).toBe(false);
                return {
                  data: [
                    { id: "older", title: "Secret older final", sport: "ice hockey", fixture_date: "2026-09-20", year: 1980 },
                    { id: "future", title: "Not yet", sport: "football", fixture_date: "2026-10-01", year: 1990 },
                    { id: "newer", title: "Secret newer final", sport: "football", fixture_date: "2026-09-26", year: 1986 },
                  ],
                  error: null,
                };
              },
            };
          },
        };
      },
    };

    const rows = await fetchArchiveFixtures(supabase, today);
    expect(rows.map((row) => row.id)).toEqual(["newer", "older"]);
    expect(rows[0]).not.toHaveProperty("title");
    expect(dropNumber("2026-09-20")).toBe(20716);
    expect(publishVaultRows([{ id: "", fixture_date: "2026-09-01" }], today)).toEqual([]);
    expect(publishVaultRows([{ id: "future", fixture_date: "2026-10-01", sport: "football" }], today)).toEqual([]);
  });

  it("reads solved challenge ids and scores from shc_solved_history", () => {
    const history = parseSolvedHistory(
      JSON.stringify([
        { id: "newer", score: 8500 },
        "2026-09-20",
      ]),
    );
    expect(solvedScore({ id: "newer", fixtureDate: "2026-09-26" }, history)).toBe(8500);
    expect(solvedBadge(8500)).toBe("SOLVED · 8,500 PTS ✓");
    expect(solvedScore({ id: "older", fixtureDate: "2026-09-20" }, history)).toBeNull();
    expect(solvedBadge(null)).toBe("SOLVED ✓");
    expect(solvedScore({ id: "open", fixtureDate: "2026-09-01" }, history)).toBeUndefined();
  });
});

describe("archive routes", () => {
  it("keeps the vault uncached and deep-links a date or id into the arena", () => {
    const archive = readFileSync(new URL("../app/archive/page.tsx", import.meta.url), "utf8");
    expect(archive).toContain("export const dynamic = 'force-dynamic';");
    expect(archive).toContain("export const revalidate = 0;");
    expect(archive).toContain("loadArchiveIndex");
    expect(archive).toContain("utcTodayKey");
    expect(archive).toContain("todayKey={utcTodayKey()}");

    const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    expect(home).toContain("loadPublicChallengeById");
    expect(home).toContain("loadDatedPublicDrop");
    expect(home).toContain("archiveId");
  });

  it("renders a month calendar with playable past drops and locked future days", () => {
    const fixtures = [
      { id: "newer", sport: "football", fixtureDate: "2026-09-26", year: 1986 },
      { id: "older", sport: "ice hockey", fixtureDate: "2026-09-20", year: 1980 },
    ];
    const html = renderToStaticMarkup(
      createElement(ArchiveVault, {
        fixtures,
        todayKey: "2026-09-27",
      }),
    );
    expect(html).toContain("DAILY DROP ARCHIVE");
    expect(html).toContain("September 2026");
    expect(html).not.toContain("All Sports");
    expect(html).not.toContain("HISTORICAL VAULT");
    expect(html).toContain(MONTH_ARROW_CLASS);
    expect(html).toContain(WEEKDAY_CLASS);
    for (const weekday of ARCHIVE_WEEKDAYS) expect(html).toContain(weekday);
    expect(html).toContain(STATS_CLASS);
    expect(html).toContain("📅 Total Drops Available");
    expect(html).toContain("✅ Solved Count");
    expect(html).toContain("🔥 Active Streak");
    expect(html).toContain(TILE_UNPLAYED);
    expect(html).toContain(TILE_TODAY);
    expect(html).toContain(TILE_FUTURE);
    expect(html).toContain("TODAY");
    expect(html).toContain("🔒");
    expect(html).toContain("⚽");
    expect(html).toContain("🏒");
    expect(html).toContain("PLAY DROP →");
    expect(html).toContain('href="/?date=2026-09-01"');
    expect(html).toContain('href="/?date=2026-09-26"');
    expect(html).toContain('href="/?date=2026-09-20"');
    expect(html).toContain('href="/?date=2026-09-27"');
    expect(html).toContain("disabled");

    const solved = buildArchiveMonth(2026, 8, "2026-09-27", fixtures, {
      dates: new Set(["2026-09-20"]),
      ids: new Set(["newer"]),
    });
    const day = (dateKey: string) => solved.cells.find((cell) => cell.kind === "day" && cell.dateKey === dateKey);
    expect(solved.label).toBe("September 2026");
    expect(solved.cells[0]).toEqual({ kind: "pad" });
    expect(day("2026-09-01")).toMatchObject({ state: "unplayed", icon: "⚽", href: "/?date=2026-09-01" });
    expect(day("2026-09-02")).toMatchObject({ state: "unplayed", icon: "🏒", href: "/?date=2026-09-02" });
    expect(day("2026-09-03")).toMatchObject({ state: "unplayed", icon: "🥊", href: "/?date=2026-09-03" });
    expect(day("2026-09-04")).toMatchObject({ state: "unplayed", icon: "🎾", href: "/?date=2026-09-04" });
    expect(day("2026-09-05")).toMatchObject({ state: "unplayed", icon: "🏃", href: "/?date=2026-09-05" });
    expect(day("2026-09-20")).toMatchObject({ state: "solved", icon: "🏒", href: "/?date=2026-09-20" });
    expect(day("2026-09-26")).toMatchObject({ state: "solved", icon: "⚽", href: "/?date=2026-09-26" });
    expect(day("2026-09-27")).toMatchObject({ state: "today", href: "/?date=2026-09-27" });
    expect(day("2026-09-28")).toMatchObject({ state: "future", href: null });
    expect(solved.cells.some((cell) => cell.kind === "day" && cell.dateKey === "2026-09-30")).toBe(true);
    expect(
      archiveStats(2026, 8, "2026-09-27", fixtures, { dates: new Set(["2026-09-20"]), ids: new Set(["newer"]) }),
    ).toEqual({
      total: 27,
      solved: 2,
      streak: 1,
    });
    expect(tileClass("solved")).toBe(`${TILE_CLASS} ${TILE_SOLVED}`);
    expect(tileClass("unplayed")).toBe(`${TILE_CLASS} ${TILE_UNPLAYED}`);
    expect(tileClass("today")).toBe(`${TILE_CLASS} ${TILE_TODAY}`);
    expect(tileClass("future")).toBe(`${TILE_CLASS} ${TILE_FUTURE}`);
  });
});
