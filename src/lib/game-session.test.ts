import { describe, expect, it } from "vitest";
import { clearStaleGameSession, GAME_SESSION_KEY } from "./game-session";

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    values,
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };
}

describe("clearStaleGameSession", () => {
  const today = "2026-09-27";

  it("clears a session stored for another day and keeps profile keys", () => {
    const storage = memoryStorage({
      [GAME_SESSION_KEY]: JSON.stringify({ date: "2026-09-26", challengeId: "old-final" }),
      "shc.dailyResult": JSON.stringify({ dateKey: "2026-09-26", score: 1000 }),
      "shc.lastDaily": JSON.stringify("2026-09-26"),
      shc_handle: "Scout",
      shc_favorite_club: "arsenal",
      shc_solved_history: JSON.stringify(["2026-09-26"]),
    });

    clearStaleGameSession(storage, today, { loadingLatest: true, challengeId: "new-final" });

    expect(storage.values.get("shc_handle")).toBe("Scout");
    expect(storage.values.get("shc_favorite_club")).toBe("arsenal");
    expect(storage.values.get("shc_solved_history")).toContain("2026-09-26");
    expect(storage.values.has("shc.dailyResult")).toBe(false);
    expect(storage.values.has("shc.lastDaily")).toBe(false);
    expect(JSON.parse(storage.values.get(GAME_SESSION_KEY) ?? "")).toEqual({
      date: today,
      challengeId: "new-final",
    });
  });

  it("replaces today's session when the latest fixture is a different challenge", () => {
    const storage = memoryStorage({
      [GAME_SESSION_KEY]: JSON.stringify({ date: today, challengeId: "morning" }),
      "shc.dailyResult": JSON.stringify({ dateKey: today, score: 8000 }),
    });

    clearStaleGameSession(storage, today, { loadingLatest: true, challengeId: "evening" });

    expect(storage.values.has("shc.dailyResult")).toBe(false);
    expect(JSON.parse(storage.values.get(GAME_SESSION_KEY) ?? "").challengeId).toBe("evening");
  });

  it("keeps today's session when the same fixture loads again", () => {
    const storage = memoryStorage({
      [GAME_SESSION_KEY]: JSON.stringify({ date: today, challengeId: "evening" }),
      "shc.dailyResult": JSON.stringify({ dateKey: today, score: 8000 }),
      "shc.lastDaily": JSON.stringify(today),
    });

    clearStaleGameSession(storage, today, { loadingLatest: true, challengeId: "evening" });

    expect(storage.values.get("shc.dailyResult")).toContain("8000");
    expect(storage.values.get("shc.lastDaily")).toContain(today);
    expect(JSON.parse(storage.values.get(GAME_SESSION_KEY) ?? "").challengeId).toBe("evening");
  });
});
