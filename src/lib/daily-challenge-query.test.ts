import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fetchDailyChallengeRow, type ChallengeRow, type DailyChallengeClient } from "./daily-challenge-query";

function clientFor(rows: ChallengeRow[]): DailyChallengeClient & { calls: number } {
  const api = {
    calls: 0,
    from() {
      api.calls += 1;
      const filters: [string, string][] = [];
      let newestFirst = false;
      const chain = {
        select() {
          return chain;
        },
        eq(column: string, value: string) {
          filters.push([column, value]);
          return chain;
        },
        order(_column: string, options: { ascending: boolean }) {
          newestFirst = options.ascending === false;
          return chain;
        },
        limit() {
          return chain;
        },
        async maybeSingle() {
          let list = rows.filter((row) => filters.every(([column, value]) => row[column] === value));
          if (newestFirst) {
            list = [...list].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
          }
          return { data: list[0] ?? null, error: null };
        },
      };
      return chain;
    },
  };
  return api;
}

describe("fetchDailyChallengeRow", () => {
  const today = "2026-09-27";

  it("uses the newest challenge scheduled for today", async () => {
    const supabase = clientFor([
      { id: "older", fixture_date: today, created_at: "2026-09-27T01:00:00.000Z" },
      { id: "newer", fixture_date: today, created_at: "2026-09-27T18:00:00.000Z" },
      { id: "other-day", fixture_date: "2026-09-26", created_at: "2026-09-27T20:00:00.000Z" },
    ]);
    const row = await fetchDailyChallengeRow(supabase, today);
    expect(row?.id).toBe("newer");
    expect(supabase.calls).toBe(1);
  });

  it("falls back to the most recently created challenge when today has no row", async () => {
    const supabase = clientFor([
      { id: "old", fixture_date: "2020-01-01", created_at: "2020-01-01T00:00:00.000Z" },
      { id: "latest", fixture_date: "2024-06-01", created_at: "2026-09-26T12:00:00.000Z" },
    ]);
    const row = await fetchDailyChallengeRow(supabase, today);
    expect(row?.id).toBe("latest");
    expect(supabase.calls).toBe(3);
  });

  it("keeps a date_key match before the global latest row", async () => {
    const supabase = clientFor([
      { id: "scheduled", date_key: today, created_at: "2026-09-20T00:00:00.000Z" },
      { id: "newer-other", fixture_date: "2026-01-01", created_at: "2026-09-27T22:00:00.000Z" },
    ]);
    const row = await fetchDailyChallengeRow(supabase, today);
    expect(row?.id).toBe("scheduled");
  });

  it("leaves past dates alone when that day has no challenge", async () => {
    const supabase = clientFor([{ id: "latest", created_at: "2026-09-27T22:00:00.000Z" }]);
    const row = await fetchDailyChallengeRow(supabase, "2024-01-01", { allowLatestFallback: false });
    expect(row).toBeNull();
  });
});

describe("home route cache", () => {
  it("forces the daily page to render on each request", () => {
    const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    expect(source).toContain("export const dynamic = 'force-dynamic';");
    expect(source).toContain("export const revalidate = 0;");
    expect(source).toContain("loadTodayPublicDrop");
  });
});
