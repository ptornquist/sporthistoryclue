'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';
import Footer from '@/components/Footer';

interface LeaderboardEntry {
  handle: string;
  avatar_char: string;
  points: number;
  clues: number;
  match: string;
  era: string;
  is_verified: boolean;
}

interface StreakEntry {
  handle: string;
  avatar_char: string;
  streak: number;
}

export default function LeaderboardPage() {
  const [highScores, setHighScores] = useState<LeaderboardEntry[]>([]);
  const [streaks, setStreaks] = useState<StreakEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user || null);
    });

    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch Today's High Scores (Assume Supabase has views/history set up)
      // For beta simulation, we are using the structured data format.
      setHighScores([
        { handle: 'PeterT', avatar_char: 'P', is_verified: true, clues: 1, points: 10000, match: 'Miracle on Ice', era: 'NHL 1980' },
        { handle: 'PuckMaster', avatar_char: 'M', is_verified: false, clues: 1, points: 10000, match: 'Miracle on Ice', era: 'NHL 1980' },
        { handle: 'SoccerScout88', avatar_char: 'S', is_verified: true, clues: 2, points: 8000, match: 'Brazil vs Sweden', era: 'World Cup 1958' },
        { handle: 'Goter81', avatar_char: 'G', is_verified: false, clues: 2, points: 8000, match: 'Sweden vs Canada', era: 'Lillehammer 1994' },
      ]);

      // 2. Fetch Top Streaks from profiles (gated motivation)
      setStreaks([
        { handle: 'PeterT', avatar_char: 'P', streak: 14 },
        { handle: 'Trivia Champ', avatar_char: 'C', streak: 12 },
        { handle: 'SoccerScout88', avatar_char: 'S', streak: 10 },
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <header className="bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-lg font-black tracking-tighter uppercase">
                Sports<span className="text-blue-600">History</span>Clue
              </Link>
              <span className="text-[10px] font-mono uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
                Leaderboard
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
                Daily Drop
              </Link>
              <Link href="/campaigns" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
                Campaigns
              </Link>
              <Link href="/disciplines" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
                Disciplines
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
              Global Leaderboard
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Top scout performance rankings. View today’s high scores and lifetime career streaks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left Card: Today's Scores */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-100">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">
                  Today's Deterministic Scores
                </h2>
                <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                  Verified Drop
                </span>
              </div>

              {loading ? (
                <div className="text-center py-10 text-xs font-mono text-zinc-400">LOADING SCOUT INTEL...</div>
              ) : (
                <div className="space-y-4">
                  {highScores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-zinc-300 w-8 text-center">{index + 1}</span>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white ${score.is_verified ? 'bg-blue-600' : 'bg-zinc-400'}`}>
                            {score.avatar_char}
                          </div>
                          <div>
                            <span className="text-xs font-black text-zinc-900 block truncate max-w-[140px]">
                              {score.handle}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {score.clues} Clue{score.clues === 1 ? '' : 's'} · {score.points.toLocaleString()} PTS
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-zinc-800 block truncate max-w-[150px]">{score.match}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{score.era}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Card: Lifetime Streaks */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-100">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">
                  Top Lifetime Streaks
                </h2>
                <span className="text-[11px] font-mono text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full">
                  Scout Loyalty
                </span>
              </div>

              {loading ? (
                <div className="text-center py-10 text-xs font-mono text-zinc-400">LOADING SCOUT INTEL...</div>
              ) : (
                <div className="space-y-4">
                  {streaks.map((streak, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-zinc-200/50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-zinc-300 w-8 text-center">{index + 1}</span>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center text-sm font-black">
                            {streak.avatar_char}
                          </div>
                          <div>
                            <span className="text-xs font-black text-zinc-900 block truncate max-w-[180px]">
                              {streak.handle}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">Verified Career</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold text-amber-700 font-mono">
                        🔥 {streak.streak} Days
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Call to action for Gests */}
          {!currentUser && (
            <div className="bg-zinc-900 rounded-3xl p-8 text-center text-white border border-black shadow-xl max-w-2xl mx-auto">
              <span className="text-4xl block mb-2">🔓</span>
              <h4 className="text-xl font-black uppercase tracking-tight">Become an Authenticated Scout</h4>
              <p className="text-xs text-zinc-400 mt-1 mb-6 max-w-sm mx-auto font-medium">
                Create a free profile to deduce unlimited archive matches, track your lifetime stats, and claim your place on the global leaderboard.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <Link
                  href="/login?mode=signup"
                  className="py-3 px-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Join Free
                </Link>
                <Link
                  href="/login"
                  className="py-3 px-4 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  Log In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}