'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';
import {
  followScout,
  getFollowingIds,
  searchScouts,
  unfollowScout,
  type ScoutProfile,
} from '@/lib/supabase/network';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  streak?: number | null;
  total_score?: number | null;
}

interface MatchRecord {
  id: string;
  score: number;
  clues_used: number;
  created_at: string;
  challenges: {
    subject: string;
    year: number;
    category: string;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const [network, setNetwork] = useState<ScoutProfile[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [scoutQuery, setScoutQuery] = useState('');
  const [scoutHits, setScoutHits] = useState<ScoutProfile[]>([]);
  const [searchingScouts, setSearchingScouts] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setUser(user);

    const { data: prof } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (prof) {
      setProfile(prof);
      setUsernameInput(prof.username || '');
    }

    const { data: matchHistory } = await supabaseClient
      .from('match_history')
      .select('id, score, clues_used, created_at, challenges(subject, year, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (matchHistory) {
      setMatches(matchHistory as any);
      const sum = matchHistory.reduce((acc, curr) => acc + (curr.score || 0), 0);
      setTotalScore(sum);
    }

    const ids = await getFollowingIds(user.id);
    setFollowingIds(ids);
    if (ids.length > 0) {
      const { data: scoutProfiles } = await supabaseClient
        .from('profiles')
        .select('id, username, avatar_url, streak, total_score')
        .in('id', ids);
      setNetwork((scoutProfiles as ScoutProfile[]) || []);
    } else {
      setNetwork([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const needle = scoutQuery.trim();
    if (!user || needle.length < 1) {
      setScoutHits([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setSearchingScouts(true);
      try {
        setScoutHits(await searchScouts(needle, user.id));
      } catch {
        setScoutHits([]);
      } finally {
        setSearchingScouts(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [scoutQuery, user]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !user) return;
    setSavingUsername(true);

    const clean = usernameInput.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({ id: user.id, username: clean, display_name: clean });

    if (error) {
      alert(`Could not save username: ${error.message}`);
    } else {
      setProfile((prev: any) => ({ ...prev, username: clean, display_name: clean }));
      setActionMessage('Username updated!');
      setTimeout(() => setActionMessage(null), 3000);
    }
    setSavingUsername(false);
  };

  const toggleFollow = async (targetId: string) => {
    if (!user) return;
    if (followingIds.includes(targetId)) {
      await unfollowScout(user.id, targetId);
    } else {
      await followScout(user.id, targetId);
    }
    await loadData();
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
              Career Stats
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black">
              Arena
            </Link>
            <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black">
              Standings
            </Link>
            <button
              onClick={async () => {
                await supabaseClient.auth.signOut();
                window.location.href = '/login';
              }}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
            {actionMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
          <div>
            <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wider">
              Scout Handle
            </span>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase mt-1">
              @{profile?.username || 'scout'}
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">{user?.email}</p>

            <form onSubmit={handleUpdateUsername} className="flex gap-2 mt-4">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Change handle"
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={savingUsername}
                className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black"
              >
                {savingUsername ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>

          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-zinc-100 pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
            <div>
              <span className="block text-[11px] font-mono font-bold text-zinc-400 uppercase">Career Score</span>
              <span className="text-3xl font-black font-mono text-blue-600">
                {totalScore.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-mono font-bold text-zinc-400 uppercase">Fixtures Cleared</span>
              <span className="text-3xl font-black font-mono text-zinc-900">
                {matches.length}
              </span>
            </div>
          </div>
        </div>

        {/* Social / Friends Section */}
        <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">Find Scouts</h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5 mb-4">
            Search registered scouts by username.
          </p>
          <input
            type="text"
            value={scoutQuery}
            onChange={(event) => setScoutQuery(event.target.value)}
            placeholder="Find Scouts by @username"
            aria-label="Find Scouts"
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600"
          />
          {searchingScouts && (
            <p className="text-[11px] font-bold text-zinc-400 mt-3">Searching…</p>
          )}
          {scoutHits.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scoutHits.map((scout) => {
                const handle = scout.username || 'scout';
                const following = followingIds.includes(scout.id);
                return (
                  <div key={scout.id} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {scout.avatar_url ? (
                        <img src={scout.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-zinc-200" />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                          {handle.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="font-black text-xs text-zinc-900 truncate">@{handle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFollow(scout.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        following
                          ? 'bg-white text-zinc-700 border-zinc-200'
                          : 'bg-blue-600 text-white border-blue-600'
                      }`}
                    >
                      {following ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">My Network</h2>
          {network.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs font-medium">
              You haven&apos;t followed any scouts yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {network.map((scout) => {
                const handle = scout.username || 'scout';
                const streak = scout.streak ?? 0;
                const points = scout.total_score ?? 0;
                return (
                  <div key={scout.id} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {scout.avatar_url ? (
                        <img src={scout.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                          {handle.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <span className="font-black text-xs text-zinc-900 block truncate">@{handle}</span>
                        <span className="text-[10px] font-mono text-blue-600 font-bold block">
                          {streak} day streak
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 font-bold">
                          {points.toLocaleString()} PTS
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFollow(scout.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-white text-zinc-700 border-zinc-200"
                    >
                      Unfollow
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Match History */}
        <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-6">
            Scouting Log
          </h2>

          {matches.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs font-medium">
              No completed fixtures yet. Head over to the Arena to start solving.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {matches.map((m) => (
                <div key={m.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-black text-zinc-900 block">
                      {m.challenges?.subject} ({m.challenges?.year})
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400 uppercase">
                      {m.challenges?.category?.replace('_', ' ')} · Solved on Clue {m.clues_used}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-blue-600">
                      +{m.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}