import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArchiveVault } from "@/components/archive/ArchiveVault";
import {
  fetchArchiveFixtures,
  formatVaultDate,
  parseSolvedHistory,
  publishVaultRows,
  solvedBadge,
  solvedScore,
  sportMatchesFilter,
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
    expect(formatVaultDate(rows[0].fixtureDate)).toBe("Sep 26, 2026");
    expect(sportMatchesFilter(rows[0].sport, "Football")).toBe(true);
    expect(sportMatchesFilter(rows[1].sport, "Ice Hockey")).toBe(true);
    expect(publishVaultRows([{ id: "", fixture_date: "2026-09-01" }], today)).toEqual([]);
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
    expect(archive).not.toContain("ArchiveMonth");
    expect(archive).not.toContain("DailyCalendar");

    const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    expect(home).toContain("loadPublicChallengeById");
    expect(home).toContain("loadDatedPublicDrop");
    expect(home).toContain("archiveId");
  });

  it("renders the vault header, sport filters, and a dossier link", () => {
    const html = renderToStaticMarkup(
      createElement(ArchiveVault, {
        fixtures: [
          { id: "miracle", sport: "ice hockey", fixtureDate: "2026-09-28", year: 1980 },
        ],
      }),
    );
    expect(html).toContain("HISTORICAL VAULT");
    expect(html).toContain("Missed a match? Revisit and deduce classified sporting moments from the vault.");
    expect(html).toContain("All Sports");
    expect(html).toContain("Ice Hockey");
    expect(html).toContain("🏒");
    expect(html).toContain("1980");
    expect(html).toContain("Sep 28, 2026");
    expect(html).toContain("PLAY DOSSIER →");
    expect(html).toContain('href="/?date=2026-09-28"');
    expect(html).toContain("border-[2.5px] border-zinc-900 rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-y-[-2px] transition-all");
  });
});
