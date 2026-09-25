import { caseIdsFor } from "@/lib/case-files";

export function scoreStorageKey(id: string): string {
  return `shc_score_${id}`;
}

export function readSolvedScore(id: string): number | null {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = window.localStorage.getItem(scoreStorageKey(id));
    if (!raw) return null;
    const score = Number.parseInt(raw, 10);
    if (!Number.isFinite(score) || score < 0) return null;
    return score;
  } catch {
    return null;
  }
}

export function readSolvedScoreForIds(ids: string[]): number | null {
  for (const id of ids) {
    const score = readSolvedScore(id);
    if (score != null) return score;
  }
  return null;
}

export function rememberSolvedCase(id: string, score: number): void {
  if (typeof window === "undefined" || !id) return;
  const safeScore = Math.max(0, Math.round(score));
  const ids = new Set([id, ...caseIdsFor(id)]);
  for (const key of ids) {
    if (!key) continue;
    window.localStorage.setItem(scoreStorageKey(key), String(safeScore));
  }
}
