import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArchiveVault } from "@/components/archive/ArchiveVault";
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

    const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    expect(home).toContain("loadPublicChallengeById");
    expect(home).toContain("loadDatedPublicDrop");
    expect(home).toContain("archiveId");
  });

  it("renders a chronological daily drop feed without sport filters", () => {
    const html = renderToStaticMarkup(
      createElement(ArchiveVault, {
        fixtures: [
          { id: "newer", sport: "football", fixtureDate: "2026-09-26", year: 1986 },
          { id: "older", sport: "ice hockey", fixtureDate: "2026-09-20", year: 1980 },
        ],
      }),
    );
    expect(html).toContain("DAILY DROP ARCHIVE");
    expect(html).toContain("Play previous daily matches and catch up on your streak.");
    expect(html).not.toContain("All Sports");
    expect(html).not.toContain("HISTORICAL VAULT");
    expect(html).toContain("DROP #20722 · 2026-09-26");
    expect(html).toContain("DROP #20716 · 2026-09-20");
    expect(html.indexOf("2026-09-26")).toBeLessThan(html.indexOf("2026-09-20"));
    expect(html).toContain("⚽ Football");
    expect(html).toContain("🏒 Ice Hockey");
    expect(html).toContain("PLAY DROP →");
    expect(html).toContain('href="/?date=2026-09-26"');
    expect(html).toContain("border-[2.5px] border-zinc-900 rounded-2xl p-4 bg-white shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] mb-3");
  });
});
