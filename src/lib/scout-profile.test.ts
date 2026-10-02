import { describe, expect, it } from "vitest";
import {
  cleanScoutHandle,
  formatCareerPoints,
  loadPublicScout,
  loadScoutActions,
  scoutProfilePath,
} from "./scout-profile";

describe("public scout profiles", () => {
  it("decodes a handle and formats career points", () => {
    expect(cleanScoutHandle("%40Ada")).toBe("Ada");
    expect(cleanScoutHandle("@beau")).toBe("beau");
    expect(scoutProfilePath("@Ada")).toBe("/scout/Ada");
    expect(formatCareerPoints(14000)).toBe("14,000 PTS");
  });

  it("loads a profile stored with a leading @ and its honours", async () => {
    const lookups: string[] = [];
    const supabase = {
      from(table: string) {
        return {
          select() {
            return {
              ilike(_column: string, value: string) {
                lookups.push(value);
                const stored = value === "@ada" ? { id: "p1", username: "@ada", career_score: 14000, fixtures_cleared: 6, created_at: "2026-01-01" } : null;
                return { maybeSingle: async () => ({ data: stored, error: null }) };
              },
              eq() {
                expect(table).toBe("user_badges");
                return Promise.resolve({
                  data: [
                    { badge_id: "archive_lantern", unlocked_at: "2026-02-01" },
                    { badge_id: "rookie_pin", unlocked_at: "2026-01-02" },
                  ],
                  error: null,
                });
              },
            };
          },
        };
      },
    };

    const loaded = await loadPublicScout(supabase, "%40ada");
    expect(lookups).toEqual(["ada", "@ada"]);
    expect(loaded?.profile.career_score).toBe(14000);
    expect(loaded?.badges.map((badge) => badge.name)).toEqual(["ROOKIE PIN", "ARCHIVE LANTERN"]);
  });

  it("hides challenge actions on your own profile", async () => {
    const supabase = {
      auth: { getUser: async () => ({ data: { user: { id: "me" } } }) },
      from() {
        return {
          select() {
            const chain = {
              eq() {
                return chain;
              },
              maybeSingle: async () => ({ data: { username: "@Ada", career_score: 10 }, error: null }),
            };
            return chain;
          },
        };
      },
    };
    const own = await loadScoutActions(supabase, "me", "ada");
    expect(own.showActions).toBe(false);

    const guest = await loadScoutActions(
      { auth: { getUser: async () => ({ data: { user: null } }) }, from() { return { select() { return {}; } }; } },
      "other",
      "ada",
    );
    expect(guest.showActions).toBe(true);
    expect(guest.viewerId).toBeNull();
  });

  it("reads scout_follows when viewing another scout", async () => {
    const tables: string[] = [];
    const supabase = {
      auth: { getUser: async () => ({ data: { user: { id: "me" } } }) },
      from(table: string) {
        tables.push(table);
        return {
          select() {
            const chain = {
              eq() {
                return chain;
              },
              maybeSingle: async () => ({
                data: table === "profiles"
                  ? { username: "beau", career_score: 20 }
                  : { following_id: "them" },
                error: null,
              }),
            };
            return chain;
          },
        };
      },
    };

    const state = await loadScoutActions(supabase, "them", "ada");
    expect(tables).toContain("scout_follows");
    expect(state.following).toBe(true);
    expect(state.showActions).toBe(true);
  });
});
