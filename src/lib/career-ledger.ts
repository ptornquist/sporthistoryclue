export const CAREER_SCORE_KEY = "shc_career_score";
export const FIXTURES_CLEARED_KEY = "shc_fixtures_cleared";
export const CAREER_SOLVED_KEY = "shc_career_solved";
export const CAREER_UPDATED_EVENT = "shc-career-updated";

export interface CareerTotals {
  careerScore: number;
  fixturesCleared: number;
}

export interface CareerSolveRecord {
  id: string;
  score: number;
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

export function readCareerSolves(storage: CareerStorage): CareerSolveRecord[] {
  const raw = storage.getItem(CAREER_SOLVED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const solves: CareerSolveRecord[] = [];
    for (const item of parsed) {
      if (typeof item === "string" && item.trim()) {
        solves.push({ id: item.trim(), score: 0 });
        continue;
      }
      if (!item || typeof item !== "object") continue;
      const record = item as { id?: unknown; score?: unknown };
      if (typeof record.id !== "string" || !record.id.trim()) continue;
      const score =
        typeof record.score === "number" && Number.isFinite(record.score)
          ? Math.max(0, Math.round(record.score))
          : 0;
      solves.push({ id: record.id.trim(), score });
    }
    return solves;
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

/** Adds solves that are still only on this device on top of the server totals. */
export function reconcileCareerTotals(
  remote: CareerTotals,
  local: CareerTotals,
  localSolves: CareerSolveRecord[],
  remoteIds: readonly string[] | null,
): CareerTotals {
  const baseline = mergeCareerTotals(remote, local);
  if (!remoteIds) return baseline;

  const known = new Set(remoteIds);
  let pendingScore = 0;
  let pendingCount = 0;
  for (const solve of localSolves) {
    if (solve.score <= 0 || known.has(solve.id)) continue;
    pendingScore += solve.score;
    pendingCount += 1;
  }

  return {
    careerScore: Math.max(baseline.careerScore, remote.careerScore + pendingScore),
    fixturesCleared: Math.max(baseline.fixturesCleared, remote.fixturesCleared + pendingCount),
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

  const solved = readCareerSolves(storage);
  if (solved.some((solve) => solve.id === id)) return { ...current, credited: false };

  const next = {
    careerScore: current.careerScore + awarded,
    fixturesCleared: current.fixturesCleared + 1,
  };
  storage.setItem(CAREER_SCORE_KEY, String(next.careerScore));
  storage.setItem(FIXTURES_CLEARED_KEY, String(next.fixturesCleared));
  storage.setItem(CAREER_SOLVED_KEY, JSON.stringify([...solved, { id, score: awarded }]));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CAREER_UPDATED_EVENT, { detail: next }));
  }
  return { ...next, credited: true };
}
