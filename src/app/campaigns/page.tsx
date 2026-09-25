'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import AuthGateModal from '@/components/AuthGateModal';
import { FixturePreview } from '@/components/game/FixturePreview';
import { useSolvedFixtures } from '@/components/game/useSolvedFixtures';
import Footer from '@/components/Footer';
import { findCase, previewFromCase } from '@/lib/case-files';

interface Campaign {
  id: string;
  title: string;
  era: string;
  description: string;
  icon: string;
  accent: string;
  matchSlugs: string[];
}

const CAMPAIGNS: Campaign[] = [
  {
    id: 'cold-war-on-ice',
    title: 'The Cold War on Ice',
    era: '1972 – 1980',
    icon: '🏒',
    accent: 'text-sky-600',
    description:
      'High-stakes geopolitical drama played out across the rinks of Moscow, Lake Placid, and Prague.',
    matchSlugs: ['miracle-on-ice-1980', 'summit-series-1972'],
  },
  {
    id: 'olympic-miracles',
    title: 'Olympic Miracles',
    era: '1976 – 2008',
    icon: '🥇',
    accent: 'text-amber-600',
    description:
      'Generational athletes redefining greatness under the global Olympic spotlight.',
    matchSlugs: ['comaneci-1976', 'dream-team-1992', 'bolt-beijing-2008'],
  },
  {
    id: 'world-cup-epics',
    title: 'World Cup Epics',
    era: '1958 – 1986',
    icon: '⚽',
    accent: 'text-emerald-600',
    description:
      'Controversy, boy prodigies, and legendary goals that defined global football.',
    matchSlugs: ['pele-sweden-1958', 'hand-of-god-1986'],
  },
  {
    id: 'rivalries-of-the-century',
    title: 'Rivalries of the Century',
    era: '1974 – 1980',
    icon: '🥊',
    accent: 'text-rose-600',
    description:
      'Clashes of opposite personalities, styles, and philosophies under immense pressure.',
    matchSlugs: ['rumble-in-the-jungle-1974', 'wimbledon-epic-1980'],
  },
];

const STORYLINES = CAMPAIGNS.map((campaign) => ({
  ...campaign,
  matches: campaign.matchSlugs.flatMap((slug) => {
    const file = findCase(slug);
    return file ? [previewFromCase(file)] : [];
  }),
}));

export default function CampaignsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<unknown>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const solved = useSolvedFixtures(
    STORYLINES.flatMap((campaign) =>
      campaign.matches.map((match) => ({ key: match.key, lookupIds: match.lookupIds })),
    ),
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabaseClient.auth
      .getUser()
      .then(({ data }) => setCurrentUser(data.user ?? null))
      .catch(() => setCurrentUser(null));
  }, []);

  // Campaign fixtures live in the Scout archive, so guests are prompted to sign up first.
  const handleStartMatch = (slug: string) => {
    if (!currentUser) {
      setShowAuthGate(true);
      return;
    }
    router.push(`/?match=${slug}`);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        featureName="Storylines"
      />

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </Link>
            <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
              Storylines
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Daily Drop
            </Link>
            <Link href="/disciplines" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              By Sport
            </Link>
            <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Standings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Historical Storylines
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
            Storylines &amp; Eras
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-xl">
            Play through curated thematic collections of the most iconic clashes in sports history.
          </p>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORYLINES.map((campaign) => (
            <article
              key={campaign.id}
              className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl" aria-hidden>
                    {campaign.icon}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
                    {campaign.era}
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">
                  {campaign.title}
                </h2>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-medium">
                  {campaign.description}
                </p>

                {/* Fixture links inside campaign */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                    Fixtures in this storyline
                  </span>
                  {campaign.matches.map((match) => {
                    const record = solved[match.key];
                    return (
                      <FixturePreview
                        key={match.key}
                        title={match.title}
                        year={match.year}
                        context={match.context}
                        solvedScore={record?.score ?? null}
                        matchup={record?.matchup ?? null}
                        onDeduce={() => handleStartMatch(match.key)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {campaign.matches.length} Historical{' '}
                  {campaign.matches.length === 1 ? 'Match' : 'Matches'}
                </span>
                <button
                  type="button"
                  onClick={() => handleStartMatch(campaign.matches[0].key)}
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Start Campaign
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
