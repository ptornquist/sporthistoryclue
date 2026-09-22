'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';

interface Discipline {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

const DISCIPLINES: Discipline[] = [
  {
    id: 'ice_hockey',
    name: 'Ice Hockey',
    icon: '🏒',
    count: 142,
    description: 'Original Six, Olympic shootouts, Summit Series, and Stanley Cup dynasties.',
  },
  {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    count: 215,
    description: 'World Cups, European nights, iconic goals, and legendary managers.',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    count: 98,
    description: '1992 Dream Team, NBA Finals buzzer-beaters, and court legends.',
  },
  {
    id: 'golf',
    name: 'Golf',
    icon: '⛳',
    count: 64,
    description: 'The Masters at Augusta, Open Championship duels, and Ryder Cup comebacks.',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    count: 73,
    description: 'Grand Slam finals, 5-set Borg-McEnroe tiebreaks, and historic rallies.',
  },
];

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [todayCompleted, setTodayCompleted] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);

      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const { data: chal } = await supabaseClient
          .from('challenges')
          .select('id')
          .eq('type', 'daily_drop')
          .eq('scheduled_date', today)
          .maybeSingle();

        if (chal) {
          const { data: match } = await supabaseClient
            .from('match_history')
            .select('id')
            .eq('user_id', user.id)
            .eq('challenge_id', chal.id)
            .maybeSingle();

          if (match) setTodayCompleted(true);
        }
      }
    };
    checkUser();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
              Scouting Desk
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black transition-colors"
                >
                  Trophy Cabinet
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

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Section 1: The Daily Drop */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Mode 01 · 24-Hour Arena Fixture
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="bg-white border-2 border-blue-600/30 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-black tracking-wider uppercase mb-3">
                The Daily Drop
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight uppercase mb-3">
                Identify Today's Mystery Matchup
              </h3>
              <p className="text-zinc-600 text-sm font-medium leading-relaxed">
                6 progressive clues. Start with 10,000 points. Deduce the exact fixture and year before unlocking clues chips away at your score.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 whitespace-nowrap">
              {todayCompleted ? (
                <div className="px-6 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs uppercase tracking-wider rounded-xl">
                  ✓ Match Recorded Today
                </div>
              ) : (
                <Link
                  href="/daily"
                  className="px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Enter Daily Arena →
                </Link>
              )}
              <span className="text-[11px] font-mono text-zinc-400">Exact match deduction · No hints</span>
            </div>
          </div>
        </section>

        {/* Section 2: Time Travel Campaigns */}
        <section>
          <div className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Mode 02 · Chronological Campaigns
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Olympic Odyssey */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">🏛️</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded uppercase">
                    Era Progression
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2">
                  The Olympic Odyssey
                </h3>
                <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6">
                  Starts at Ancient Olympia in 776 BC and Athens 1896, working forward through Paris 1924, Berlin 1936, the 1980 Miracle on Ice, and the 1992 Dream Team.
                </p>
              </div>

              <Link
                href="/play?mode=timetravel&campaign=olympics"
                className="w-full text-center py-3.5 bg-zinc-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
              >
                Start at 776 BC →
              </Link>
            </div>

            {/* FIFA World Cup Timeline */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">⚽</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                    1930 → Present
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2">
                  World Cup Chronology
                </h3>
                <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6">
                  From Montevideo 1930 and Maracanazo 1950 to Pelé in Sweden 1958, Mexico 1986, and the modern finals.
                </p>
              </div>

              <Link
                href="/play?mode=timetravel&campaign=worldcup"
                className="w-full text-center py-3.5 bg-zinc-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
              >
                Start at 1930 Uruguay →
              </Link>
            </div>

          </div>
        </section>

        {/* Section 3: Sport Disciplines (Continuous Arena) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Mode 03 · Specific Disciplines (Continuous)
            </h2>
            <span className="text-xs font-medium text-zinc-400">Endless replay mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISCIPLINES.map((sport) => (
              <div
                key={sport.id}
                className="p-6 rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{sport.icon}</span>
                    <span className="text-[11px] font-mono font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                      {sport.count} Records
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-1">
                    {sport.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-6">
                    {sport.description}
                  </p>
                </div>

                <Link
                  href={`/play?category=${sport.id}`}
                  className="w-full text-center py-3 bg-zinc-100 hover:bg-blue-600 hover:text-white text-zinc-900 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  Enter {sport.name} →
                </Link>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}