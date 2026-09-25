"use client";

import { useEffect, useState } from "react";
import { readSolvedScoreForIds } from "@/lib/solved-cases";

export interface SolvedFixture {
  score: number;
  matchup: string | null;
}

interface LookupGroup {
  key: string;
  lookupIds: string[];
}

export function useSolvedFixtures(groups: LookupGroup[]): Record<string, SolvedFixture> {
  const signature = groups.map((group) => `${group.key}:${group.lookupIds.join(",")}`).join("|");
  const [solved, setSolved] = useState<Record<string, SolvedFixture>>({});

  useEffect(() => {
    const parsed: LookupGroup[] = signature
      ? signature.split("|").map((entry) => {
          const separator = entry.indexOf(":");
          const key = separator === -1 ? entry : entry.slice(0, separator);
          const ids = separator === -1 ? "" : entry.slice(separator + 1);
          return { key, lookupIds: ids ? ids.split(",") : [] };
        })
      : [];

    const pending = parsed.flatMap((group) => {
      const ids = group.lookupIds.length > 0 ? group.lookupIds : [group.key];
      const score = readSolvedScoreForIds(ids);
      return score == null ? [] : [{ ...group, score }];
    });

    let cancelled = false;
    const publish = (next: Record<string, SolvedFixture>) => {
      if (!cancelled) setSolved(next);
    };

    if (pending.length === 0) {
      const cleared = Promise.resolve().then(() => publish({}));
      void cleared;
      return () => {
        cancelled = true;
      };
    }

    const ids = [...new Set(pending.flatMap((item) => item.lookupIds))];
    void fetch(`/api/case-label?ids=${encodeURIComponent(ids.join(","))}`)
      .then(async (response) => {
        if (!response.ok) return { labels: {} as Record<string, string> };
        return (await response.json()) as { labels?: Record<string, string> };
      })
      .then((payload) => {
        const labels = payload.labels ?? {};
        const next: Record<string, SolvedFixture> = {};
        for (const item of pending) {
          const matchup =
            item.lookupIds.map((id) => labels[id]).find((label): label is string => Boolean(label)) ?? null;
          next[item.key] = { score: item.score, matchup };
        }
        publish(next);
      })
      .catch(() => {
        const next: Record<string, SolvedFixture> = {};
        for (const item of pending) next[item.key] = { score: item.score, matchup: null };
        publish(next);
      });

    return () => {
      cancelled = true;
    };
  }, [signature]);

  return solved;
}
