'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface ChallengeItem {
  id: string;
  slug?: string;
  title: string;
  subject: string;
  category: string;
  year: number;
}

interface SportGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const SPORTS: SportGroup[] = [
  { id: 'ice_hockey', name: 'Ice Hockey', icon: '🏒', description: 'Olympic shootouts, Cold War clashes & Stanley Cup lore.' },
  { id: 'football', name: 'Football', icon: '⚽', description: 'World Cup finals, miracle comebacks & golden generations.' },
  { id: 'boxing', name: 'Boxing', icon: '🥊', description: 'Rumble in the Jungle, heavyweight wars & upset champions.' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', description: 'Historic tiebreaks, Wimbledon grass epics & five-set marathons.' },
  { id: 'athletics', name: 'Athletics', icon: '🏃', description: 'Shattered world records and iconic Olympic track moments.' },
];

export default function DisciplinesPage() {
  const [selectedSport, setSelectedSport] = useState<string>('ice_hockey');
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setError('Supabase is not configured. Add your project keys to load fixtures.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabaseClient
          .from('challenges')
          .select('id, slug, title, subject, category, year')
          .order('year', { ascending: false });

        if (queryError) throw queryError;
        setChallenges((data as ChallengeItem[]) ?? []);
      } catch (err) {
        console.error('Failed to load challenges:', err);
        setError('Could not reach the archive. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const activeSport = SPORTS.find((sport) => sport.id === selectedSport);
  const filteredChallenges = challenges.filter(
    (challenge) => challenge.category?.toLowerCase() === selectedSport.toLowerCase(),
  );

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </Link>
            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              Disciplines
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Daily Drop
            </Link>
            <Link href="/campaigns" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Campaigns
            </Link>
            <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Leaderboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Browse by Discipline
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
            Sports Archive
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-xl">
            Choose your specialty sport and deduce iconic matches from that discipline.
          </p>
        </div>

        {/* Sport Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => setSelectedSport(sport.id)}
              aria-pressed={selectedSport === sport.id}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                selectedSport === sport.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <span className="text-xl block mb-1" aria-hidden>
                {sport.icon}
              </span>
              <span className="text-xs font-bold block">{sport.name}</span>
            </button>
          ))}
        </div>

        {/* List of Challenges for Selected Sport */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">
                {activeSport?.name} Fixtures
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">{activeSport?.description}</p>
            </div>
            <span className="shrink-0 text-xs font-mono font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
              {filteredChallenges.length} matches
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Loading fixtures…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-zinc-400 text-xs font-medium">{error}</div>
          ) : filteredChallenges.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No matches found for this sport yet. New fixtures added weekly.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/60 transition-all group"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5 truncate">
                      {challenge.subject} · <span className="font-mono">{challenge.year}</span>
                    </p>
                  </div>

                  <Link
                    href={`/?match=${challenge.slug || challenge.id}`}
                    className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm"
                  >
                    Deduce →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
