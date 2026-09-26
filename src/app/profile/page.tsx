'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import {
  followScout,
  getFollowingIds,
  searchScouts,
  unfollowScout,
  type ScoutProfile,
} from '@/lib/supabase/network';
import { ScoutCard } from '@/components/game/ScoutCard';
import { DuelHistory } from '@/components/game/DuelHistory';
import { duelHandleName } from '@/lib/duels';
import { useCosmeticWallet } from '@/lib/useCosmeticWallet';
import { FEATURED_BADGES, badgeUnlocked, loadBadgeTimes, rememberBadgeTimes } from '@/lib/cosmetics';

interface SessionUser {
  id: string;
  email?: string | null;
}

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
  const { wallet, equip } = useCosmeticWallet();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guestHandle, setGuestHandle] = useState('scout');
  const [solvedSlugs, setSolvedSlugs] = useState<string[]>([]);
  const [solvedScores, setSolvedScores] = useState<number[]>([]);
  const [badgeTimes, setBadgeTimes] = useState<Record<string, string>>({});
  const [profileReady, setProfileReady] = useState(false);
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
    if (!isSupabaseConfigured) {
      setProfileReady(true);
      return;
    }
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      setUser(null);
      setProfileReady(true);
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
      setMatches(matchHistory as unknown as MatchRecord[]);
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
    setProfileReady(true);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      const slugs: string[] = [];
      const scores: number[] = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith('shc_score_')) continue;
        slugs.push(key.slice('shc_score_'.length));
        const score = Number.parseInt(localStorage.getItem(key) || '', 10);
        if (Number.isFinite(score)) scores.push(score);
      }
      setSolvedSlugs(slugs);
      setSolvedScores(scores);
      const saved = localStorage.getItem('shc_handle');
      if (saved) setGuestHandle(saved);
      void loadData();
    });
  }, []);

  useEffect(() => {
    const unlocked = FEATURED_BADGES.filter((badge) =>
      badgeUnlocked(badge.id, wallet, solvedSlugs, solvedScores),
    ).map((badge) => badge.id);
    Promise.resolve().then(() => {
      const next = rememberBadgeTimes(unlocked, loadBadgeTimes());
      setBadgeTimes((current) => {
        const currentKeys = Object.keys(current);
        const nextKeys = Object.keys(next);
        const same = currentKeys.length === nextKeys.length && nextKeys.every((id) => current[id] === next[id]);
        return same ? current : next;
      });
    });
  }, [wallet, solvedSlugs, solvedScores]);

  useEffect(() => {
    const needle = scoutQuery.trim();
    if (!user || needle.length < 1) {
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
      setProfile((prev) => (prev ? { ...prev, username: clean, display_name: clean } : prev));
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
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between">
      <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
            {actionMessage}
          </div>
        )}

        <ScoutCard
          handle={profile?.username || guestHandle}
          email={user?.email}
          avatarUrl={profile?.avatar_url}
          wallet={wallet}
          careerScore={Math.max(wallet.totalScore, profile?.total_score ?? 0, totalScore)}
          solvedCount={Math.max(wallet.matchesSolved, matches.length)}
          currentStreak={Math.max(wallet.streak, profile?.streak ?? 0)}
          bestStreak={Math.max(wallet.bestStreak, wallet.streak, profile?.streak ?? 0)}
          solvedSlugs={solvedSlugs}
          solvedScores={solvedScores}
          badgeTimes={badgeTimes}
          signedIn={Boolean(user)}
          profileReady={profileReady}
          onEquip={(itemId) => { void equip(itemId); }}
        />

        <DuelHistory
          username={duelHandleName(profile?.username || guestHandle)}
          playedIds={solvedSlugs}
          ready={profileReady}
          onToast={(message) => {
            setActionMessage(message);
            window.setTimeout(() => setActionMessage(null), 2500);
          }}
        />

        {user && (
          <form onSubmit={handleUpdateUsername} className="flex gap-2">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Change handle"
              className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={savingUsername}
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black"
            >
              {savingUsername ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}

        {user && (
        <>
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
          {(scoutQuery.trim() && user ? scoutHits : []).length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(scoutQuery.trim() && user ? scoutHits : []).map((scout) => {
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
        </>
        )}
      </div>
      </div>
      <Footer />
    </main>
  );
}