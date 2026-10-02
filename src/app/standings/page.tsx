'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCareerStandings, type CareerStanding } from '@/lib/career-standings';
import FindScouts from '@/components/game/FindScouts';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { getFollowingIds } from '@/lib/supabase/network';
import { sendDuelChallenge } from '@/lib/duels';

export function StandingsBoard({
  rows,
  currentUsername,
  onChallenge,
}: {
  rows: CareerStanding[];
  currentUsername?: string | null;
  onChallenge?: (username: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-zinc-500">No scouts on the board yet.</p>
    );
  }

  const podium = [rows[1], rows[0], rows[2]];
  const medals = ['🥈', '👑', '🥉'];
  const labels = ['Rank #2', 'Leader', 'Rank #3'];

  return (
    <>
      <div className="mb-8 grid grid-cols-3 items-end gap-3">
        {podium.map((row, index) => (
          <div
            key={labels[index]}
            className={`rounded-2xl border bg-white p-4 text-center ${
              index === 1 ? 'border-2 border-blue-600 py-6' : 'border-zinc-200'
            }`}
          >
            <span className="text-2xl">{medals[index]}</span>
            <p className="mt-1 text-[11px] font-mono font-bold uppercase text-zinc-400">{labels[index]}</p>
            <p className="truncate text-sm font-black text-zinc-900">@{row?.username || '—'}</p>
            <p className="mt-1 font-mono text-xs font-bold text-blue-600">
              {(row?.career_score || 0).toLocaleString()} PTS
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Scout</th>
              <th className="px-4 py-3">Cleared</th>
              <th className="px-4 py-3 text-right">Career score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-mono text-xs font-bold text-zinc-400">#{index + 1}</td>
                <td className="px-4 py-3 text-sm font-black text-zinc-900">
                  <div className="flex items-center justify-between gap-2">
                    <span>@{row.username || 'scout'}</span>
                    {onChallenge && (row.username || '').replace(/^@/, '').toLowerCase() !== (currentUsername || '').replace(/^@/, '').toLowerCase() && (
                      <button
                        type="button"
                        onClick={() => onChallenge(row.username || '')}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                      >
                        ⚔️ Challenge
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-zinc-500">{row.fixtures_cleared || 0}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-black text-blue-600">
                  {(row.career_score || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function StandingsPage() {
  const [rows, setRows] = useState<CareerStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetchCareerStandings()
      .then((standings) => {
        if (active) setRows(standings);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    if (isSupabaseConfigured) {
      supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (!active || !user) return;
        setUserId(user.id);
        supabaseClient
          .from('profiles')
          .select('username, career_score')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (!active || !data) return;
            setMyUsername(data.username || null);
            setMyScore(data.career_score || 0);
          }, () => undefined);
        getFollowingIds(user.id).then((ids) => {
          if (active) setFollowingIds(ids);
        }).catch(() => {
          if (active) setFollowingIds([]);
        });
      }).catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, []);

  const handleChallenge = async (opponentUsername: string) => {
    const { data, error } = await sendDuelChallenge(opponentUsername, myScore);
    if (data?.success) {
      alert(`Challenge sent to @${opponentUsername.replace(/^@/, '')}! ⚔️`);
    } else {
      alert(data?.error || error?.message || 'Could not send challenge');
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-10 text-zinc-900">
      <header className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
        <Link href="/" className="text-xl font-black uppercase tracking-tighter">
          Sports<span className="text-blue-600">History</span>Clue
        </Link>
        <Link href="/profile" className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Profile
        </Link>
      </header>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-black uppercase tracking-tight">Global Standings</h1>
        <p className="mt-1 text-xs font-medium text-zinc-500">
          Ranked by career score across every cleared fixture.
        </p>
        <div className="mt-8">
          <FindScouts
            currentUserId={userId}
            currentUsername={myUsername}
            followingIds={followingIds}
            onChallenge={handleChallenge}
          />
        </div>
        <div className="mt-8">
          {loading ? (
            <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400">Loading rankings...</p>
          ) : (
            <StandingsBoard rows={rows} currentUsername={myUsername} onChallenge={handleChallenge} />
          )}
        </div>
      </div>
    </main>
  );
}
