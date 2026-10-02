import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchDailyChallengeRow,
  readStoredChallenge,
  resolveGuessOptions,
  type ChallengeRow,
  type DailyChallengeClient,
} from "./daily-challenge-query";

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("logs the fixture_date query and any Supabase error", async () => {
    const logged: unknown[][] = [];
    const errors: unknown[][] = [];
    vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      logged.push(args);
    });
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args);
    });
    const row = { id: "today", fixture_date: today, created_at: "2026-09-27T12:00:00.000Z", title: "Stored final" };
    const supabase = clientFor([row]);
    const loaded = await fetchDailyChallengeRow(supabase, today);
    expect(loaded?.id).toBe("today");
    expect(logged[0]).toEqual(["Fetching fixture for date:", today]);
    expect(logged.some((line) => line[0] === "Active challenge loaded from Supabase:" && line[1] === row)).toBe(true);
    expect(errors).toEqual([]);
  });
});

describe("stored challenge fields", () => {
  it("uses tactical clues and the row options without generated decoys", () => {
    const stored = readStoredChallenge({
      title: "World Cup Final",
      tactical_clues: ["The crowd is already standing.", "A left foot changes the tie."],
      options: [
        "1986 World Cup: Argentina vs England",
        "1970 World Cup: Brazil vs Italy",
        "1966 World Cup: England vs West Germany",
        "1974 World Cup: Netherlands vs West Germany",
      ],
      image_url: "https://cdn.example.com/final.jpg",
    });
    expect(stored.clues).toEqual(["The crowd is already standing.", "A left foot changes the tie."]);
    expect(stored.title).toBe("World Cup Final");
    expect(stored.imageUrl).toBe("https://cdn.example.com/final.jpg");
    const generated = ["1986 World Cup: Argentina vs England", "1990 World Cup: Argentina vs Italy"];
    expect(resolveGuessOptions(stored.options, generated, true)).toEqual(stored.options);
    expect(resolveGuessOptions(stored.options, generated, true).join(" ")).not.toMatch(/1990 World Cup: Argentina vs Italy/);
  });

  it("ignores a non-https image and falls back to generated options when none are stored", () => {
    const stored = readStoredChallenge({ image_url: "/local/secret.jpg", clues: ["A cold rink."] });
    expect(stored.imageUrl).toBe("");
    expect(stored.clues).toEqual(["A cold rink."]);
    expect(resolveGuessOptions(stored.options, ["1972 Summit Series: Canada vs Soviet Union"], false)).toEqual([
      "1972 Summit Series: Canada vs Soviet Union",
    ]);
  });
});

describe("home route cache", () => {
  it("forces the daily page to render on each request", () => {
    const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    expect(source).toContain("export const dynamic = 'force-dynamic';");
    expect(source).toContain("export const revalidate = 0;");
    expect(source).toContain("loadTodayPublicDrop");
    expect(source).toContain("console.log('Fetching fixture for date:', today);");
    expect(source).toContain("console.log('Active challenge loaded from Supabase:', todayDrop);");
    const drop = readFileSync(new URL("../lib/daily-drop.ts", import.meta.url), "utf8");
    expect(drop).toContain("resolveGuessOptions");
    expect(drop).toContain("if (fixture.optionsLocked && fixture.options.length > 0)");
    expect(drop).not.toContain("imageUrl: stored.imageUrl");
  });
});

describe("challenge query logging", () => {
  it("records the fixture query, the error, and the loaded row", () => {
    const source = readFileSync(new URL("./daily-challenge-query.ts", import.meta.url), "utf8");
    expect(source).toContain('console.log("Fetching fixture for date:", today);');
    expect(source).toContain('console.error("Supabase query error:", dated.error);');
    expect(source).toContain('console.log("Active challenge loaded from Supabase:", dated.data);');
  });
});
