'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';
import FindScouts from '@/components/game/FindScouts';
import { followScout, getFollowingIds, unfollowScout } from '@/lib/supabase/network';

interface LeaderboardEntry {
  id: string;
  username: string;
  display_name: string;
  total_score: number;
  matches_cleared: number;
}

export default function LeaderboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'global' | 'network'>('global');
  const [networkIds, setNetworkIds] = useState<string[]>([]);
  const [networkLeaders, setNetworkLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data: { user } } = await supabaseClient.auth.getUser();
      setCurrentUser(user);

      const { data: globalData } = await supabaseClient
        .from('leaderboard_view')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(50);

      if (globalData) setLeaders(globalData);

      if (user) {
        const ids = await getFollowingIds(user.id);
        setNetworkIds(ids);
        if (ids.length > 0) {
          const { data: networkScores } = await supabaseClient
            .from('leaderboard_view')
            .select('*')
            .in('id', ids)
            .order('total_score', { ascending: false });
          setNetworkLeaders(networkScores ?? []);
        } else {
          setNetworkLeaders([]);
        }
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const displayedLeaders = tab === 'global'
    ? leaders
    : networkLeaders.filter((entry) => networkIds.includes(entry.id));

  const toggleFollow = async (targetId: string) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    const already = networkIds.includes(targetId);
    if (already) {
      await unfollowScout(currentUser.id, targetId);
    } else {
      await followScout(currentUser.id, targetId);
    }
    const ids = await getFollowingIds(currentUser.id);
    setNetworkIds(ids);
    if (ids.length === 0) {
      setNetworkLeaders([]);
      return;
    }
    const { data: networkScores } = await supabaseClient
      .from('leaderboard_view')
      .select('*')
      .in('id', ids)
      .order('total_score', { ascending: false });
    setNetworkLeaders(networkScores ?? []);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </Link>
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
              Standings
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black">
              Arena
            </Link>
            <Link href="/profile" className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800">
              Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Global Standings</h1>
            <p className="text-zinc-500 text-xs font-medium mt-1">
              Ranked by total historical deduction points across all fixtures.
            </p>
          </div>

          <div className="flex bg-zinc-200 p-1 rounded-xl self-start">
            <button
              onClick={() => setTab('global')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                tab === 'global' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Global Standings
            </button>
            <button
              onClick={() => setTab('network')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                tab === 'network' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              My Network ({networkIds.length})
            </button>
          </div>
        </div>

        <section className="bg-white border border-zinc-200 rounded-3xl p-5 mb-8 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 mb-3">
            Find Scouts
          </h2>
          <FindScouts currentUserId={currentUser?.id ?? null} />
        </section>

        {!loading && displayedLeaders.length >= 3 && tab === 'global' && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-center flex flex-col justify-end items-center">
              <span className="text-2xl mb-1">🥈</span>
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">Rank #2</span>
              <span className="font-black text-sm md:text-base text-zinc-900 truncate max-w-full">
                @{displayedLeaders[1]?.username}
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 mt-1">
                {displayedLeaders[1]?.total_score.toLocaleString()} PTS
              </span>
            </div>

            <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 text-center flex flex-col justify-end items-center shadow-sm">
              <span className="text-3xl mb-1">👑</span>
              <span className="text-[11px] font-mono font-bold text-blue-600 uppercase">Leader</span>
              <span className="font-black text-base md:text-lg text-zinc-900 truncate max-w-full">
                @{displayedLeaders[0]?.username}
              </span>
              <span className="text-sm font-mono font-black text-blue-600 mt-1">
                {displayedLeaders[0]?.total_score.toLocaleString()} PTS
              </span>
            </div>

            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-5 text-center flex flex-col justify-end items-center">
              <span className="text-2xl mb-1">🥉</span>
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">Rank #3</span>
              <span className="font-black text-sm md:text-base text-zinc-900 truncate max-w-full">
                @{displayedLeaders[2]?.username}
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 mt-1">
                {displayedLeaders[2]?.total_score.toLocaleString()} PTS
              </span>
            </div>
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading rankings...
            </div>
          ) : tab === 'network' && networkIds.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500 text-sm">
                You haven&apos;t followed any scouts yet. Search and connect with fellow scouts to see their scores here.
              </p>
            </div>
          ) : displayedLeaders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500 text-sm">No records found for this category yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {displayedLeaders.map((entry, idx) => {
                const isMe = entry.id === currentUser?.id;
                return (
                  <div
                    key={entry.id}
                    className={`px-6 py-4 flex items-center justify-between transition-colors ${
                      isMe ? 'bg-blue-50/60' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-6 font-mono text-xs font-bold text-zinc-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-zinc-900">
                            @{entry.username}
                          </span>
                          {isMe && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400">
                          {entry.matches_cleared} {entry.matches_cleared === 1 ? 'match' : 'matches'} cleared
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => toggleFollow(entry.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
                            networkIds.includes(entry.id)
                              ? 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {networkIds.includes(entry.id) ? 'Following' : 'Follow'}
                        </button>
                      )}
                      <div className="text-right">
                        <span className="font-mono font-black text-base text-zinc-900">
                          {entry.total_score.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-400 ml-1">PTS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
