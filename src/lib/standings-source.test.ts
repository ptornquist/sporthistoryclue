import { describe, expect, it } from "vitest";
import { isStandingRow, loadStandingsRows, mapProfile, type ProfileRow, type StandingsClient } from "./standings-source";

function fakeClient(all: ProfileRow[], week: ProfileRow[], failWide = false): StandingsClient {
  const result = (rows: ProfileRow[], error = false) =>
    Promise.resolve({ data: error ? null : rows, error: error ? { message: "missing column" } : null });
  return {
    from: () => ({
      select: (columns: string) => {
        const wide = columns.includes("week_score");
        return {
          order: () => ({ limit: () => result(all, failWide && wide) }),
          eq: () => ({ order: () => ({ limit: () => result(week) }) }),
        };
      },
    }),
  };
}

const row = (id: string, total: number, extra: Partial<ProfileRow> = {}): ProfileRow => ({
  id,
  username: id,
  total_score: total,
  streak: 0,
  equipped_title: null,
  equipped_frame: null,
  matches_solved: 0,
  avatar_url: null,
  ...extra,
});

describe("standings source", () => {
  it("lists every profile, not only the viewer, and merges this week's scorers", async () => {
    const all = [row("anna", 5000), row("bo", 1200), row("cia", 0)];
    const week = [row("dan", 300, { week_score: 300, week_start: "2026-10-12" })];
    const snapshot = await loadStandingsRows(fakeClient(all, week), "2026-10-12");
    expect(snapshot.weekly).toBe(true);
    expect(snapshot.rows.map((r) => r.username)).toEqual(["anna", "bo", "cia", "dan"]);
  });

  it("falls back to the all-time columns when the weekly columns are missing", async () => {
    const snapshot = await loadStandingsRows(fakeClient([row("anna", 5000)], [], true), "2026-10-12");
    expect(snapshot.weekly).toBe(false);
    expect(snapshot.rows).toHaveLength(1);
  });

  it("normalises a profile row and validates route payloads", () => {
    const mapped = mapProfile(row("@eva", 10, { username: "@eva", total_score: null }));
    expect(mapped.username).toBe("eva");
    expect(mapped.total_score).toBe(0);
    expect(isStandingRow(mapped)).toBe(true);
    expect(isStandingRow({ id: "x" })).toBe(false);
  });
});
