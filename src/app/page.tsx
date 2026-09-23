'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  const disciplines = [
    { name: 'Ice Hockey', slug: 'ice_hockey', icon: '🏒', active: true },
    { name: 'Football', slug: 'football', icon: '⚽', active: true },
    { name: 'Olympics', slug: 'olympics', icon: '🥇', active: true },
    { name: 'Tennis', slug: 'tennis', icon: '🎾', active: true },
    { name: 'Golf', slug: 'golf', icon: '⛳', active: true },
    { name: 'Motorsport', slug: 'motorsport', icon: '🏎️', active: false },
    { name: 'Basketball', slug: 'basketball', icon: '🏀', active: false },
    { name: 'Boxing', slug: 'boxing', icon: '🥊', active: false },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* Top Bar with Leaderboard and Profile */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </Link>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
              Scouting Desk
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/leaderboard"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black transition-colors"
            >
              Leaderboard
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={async () => {
                    await supabaseClient.auth.signOut();
                    window.location.reload();
                  }}
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-10 space-y-12">
        
        {/* Mode 01: Daily Drop */}
        <section>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-blue-600 mb-3 block">
            ● Mode 01 · 24-Hour Arena Fixture
          </span>
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-xl">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black tracking-wider uppercase">
                The Daily Drop
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-4 mb-3">
                IDENTIFY TODAY'S MYSTERY MATCHUP
              </h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                6 progressive clues. Start with 10,000 points. Deduce the exact fixture and year before unlocking clues chips away at your score.
              </p>
            </div>
            <Link
              href="/daily"
              className="px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-blue-700 transition-all shadow-sm hover:shadow whitespace-nowrap"
            >
              Enter Daily Arena →
            </Link>
          </div>
        </section>

        {/* Mode 02: Campaigns */}
        <section>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-3 block">
            Mode 02 · Chronological Campaigns
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Era Progression
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight mt-3 mb-2">
                  The Olympic Odyssey
                </h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-6">
                  Starts at Ancient Olympia in 776 BC and Athens 1896, working forward through Paris 1924, Berlin 1936, the 1980 Miracle on Ice, and the 1992 Dream Team.
                </p>
              </div>
              <Link
                href="/play?campaign=olympics_campaign"
                className="w-full py-3 bg-zinc-900 text-white text-center text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
              >
                Start at 776 BC ↓
              </Link>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  1930 | Present
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight mt-3 mb-2">
                  World Cup Chronology
                </h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-6">
                  From Montevideo 1930 and Maracanazo 1950 to Pelé in Sweden 1958, Mexico 1986, and the modern finals.
                </p>
              </div>
              <Link
                href="/play?campaign=worldcup"
                className="w-full py-3 bg-zinc-900 text-white text-center text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
              >
                Start at 1930 Uruguay ↓
              </Link>
            </div>
          </div>
        </section>

        {/* Mode 03: Disciplines */}
        <section>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-3 block">
            Mode 03 · Specific Disciplines (Continuous)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {disciplines.map((d) => (
              <Link
                key={d.slug}
                href={d.active ? `/play?category=${d.slug}` : '#'}
                className={`bg-white border border-zinc-200 rounded-2xl p-5 transition-all ${
                  d.active
                    ? 'hover:border-blue-600 hover:shadow-sm cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <span className="text-2xl block mb-2">{d.icon}</span>
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                  {d.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                  {d.active ? 'Enter Arena →' : 'Locked'}
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}