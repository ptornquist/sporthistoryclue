import { describe, expect, it } from "vitest";
import {
  awardDirectly,
  careerOf,
  clampPoints,
  coinsFor,
  nextProfileValues,
  safeStreak,
  type AwardClient,
  type ProfileValues,
  type SolveInput,
} from "./solve-award";

const input: SolveInput = {
  userId: "u1",
  matchId: "kluring-2026-10-15",
  pointScore: 10000,
  isDaily: true,
  streakContinued: true,
  duelWon: false,
  newStreak: 3,
  sport: "ice_hockey",
  today: "2026-10-15",
};

interface Options {
  /** Existing profiles rows by id. */
  profiles?: Record<string, ProfileValues>;
  /** Whether coin_grants exists; the set holds already granted "user:match" keys. */
  grants?: Set<string> | null;
  /** Simulates the guard trigger: score columns never change on update. */
  guarded?: boolean;
}

function fakeClient(options: Options = {}) {
  const profiles = new Map(Object.entries(options.profiles ?? {}));
  const grants = options.grants === undefined ? new Set<string>() : options.grants;
  const writes: Array<{ table: string; values: ProfileValues }> = [];
  const ok = (data: unknown = null) => Promise.resolve({ data, error: null });

  const client = {
    from(table: string) {
      return {
        select: () => ({
          eq: (_column: string, id: string) => ({
            maybeSingle: () => ok(profiles.get(id) ?? null),
            then: (...args: Parameters<Promise<unknown>["then"]>) => ok([]).then(...args),
          }),
        }),
        insert: (values: ProfileValues) => {
          writes.push({ table, values });
          if (table === "coin_grants") {
            if (!grants) return Promise.resolve({ data: null, error: { message: "relation coin_grants does not exist", code: "42P01" } });
            const key = `${values.user_id}:${values.match_id}`;
            if (grants.has(key)) return Promise.resolve({ data: null, error: { message: "duplicate key", code: "23505" } });
            grants.add(key);
            return ok();
          }
          if (table === "profiles") {
            profiles.set(String(values.id), { ...values, total_score: 0, streak: 0, best_streak: 0, coins: 0, matches_solved: 0 });
          }
          return ok();
        },
        update: (values: ProfileValues) => ({
          eq: (_column: string, id: string) => {
            writes.push({ table, values });
            const row = profiles.get(id);
            if (row) {
              const next = { ...row, ...values };
              if (options.guarded) {
                for (const key of ["total_score", "career_score", "matches_solved", "best_streak", "coins"]) {
                  if (key in row) next[key] = row[key];
                }
              }
              profiles.set(id, next);
            }
            return ok();
          },
        }),
      };
    },
  } as unknown as AwardClient;

  return { client, profiles, writes };
}

describe("solve award", () => {
  it("adds the points to whichever career column the row has", () => {
    const patch = nextProfileValues({ total_score: 47000, career_score: 0, streak: 2, best_streak: 2, coins: 10, matches_solved: 4 }, input, 150);
    expect(patch.total_score).toBe(57000);
    expect(patch.career_score).toBe(10000);
    expect(patch.matches_solved).toBe(5);
    expect(patch.streak).toBe(3);
    expect(patch.best_streak).toBe(3);
    expect(patch.coins).toBe(160);
    expect("week_score" in patch).toBe(false);
  });

  it("writes total_score when the row has no career column at all", () => {
    expect(nextProfileValues({ id: "u1", username: "x" }, input, 0)).toEqual({ total_score: 10000 });
  });

  it("keeps the weekly and sport boards in step with the RPC", () => {
    const row = { total_score: 0, week_score: 500, week_start: "2026-10-12", hockey_score: 100, football_score: 0, international_score: 0, player_level: 1 };
    const patch = nextProfileValues(row, input, 0);
    expect(patch.week_score).toBe(10500);
    expect(patch.week_start).toBe("2026-10-12");
    expect(patch.hockey_score).toBe(10100);
    expect(patch.football_score).toBeUndefined();
    expect(patch.player_level).toBe(Math.floor(Math.sqrt(10000 / 200)));
    expect(nextProfileValues({ ...row, week_start: "2026-10-05" }, input, 0).week_score).toBe(10000);
  });

  it("caps the streak one above the saved value and clamps points", () => {
    expect(safeStreak({ streak: 1 }, 9)).toBe(2);
    expect(safeStreak({ streak: 5 }, 3)).toBe(3);
    expect(clampPoints(250000)).toBe(10000);
    expect(clampPoints(-5)).toBe(0);
    expect(coinsFor({ streak: 0 }, input)).toBe(100);
    expect(coinsFor({ streak: 2 }, input)).toBe(150);
    expect(careerOf({ total_score: 0, career_score: 300 })).toBe(300);
  });

  it("saves 10 000 points straight to the profile row", async () => {
    const { client, profiles } = fakeClient({ profiles: { u1: { id: "u1", total_score: 47000, streak: 2, best_streak: 2, coins: 0, matches_solved: 4 } } });
    const result = await awardDirectly(client, input);
    expect(result.saved).toBe(true);
    expect(profiles.get("u1")?.total_score).toBe(57000);
    expect(profiles.get("u1")?.matches_solved).toBe(5);
    if (result.saved) expect(result.earned).toBe(150);
  });

  it("creates the profile row first when the scout has none", async () => {
    const { client, profiles } = fakeClient();
    const result = await awardDirectly(client, input, "peter");
    expect(result.saved).toBe(true);
    expect(profiles.get("u1")?.username).toBe("peter");
    expect(profiles.get("u1")?.total_score).toBe(10000);
  });

  it("never pays the same match twice", async () => {
    const { client, profiles } = fakeClient({ profiles: { u1: { id: "u1", total_score: 0, streak: 0 } } });
    await awardDirectly(client, input);
    const again = await awardDirectly(client, input);
    expect(again).toMatchObject({ saved: true, duplicate: true, earned: 0 });
    expect(profiles.get("u1")?.total_score).toBe(10000);
  });

  it("still saves when coin_grants is missing", async () => {
    const { client, profiles } = fakeClient({ grants: null, profiles: { u1: { id: "u1", total_score: 0 } } });
    const result = await awardDirectly(client, input);
    expect(result.saved).toBe(true);
    expect(profiles.get("u1")?.total_score).toBe(10000);
  });

  it("reports when the guard trigger swallowed the write", async () => {
    const { client } = fakeClient({ guarded: true, profiles: { u1: { id: "u1", total_score: 0 } } });
    const result = await awardDirectly(client, input);
    expect(result).toMatchObject({ saved: false, reason: "guard" });
  });
});
