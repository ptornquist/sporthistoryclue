import { describe, expect, it, vi } from "vitest";

const { from } = vi.hoisted(() => {
  const from = vi.fn(() => {
    const filters: Record<string, string> = {};
    const query = {
      select() {
        return query;
      },
      eq(column: string, value: string) {
        filters[column] = value;
        return query;
      },
      order() {
        return query;
      },
      limit() {
        return query;
      },
      async maybeSingle() {
        return { data: null, error: null };
      },
    };
    return query;
  });
  return { from };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: null }));
vi.mock("@/lib/supabase/server", () => ({
  isSupabaseConfigured: true,
  createPublicSupabaseClient: () => ({ from }),
  createServerSupabaseClient: async () => ({ from }),
}));

import { loadDatedPublicDrop } from "./daily-drop";

describe("loadDatedPublicDrop", () => {
  it("returns null for a past date with no stored challenge instead of a random catalog fixture", async () => {
    // 1 november 2020 is a past date with no row in the mocked table.
    await expect(loadDatedPublicDrop("2020-11-01")).resolves.toBeNull();
  });
});
