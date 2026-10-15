import { describe, expect, it } from "vitest";
import {
  isStandingRow,
  loadStandingsRows,
  mapProfile,
  scoreOf,
  solvedOf,
  sortByScore,
  type ProfileRow,
  type StandingsClient,
} from "./standings-source";

interface Options {
  /** Columns the fake database knows. Ordering by anything else fails like Postgres would. */
  columns: string[];
  /** Solved-match rows. Undefined means the match_history table is missing. */
  history?: Array<{ user_id: string; score: number }>;
}

const DEFAULTS: Options = { columns: ["total_score", "week_score", "week_start"], history: [] };

function fakeClient(rows: ProfileRow[], options: Options = DEFAULTS) {
  const calls: string[] = [];
  const ok = (data: unknown[]) => Promise.resolve({ data, error: null });
  const missing = (what: string) =>
    Promise.resolve({ data: null, error: { message: `${what} does not exist`, code: "42703" } });
  const selected = (subset: ProfileRow[]) => {
    const chain = {
      order(column: string) {
        calls.push(`order:${column}`);
        const known = options.columns.includes(column);
        return { limit: () => (known ? ok(subset) : missing(`column profiles.${column}`)) };
      },
      limit: () => {
        calls.push("limit");
        return ok(subset);
      },
      eq(column: string, value: string) {
        calls.push(`eq:${column}`);
        return selected(subset.filter((row) => (row as unknown as Record<string, unknown>)[column] === value));
      },
      then: (...args: Parameters<Promise<unknown>["then"]>) => ok(subset).then(...args),
    };
    return chain;
  };
  const history = () => ({
    select: () => ({
      limit: () => {
        calls.push("history");
        return options.history ? ok(options.history) : missing("relation match_history");
      },
    }),
  });
  const client = {
    from: (table: string) => (table === "match_history" ? history() : { select: () => selected(rows) }),
  } as unknown as StandingsClient;
  return { client, calls };
}

const row = (id: string, extra: Partial<ProfileRow> = {}): ProfileRow => ({ id, username: id, ...extra });

describe("standings source", () => {
  it("lists every profile, keeps 0-point scouts, and sorts highest score first", async () => {
    const rows = [row("bo", { total_score: 1200 }), row("cia", { total_score: 0 }), row("anna", { total_score: 5000 })];
    const { client, calls } = fakeClient(rows);
    const snapshot = await loadStandingsRows(client, "2026-10-12");
    expect(snapshot.scoreColumn).toBe("total_score");
    expect(snapshot.rows.map((r) => [r.username, r.total_score])).toEqual([["anna", 5000], ["bo", 1200], ["cia", 0]]);
    expect(calls[0]).toBe("order:total_score");
  });

  it("reads career_score when the database has no total_score column", async () => {
    const rows = [row("eva", { career_score: 300 }), row("dan", { career_score: 900 })];
    const { client, calls } = fakeClient(rows, { columns: ["career_score"], history: [] });
    const snapshot = await loadStandingsRows(client, "2026-10-12");
    expect(snapshot.scoreColumn).toBe("career_score");
    expect(snapshot.weekly).toBe(false);
    expect(snapshot.rows.map((r) => [r.username, r.total_score])).toEqual([["dan", 900], ["eva", 300]]);
    expect(calls.slice(0, 2)).toEqual(["order:total_score", "order:career_score"]);
  });

  it("still lists everyone when neither score column can be ordered", async () => {
    const { client } = fakeClient([row("x"), row("y")], { columns: [] });
    const snapshot = await loadStandingsRows(client, "2026-10-12");
    expect(snapshot.scoreColumn).toBeNull();
    expect(snapshot.history).toBe(false);
    expect(snapshot.rows).toHaveLength(2);
  });

  it("shows the solved-match total when the profiles score column was never updated", async () => {
    const rows = [row("peter", { total_score: 0 }), row("anna", { total_score: 4000 }), row("nyx", { total_score: 0 })];
    const history = [
      { user_id: "peter", score: 30000 },
      { user_id: "peter", score: 27000 },
      { user_id: "anna", score: 1000 },
    ];
    const snapshot = await loadStandingsRows(fakeClient(rows, { ...DEFAULTS, history }).client, "2026-10-12");
    expect(snapshot.history).toBe(true);
    expect(snapshot.rows.map((r) => [r.username, r.total_score, r.matches_solved])).toEqual([
      ["peter", 57000, 2],
      ["anna", 4000, 1],
      ["nyx", 0, 0],
    ]);
  });

  it("merges this week's scorers when the weekly columns exist", async () => {
    const rows = [
      row("anna", { total_score: 5000, week_score: 0, week_start: null }),
      row("dan", { total_score: 50, week_score: 300, week_start: "2026-10-12" }),
    ];
    const snapshot = await loadStandingsRows(fakeClient(rows).client, "2026-10-12");
    expect(snapshot.weekly).toBe(true);
    expect(snapshot.rows.find((r) => r.id === "dan")?.week_score).toBe(300);
  });

  it("takes the score from whichever column holds the saved points", () => {
    expect(scoreOf({ total_score: 0, career_score: 4200 })).toBe(4200);
    expect(scoreOf({ total_score: 800, career_score: null })).toBe(800);
    expect(scoreOf({ total_score: "150" })).toBe(150);
    expect(scoreOf({})).toBe(0);
    expect(solvedOf({ matches_solved: 0, fixtures_cleared: 7 })).toBe(7);
  });

  it("normalises a profile row and validates route payloads", () => {
    const mapped = mapProfile(row("@eva", { username: "@eva", total_score: null, display_name: "Eva" }));
    expect(mapped.username).toBe("eva");
    expect(mapped.total_score).toBe(0);
    expect(isStandingRow(mapped)).toBe(true);
    expect(isStandingRow({ id: "x" })).toBe(false);
    expect(mapProfile(row("id", { username: null, display_name: "Dan" })).username).toBe("Dan");
    expect(sortByScore([mapped, mapProfile(row("z", { total_score: 5 }))])[0]?.id).toBe("z");
  });
});
