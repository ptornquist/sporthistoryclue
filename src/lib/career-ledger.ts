export const CAREER_SCORE_KEY = "shc_career_score";
export const FIXTURES_CLEARED_KEY = "shc_fixtures_cleared";
export const CAREER_SOLVED_KEY = "shc_career_solved";
export const CAREER_UPDATED_EVENT = "shc-career-updated";

export interface CareerTotals {
  careerScore: number;
  fixturesCleared: number;
}

interface CareerStorage {
  getItem: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
}

function readCount(storage: CareerStorage, key: string): number {
  const raw = storage.getItem(key);
  const value = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function readSolvedIds(storage: CareerStorage): string[] {
  const raw = storage.getItem(CAREER_SOLVED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function readCareerLedger(storage: CareerStorage): CareerTotals {
  return {
    careerScore: readCount(storage, CAREER_SCORE_KEY),
    fixturesCleared: readCount(storage, FIXTURES_CLEARED_KEY),
  };
}

export function mergeCareerTotals(remote: CareerTotals, local: CareerTotals): CareerTotals {
  return {
    careerScore: Math.max(remote.careerScore, local.careerScore),
    fixturesCleared: Math.max(remote.fixturesCleared, local.fixturesCleared),
  };
}

/** Adds one solved fixture to the local career totals. A repeat id does not count again. */
export function creditCareerSolve(
  fixtureId: string,
  score: number,
  storage: Required<Pick<CareerStorage, "getItem" | "setItem">>,
): CareerTotals & { credited: boolean } {
  const current = readCareerLedger(storage);
  const id = fixtureId.trim();
  const awarded = Math.max(0, Math.round(score));
  if (!id) return { ...current, credited: false };

  const solved = readSolvedIds(storage);
  if (solved.includes(id)) return { ...current, credited: false };

  const next = {
    careerScore: current.careerScore + awarded,
    fixturesCleared: current.fixturesCleared + 1,
  };
  storage.setItem(CAREER_SCORE_KEY, String(next.careerScore));
  storage.setItem(FIXTURES_CLEARED_KEY, String(next.fixturesCleared));
  storage.setItem(CAREER_SOLVED_KEY, JSON.stringify([...solved, id]));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CAREER_UPDATED_EVENT, { detail: next }));
  }
  return { ...next, credited: true };
}
