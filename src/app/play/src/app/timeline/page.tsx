'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Discipline {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  color: string;
}

const DISCIPLINES: Discipline[] = [
  {
    id: 'ice_hockey',
    name: 'Ice Hockey',
    icon: '🏒',
    count: 142,
    description: 'Original Six, Olympic shootouts, Summit Series, and Stanley Cup dynasties.',
    color: 'border-cyan-200 hover:border-cyan-500 bg-cyan-50/30'
  },
  {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    count: 215,
    description: 'World Cups, European nights, iconic goals, and legendary managers.',
    color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/30'
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    count: 98,
    description: '1992 Dream Team, NBA Finals buzzer-beaters, and court legends.',
    color: 'border-orange-200 hover:border-orange-500 bg-orange-50/30'
  },
  {
    id: 'golf',
    name: 'Golf',
    icon: '⛳',
    count: 64,
    description: 'The Masters at Augusta, Open Championship duels, and Ryder Cup comebacks.',
    color: 'border-lime-200 hover:border-lime-500 bg-lime-50/30'
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    count: 73,
    description: 'Grand Slam finals, 5-set Borg-McEnroe tiebreaks, and historic rallies.',
    color: 'border-amber-200 hover:border-amber-500 bg-amber-50/30'
  }
];

export default function TimelineHubPage() {
  const [activeTab, setActiveTab] = useState<'timetravel' | 'disciplines'>('timetravel');

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-black transition-colors">
              ← Lobby
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
              The Match Archive
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/daily"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm"
            >
              Play Today's Drop →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Hero Title */}
        <div className="mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2 block">
            Arena Expeditions
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 uppercase">
            Choose Your Match Arena
          </h1>
          <p className="text-zinc-500 font-medium text-base mt-2 max-w-2xl">
            Select a chronological Time Travel campaign or step into continuous discipline sessions to test your sports knowledge.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-zinc-200 gap-8 mb-8 text-sm font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('timetravel')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'timetravel' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            ⏳ Time Travel Campaigns
            {activeTab === 'timetravel' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('disciplines')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'disciplines' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            🏟️ Sport Disciplines (Continuous)
            {activeTab === 'disciplines' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Time Travel Campaigns */}
        {activeTab === 'timetravel' && (
          <div className="space-y-6">
            
            {/* Flagship Campaign: Olympic Odyssey */}
            <div className="bg-white border-2 border-blue-600/30 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                Featured Campaign
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🏛️</span>
                    <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                      Chronological Expedition
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight uppercase mb-2">
                    The Olympic Odyssey
                  </h2>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-4">
                    Begins at the ancient sanctuary of Olympia in 776 BC and Athens 1896, journeying chronologically through Berlin 1936, the Miracle on Ice, and the modern era. Questions must be cleared era-by-era.
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs font-mono font-bold text-zinc-400">
                    <span>STAGE 1: ANCIENT GREECE → 1924</span>
                    <span>•</span>
                    <span className="text-emerald-600">UNLOCKED</span>
                  </div>
                </div>

                <Link
                  href="/play?mode=timetravel&campaign=olympics"
                  className="px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors text-center whitespace-nowrap shadow-sm"
                >
                  Start at Ancient Greece →
                </Link>
              </div>
            </div>

            {/* Campaign 2: FIFA World Cup Timeline */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-zinc-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚽</span>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    1930 Uruguay to Modern Day
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase">The World Cup Chronology</h3>
                <p className="text-zinc-500 text-xs font-medium mt-1 max-w-lg">
                  Trace football's premier tournament from the inaugural 1930 Estadio Centenario clash through Pelé's reign and 1986 Mexico.
                </p>
              </div>
              <Link
                href="/play?mode=timetravel&campaign=worldcup"
                className="px-6 py-3 bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-colors text-center whitespace-nowrap"
              >
                Enter 1930
              </Link>
            </div>

            {/* Campaign 3: Ice Hockey Golden Era */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-zinc-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🏒</span>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    1920 Antwerp to 1994 Lillehammer
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase">International Ice Hockey Heritage</h3>
                <p className="text-zinc-500 text-xs font-medium mt-1 max-w-lg">
                  Follow the global puck history: the 1972 Summit Series, the Red Machine dynasties, and Tre Kronor's historic golden shootouts.
                </p>
              </div>
              <Link
                href="/play?mode=timetravel&campaign=hockey_history"
                className="px-6 py-3 bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-colors text-center whitespace-nowrap"
              >
                Enter Antwerp
              </Link>
            </div>

          </div>
        )}

        {/* Tab 2: Specific Sport Disciplines */}
        {activeTab === 'disciplines' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DISCIPLINES.map((sport) => (
              <div
                key={sport.id}
                className={`p-6 rounded-2xl border bg-white transition-all hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{sport.icon}</span>
                    <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-md">
                      {sport.count} Matches
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
                  className="w-full text-center py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
                >
                  Play {sport.name} Series →
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}