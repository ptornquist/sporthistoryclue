'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import AuthGateModal from '@/components/AuthGateModal';

interface CampaignMatch {
  slug: string;
  title: string;
  year: number;
  category: string;
}

interface Campaign {
  id: string;
  title: string;
  era: string;
  description: string;
  icon: string;
  accent: string;
  matches: CampaignMatch[];
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
    matches: [
      { slug: 'miracle-on-ice-1980', title: 'USA vs Soviet Union (Winter Olympics)', year: 1980, category: 'Ice Hockey' },
      { slug: 'summit-series-1972', title: 'Canada vs Soviet Union (Game 8)', year: 1972, category: 'Ice Hockey' },
    ],
  },
  {
    id: 'olympic-miracles',
    title: 'Olympic Miracles',
    era: '1976 – 2008',
    icon: '🥇',
    accent: 'text-amber-600',
    description:
      'Generational athletes redefining greatness under the global Olympic spotlight.',
    matches: [
      { slug: 'comaneci-1976', title: 'Nadia Comăneci scores the first perfect 10', year: 1976, category: 'Gymnastics' },
      { slug: 'dream-team-1992', title: 'USA Dream Team vs Croatia', year: 1992, category: 'Basketball' },
      { slug: 'bolt-beijing-2008', title: 'Usain Bolt 100m World Record', year: 2008, category: 'Athletics' },
    ],
  },
  {
    id: 'world-cup-epics',
    title: 'World Cup Epics',
    era: '1958 – 1986',
    icon: '⚽',
    accent: 'text-emerald-600',
    description:
      'Controversy, boy prodigies, and legendary goals that defined global football.',
    matches: [
      { slug: 'pele-sweden-1958', title: 'Brazil vs Sweden (Pelé’s Breakthrough)', year: 1958, category: 'Football' },
      { slug: 'hand-of-god-1986', title: 'Argentina vs England (Maradona Drama)', year: 1986, category: 'Football' },
    ],
  },
  {
    id: 'rivalries-of-the-century',
    title: 'Rivalries of the Century',
    era: '1974 – 1980',
    icon: '🥊',
    accent: 'text-rose-600',
    description:
      'Clashes of opposite personalities, styles, and philosophies under immense pressure.',
    matches: [
      { slug: 'rumble-in-the-jungle-1974', title: 'Muhammad Ali vs George Foreman', year: 1974, category: 'Boxing' },
      { slug: 'wimbledon-epic-1980', title: 'Björn Borg vs John McEnroe', year: 1980, category: 'Tennis' },
    ],
  },
];

export default function CampaignsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<unknown>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

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
        featureName="Campaigns & Eras"
      />

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </Link>
            <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
              Campaigns
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Daily Drop
            </Link>
            <Link href="/disciplines" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
              Disciplines
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
            Historical Storylines
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
            Campaigns &amp; Eras
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-xl">
            Play through curated thematic collections of the most iconic clashes in sports history.
          </p>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAMPAIGNS.map((campaign) => (
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
                  {campaign.matches.map((match) => (
                    <button
                      key={match.slug}
                      type="button"
                      onClick={() => handleStartMatch(match.slug)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-blue-50 border border-zinc-100 hover:border-blue-200 transition-colors text-left group"
                    >
                      <div>
                        <span className="text-xs font-bold text-zinc-800 group-hover:text-blue-600 block">
                          {match.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {match.year} · {match.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Play →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {campaign.matches.length} Historical{' '}
                  {campaign.matches.length === 1 ? 'Match' : 'Matches'}
                </span>
                <button
                  type="button"
                  onClick={() => handleStartMatch(campaign.matches[0].slug)}
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Start Campaign
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
