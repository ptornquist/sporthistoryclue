'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  username: string;
  display_name: string;
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

  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
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

    const { data: friendRows } = await supabaseClient
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id);

    if (friendRows && friendRows.length > 0) {
      const fIds = friendRows.map((r) => r.friend_id);
      const { data: friendProfiles } = await supabaseClient
        .from('leaderboard_view')
        .select('*')
        .in('id', fIds);

      setFriends(friendProfiles || []);
    } else {
      setFriends([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    const query = searchQuery.toLowerCase().trim();
    const { data } = await supabaseClient
      .from('profiles')
      .select('id, username, display_name')
      .ilike('username', `%${query}%`)
      .neq('id', user.id)
      .limit(6);

    setSearchResults(data || []);
    setSearching(false);
  };

  const handleConnect = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabaseClient
      .from('friendships')
      .insert({ user_id: user.id, friend_id: targetId, status: 'accepted' });

    if (error) {
      alert(error.message);
    } else {
      setActionMessage('Friend connected!');
      setTimeout(() => setActionMessage(null), 3000);
      setSearchResults((prev) => prev.filter((u) => u.id !== targetId));
      loadData();
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    await supabaseClient
      .from('friendships')
      .delete()
      .eq('user_id', user.id)
      .eq('friend_id', friendId);

    loadData();
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">
                Scout Network
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Connect with friends to challenge each other and compare on the friend leaderboard.
              </p>
            </div>

            <form onSubmit={handleSearchUsers} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find @username..."
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700"
              >
                {searching ? '...' : 'Search'}
              </button>
            </form>
          </div>

          {searchResults.length > 0 && (
            <div className="mb-6 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Users Found
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.map((sr) => (
                  <div key={sr.id} className="bg-white p-3 rounded-xl border border-zinc-200 flex justify-between items-center">
                    <span className="font-bold text-xs text-zinc-900">@{sr.username}</span>
                    <button
                      onClick={() => handleConnect(sr.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-700"
                    >
                      + Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {friends.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs font-medium">
              No scout connections yet. Search a handle above to add your first friend.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {friends.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs text-zinc-900 block">@{f.username}</span>
                    <span className="text-[10px] font-mono text-blue-600 font-bold">
                      {f.total_score.toLocaleString()} PTS
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(f.id)}
                    className="text-zinc-400 hover:text-rose-600 text-xs px-2 py-1"
                    title="Remove connection"
                  >
                    ✕
                  </button>
                </div>
              ))}
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