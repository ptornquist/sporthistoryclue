'use client';

import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
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
import { cn } from '@/lib/utils';

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

const SPORT_TILE: Record<string, string> = {
  ice_hockey: 'bg-sky-50/80 border-sky-200 text-sky-950 hover:border-sky-400',
  football: 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:border-emerald-400',
  boxing: 'bg-rose-50/80 border-rose-200 text-rose-950 hover:border-rose-400',
  tennis: 'bg-amber-50/80 border-amber-200 text-amber-950 hover:border-amber-400',
  athletics: 'bg-indigo-50/80 border-indigo-200 text-indigo-950 hover:border-indigo-400',
};

const ACTIVE_TILE = 'ring-2 ring-zinc-900 border-2 border-zinc-900 shadow-md font-black scale-[1.02] hover:border-zinc-900';

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
      <Header />

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
          {SPORTS.map((sport) => {
            const selected = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSelectedSport(sport.id)}
                aria-pressed={selected}
                className={cn(
                  'relative p-3.5 rounded-2xl border-2 text-center transition-all',
                  SPORT_TILE[sport.id],
                  selected && ACTIVE_TILE,
                )}
              >
                {selected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black text-white">
                    ✓
                  </span>
                )}
                <span className="text-xl block mb-1" aria-hidden>
                  {sport.icon}
                </span>
                <span className={`text-xs block ${selected ? 'font-black' : 'font-bold'}`}>{sport.name}</span>
              </button>
            );
          })}
        </div>

        {/* List of Challenges for Selected Sport */}
        <div className="border-2 border-zinc-300 bg-white rounded-3xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4 border-b-2 border-zinc-200 pb-5">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">
                {activeSport?.name} Fixtures
              </h2>
              <p className="mt-0.5 text-xs font-medium text-zinc-600">{activeSport?.description}</p>
            </div>
            <span className="shrink-0 rounded-full border-2 border-zinc-900 bg-zinc-900 px-3 py-1 text-xs font-mono font-black text-white">
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
