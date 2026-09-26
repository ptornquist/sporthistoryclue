'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { FixturePreview } from '@/components/game/FixturePreview';
import { useSolvedFixtures } from '@/components/game/useSolvedFixtures';
import Footer from '@/components/Footer';
import {
  CASE_FILES,
  categoryMatchesSport,
  previewFromArchive,
  previewFromCase,
  type FixturePreviewModel,
} from '@/lib/case-files';
import { arenaHref } from '@/lib/storylines';
import { ChallengeFriendModal } from '@/components/ChallengeFriendModal';

interface ChallengeItem {
  id: string;
  slug?: string | null;
  title?: string | null;
  category?: string | null;
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
  { id: 'boxing', name: 'Boxing', icon: '🥊', description: 'Heavyweight wars, long nights & upset champions.' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', description: 'Historic tiebreaks, Wimbledon grass epics & five-set marathons.' },
  { id: 'athletics', name: 'Athletics', icon: '🏃', description: 'Shattered world records and iconic Olympic track moments.' },
];

export default function DisciplinesPage() {
  const [selectedSport, setSelectedSport] = useState<string>('ice_hockey');
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<{
    slug: string;
    title: string;
    score: number | null;
    category: string;
  } | null>(null);

  const localFixtures = CASE_FILES.filter((file) => file.sport === selectedSport).map(previewFromCase);
  const remoteFixtures = challenges
    .filter((challenge) => categoryMatchesSport(challenge.category ?? undefined, selectedSport))
    .map((challenge) => previewFromArchive(challenge))
    .filter(
      (fixture) =>
        !localFixtures.some((local) => local.lookupIds.some((id) => fixture.lookupIds.includes(id))),
    );
  const fixtures: FixturePreviewModel[] = [...localFixtures, ...remoteFixtures];
  const solved = useSolvedFixtures(
    fixtures.map((fixture) => ({ key: fixture.key, lookupIds: fixture.lookupIds })),
  );

  useEffect(() => {
    const sport = new URLSearchParams(window.location.search).get('sport');
    if (!sport || !SPORTS.some((item) => item.id === sport)) return;
    const apply = window.setTimeout(() => setSelectedSport(sport), 0);
    return () => window.clearTimeout(apply);
  }, []);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabaseClient
          .from('challenges')
          .select('id, slug, title, category, year')
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
              By Sport
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Daily Drop
            </Link>
            <Link href="/campaigns" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Storylines
            </Link>
            <Link href="/standings" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Standings
            </Link>
            <Link href="/clubs" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Clubs
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Browse by Sport
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
              {fixtures.length} matches
            </span>
          </div>

          {fixtures.length === 0 && loading ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Loading fixtures…
            </div>
          ) : fixtures.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs font-medium">
              {error ?? 'No matches found for this sport yet. New fixtures added weekly.'}
            </div>
          ) : (
            <div className="space-y-3">
              {fixtures.map((fixture) => {
                const record = solved[fixture.key];
                return (
                  <FixturePreview
                    key={fixture.key}
                    density="row"
                    title={fixture.title}
                    year={fixture.year}
                    context={fixture.context}
                    solvedScore={record?.score ?? null}
                    matchup={record?.matchup ?? null}
                    href={arenaHref(fixture.lookupIds[0] || fixture.key)}
                    onChallenge={() =>
                      setChallengeTarget({
                        slug: fixture.lookupIds[0] || fixture.key,
                        title: fixture.title,
                        score: record?.score ?? null,
                        category: fixture.context,
                      })
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <ChallengeFriendModal
        isOpen={challengeTarget != null}
        onClose={() => setChallengeTarget(null)}
        matchSlug={challengeTarget?.slug ?? ""}
        matchTitle={challengeTarget?.title ?? ""}
        userScore={challengeTarget?.score}
        category={challengeTarget?.category}
      />
    </main>
  );
}
