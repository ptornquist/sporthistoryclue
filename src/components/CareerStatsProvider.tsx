'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  CAREER_UPDATED_EVENT,
  readCareerLedger,
  readCareerSolves,
  reconcileCareerTotals,
} from '@/lib/career-ledger';
import { loadCareerStats, loadSolvedChallengeIds } from '@/lib/career-score';
import { recordFixtureWin } from '@/lib/fixture-solves';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';

export interface CareerStatsValue {
  careerScore: number | null;
  fixturesCleared: number | null;
  userId: string | null;
  username: string | null;
}

const EMPTY_CAREER_STATS: CareerStatsValue = {
  careerScore: null,
  fixturesCleared: null,
  userId: null,
  username: null,
};

const CareerStatsContext = createContext<CareerStatsValue>(EMPTY_CAREER_STATS);

export function useCareerStats(): CareerStatsValue {
  return useContext(CareerStatsContext);
}

export function CareerStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<CareerStatsValue>(EMPTY_CAREER_STATS);
  const seq = useRef(0);

  useEffect(() => {
    const refresh = () => {
      const ticket = ++seq.current;
      const local = readCareerLedger(localStorage);
      const solves = readCareerSolves(localStorage);
      setStats((current) => {
        if (current.careerScore == null || current.fixturesCleared == null) {
          return { ...current, careerScore: local.careerScore, fixturesCleared: local.fixturesCleared };
        }
        const localAhead =
          local.careerScore >= current.careerScore && local.fixturesCleared >= current.fixturesCleared;
        if (!localAhead) return current;
        return { ...current, careerScore: local.careerScore, fixturesCleared: local.fixturesCleared };
      });
      if (!isSupabaseConfigured) return;

      void (async () => {
        try {
          const { data: { user } } = await supabaseClient.auth.getUser();
          if (ticket !== seq.current) return;
          if (!user) {
            setStats((current) => ({
              ...current,
              userId: null,
              username: null,
              careerScore: local.careerScore,
              fixturesCleared: local.fixturesCleared,
            }));
            return;
          }

          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          let remote = await loadCareerStats(user.id);
          let remoteIds = await loadSolvedChallengeIds(user.id);
          if (remoteIds) {
            const known = new Set(remoteIds);
            const pending = solves.filter((solve) => solve.score > 0 && !known.has(solve.id));
            for (const solve of pending) {
              await recordFixtureWin(solve.id, solve.score);
            }
            if (pending.length > 0 && ticket === seq.current) {
              remote = await loadCareerStats(user.id);
              remoteIds = await loadSolvedChallengeIds(user.id);
            }
          }
          if (ticket !== seq.current) return;
          const totals = reconcileCareerTotals(remote, local, solves, remoteIds);
          setStats({
            careerScore: totals.careerScore,
            fixturesCleared: totals.fixturesCleared,
            userId: user.id,
            username: profile?.username ?? null,
          });
        } catch (error) {
          console.error('Failed to load career stats:', error);
        }
      })();
    };

    const timer = window.setTimeout(refresh, 0);
    window.addEventListener(CAREER_UPDATED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CAREER_UPDATED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return <CareerStatsContext.Provider value={stats}>{children}</CareerStatsContext.Provider>;
}
