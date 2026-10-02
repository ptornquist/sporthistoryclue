export const GAME_SESSION_KEY = "shc_game_session";

const DAILY_RESULT_KEY = "shc.dailyResult";
const LAST_DAILY_KEY = "shc.lastDaily";

export interface GameSession {
  date: string;
  challengeId: string;
}

type SessionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function readSession(storage: SessionStorage): GameSession | null {
  const raw = storage.getItem(GAME_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<GameSession> | null;
    if (!parsed || typeof parsed.date !== "string") return null;
    return {
      date: parsed.date,
      challengeId: typeof parsed.challengeId === "string" ? parsed.challengeId : "",
    };
  } catch {
    return null;
  }
}

function readStoredDate(storage: SessionStorage, key: string): string {
  const raw = storage.getItem(key);
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed === "object" && "dateKey" in parsed) {
      const dateKey = (parsed as { dateKey?: unknown }).dateKey;
      return typeof dateKey === "string" ? dateKey : "";
    }
  } catch {
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
  }
  return "";
}

/**
 * Drops an in-progress daily session when its date is not today, or when the
 * latest fixture is a different challenge than the one that session stored.
 * Profile, club, sound, and score history keys are left in place.
 */
export function clearStaleGameSession(
  storage: SessionStorage,
  today: string,
  options: { loadingLatest?: boolean; challengeId?: string } = {},
): void {
  const stored = readSession(storage);
  const loadingLatest = options.loadingLatest === true;
  const challengeMismatch = Boolean(
    loadingLatest &&
      options.challengeId &&
      stored?.challengeId &&
      stored.challengeId !== options.challengeId,
  );
  const stale = Boolean(stored && (stored.date !== today || challengeMismatch));

  if (stale) {
    storage.removeItem(GAME_SESSION_KEY);
    const resultDate = readStoredDate(storage, DAILY_RESULT_KEY);
    if (challengeMismatch || resultDate !== today) storage.removeItem(DAILY_RESULT_KEY);
    const lastDaily = readStoredDate(storage, LAST_DAILY_KEY);
    if (lastDaily && (challengeMismatch || lastDaily !== today)) storage.removeItem(LAST_DAILY_KEY);
  }

  if (loadingLatest) {
    storage.setItem(
      GAME_SESSION_KEY,
      JSON.stringify({
        date: today,
        challengeId: options.challengeId || (stale ? "" : stored?.challengeId) || "",
      }),
    );
  }
}
