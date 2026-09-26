import { hashString } from "@/lib/utils";

export interface ClueDistribution {
  clue_1: number;
  clue_2: number;
  clue_3: number;
  clue_4: number;
  clue_5: number;
  clue_6: number;
  missed: number;
  total_solves: number;
}

export const CLUE_COUNT_KEYS = [
  "clue_1",
  "clue_2",
  "clue_3",
  "clue_4",
  "clue_5",
  "clue_6",
] as const;

export function baselineDistribution(challengeId: string): ClueDistribution {
  const hash = hashString(challengeId || "daily");
  const counts = CLUE_COUNT_KEYS.map((_, index) => {
    const noise = (hash >> (index * 4)) & 15;
    return 18 + (index + 1) * 11 + noise;
  });
  const missed = 16 + (hash % 20);
  const total = counts.reduce((sum, count) => sum + count, 0) + missed;
  return {
    clue_1: counts[0],
    clue_2: counts[1],
    clue_3: counts[2],
    clue_4: counts[3],
    clue_5: counts[4],
    clue_6: counts[5],
    missed,
    total_solves: total,
  };
}

export function distributionFromRow(row: Partial<ClueDistribution> | null | undefined): ClueDistribution | null {
  if (!row) return null;
  const counts = CLUE_COUNT_KEYS.map((key) => normalizeCount(row[key]));
  const missed = normalizeCount(row.missed);
  const summed = counts.reduce((sum, count) => sum + count, 0) + missed;
  const total = normalizeCount(row.total_solves);
  return {
    clue_1: counts[0],
    clue_2: counts[1],
    clue_3: counts[2],
    clue_4: counts[3],
    clue_5: counts[4],
    clue_6: counts[5],
    missed,
    total_solves: total > 0 ? total : summed,
  };
}

export function barWidth(count: number, maxCount: number): number {
  if (maxCount <= 0 || count <= 0) return 0;
  return Math.max(0, Math.min(100, (count / maxCount) * 100));
}

export function sharePercent(count: number, total: number): number {
  if (total <= 0 || count <= 0) return 0;
  return Math.round((count / total) * 100);
}

function normalizeCount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}
