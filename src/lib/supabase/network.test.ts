import { beforeEach, describe, expect, it } from "vitest";
import {
  FOLLOW_COLUMNS,
  followScout,
  getFollowingIds,
  isMissingTable,
  resetFollowTable,
  unfollowScout,
  type FollowClient,
  type FollowTable,
} from "./network";

interface Call {
  table: FollowTable;
  op: "select" | "insert" | "delete";
  columns?: string;
  row?: Record<string, string>;
  filters: Array<[string, string]>;
}

function fakeClient(options: { missing?: FollowTable[]; rows?: Record<string, unknown>[] } = {}) {
  const calls: Call[] = [];
  const missing = new Set(options.missing ?? []);
  const result = (table: FollowTable, data: Record<string, unknown>[] | null) =>
    Promise.resolve(
      missing.has(table)
        ? { data: null, error: { code: "PGRST205", message: `Could not find the table 'public.${table}'` } }
        : { data, error: null },
    );
  type Chain = ReturnType<FollowClient["from"]>["select"] extends (columns: string) => infer R ? R : never;
  const filter = (call: Call, data: Record<string, unknown>[] | null): Chain => {
    const chain = {
      eq(column: string, value: string) {
        call.filters.push([column, value]);
        return chain;
      },
      then: (...args: Parameters<Promise<unknown>["then"]>) => result(call.table, data).then(...args),
    };
    return chain as unknown as Chain;
  };
  const client: FollowClient = {
    from(table) {
      return {
        select(columns) {
          const call: Call = { table, op: "select", columns, filters: [] };
          calls.push(call);
          return filter(call, options.rows ?? []);
        },
        insert(row) {
          calls.push({ table, op: "insert", row, filters: [] });
          return result(table, null);
        },
        delete() {
          const call: Call = { table, op: "delete", filters: [] };
          calls.push(call);
          return filter(call, null);
        },
      };
    },
  };
  return { client, calls };
}

describe("follow graph tables", () => {
  beforeEach(() => resetFollowTable());

  it("writes follows to scout_follows with follower_id and following_id", async () => {
    const { client, calls } = fakeClient();
    await followScout("me", "them", client);
    expect(calls).toEqual([
      { table: "scout_follows", op: "insert", row: { follower_id: "me", following_id: "them" }, filters: [] },
    ]);
    expect(FOLLOW_COLUMNS.scout_follows).toEqual({ follower: "follower_id", following: "following_id" });
  });

  it("reads the followed ids from scout_follows", async () => {
    const { client, calls } = fakeClient({ rows: [{ following_id: "a" }, { following_id: "b" }] });
    await expect(getFollowingIds("me", client)).resolves.toEqual(["a", "b"]);
    expect(calls[0]).toMatchObject({ table: "scout_follows", op: "select", columns: "following_id", filters: [["follower_id", "me"]] });
  });

  it("falls back to scout_connections only when scout_follows is missing", async () => {
    const { client, calls } = fakeClient({ missing: ["scout_follows"], rows: [{ connected_user_id: "c" }] });
    await expect(getFollowingIds("me", client)).resolves.toEqual(["c"]);
    expect(calls.map((call) => call.table)).toEqual(["scout_follows", "scout_connections"]);

    await unfollowScout("me", "c", client);
    const last = calls.at(-1);
    expect(last).toMatchObject({ table: "scout_connections", op: "delete", filters: [["user_id", "me"], ["connected_user_id", "c"]] });
  });

  it("never touches a friendships table", async () => {
    const { client, calls } = fakeClient();
    await followScout("me", "them", client);
    await getFollowingIds("me", client);
    expect(calls.some((call) => (call.table as string) === "friendships")).toBe(false);
  });

  it("recognises a missing table from PostgREST and Postgres", () => {
    expect(isMissingTable({ code: "PGRST205" })).toBe(true);
    expect(isMissingTable({ code: "42P01" })).toBe(true);
    expect(isMissingTable({ message: 'relation "public.scout_follows" does not exist' })).toBe(true);
    expect(isMissingTable({ code: "23505" })).toBe(false);
    expect(isMissingTable(null)).toBe(false);
  });
});
