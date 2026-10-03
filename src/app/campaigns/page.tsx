'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { FixturePreview } from '@/components/game/FixturePreview';
import { useSolvedFixtures } from '@/components/game/useSolvedFixtures';
import Footer from '@/components/Footer';
import { findCase, mysteryFixtureLabel, previewFromCase } from '@/lib/case-files';
import { arenaHref, firstOpenMatch } from '@/lib/storylines';

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
    id: 'shl-klassiker',
    title: 'SHL-KLASSIKER & RIVALER',
    era: '2013 – 2015',
    icon: '🏒',
    accent: 'text-sky-600',
    description:
      'Avgörande ögonblick, nagelbitare och klassiska rivaliteter från den svenska hockeyscenen.',
    matchSlugs: ['slaget-i-sudden', 'guldkampen-i-norr'],
  },
  {
    id: 'allsvenska-derbyn',
    title: 'ALLSVENSKA DERBYN & DRAMAT',
    era: '2007 – 2018',
    icon: '⚽',
    accent: 'text-emerald-600',
    description: 'Känslor, läktarfest och oförglömliga guldstrider i Allsvenskan.',
    matchSlugs: ['sondagsmorgonen-stockholms-stad', 'guldstriden-sista-omgangen'],
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
  const solved = useSolvedFixtures(
    STORYLINES.flatMap((campaign) =>
      campaign.matches.map((match) => ({ key: match.key, lookupIds: match.lookupIds })),
    ),
  );

  return (
    <main className="min-h-screen overflow-x-hidden w-full max-w-full bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto px-4 py-6 overflow-x-hidden">
        <div className="mb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Historiska kampanjer
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
            Kampanjer &amp; epoker
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-xl">
            Spela tematiska samlingar av idrottshistoriens största klassiker.
          </p>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORYLINES.map((campaign) => (
            <article
              key={campaign.id}
              className="w-full max-w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all"
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
                <h2 className="w-full max-w-full break-words text-xl font-black uppercase tracking-tight text-zinc-900">
                  {campaign.title}
                </h2>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-medium">
                  {campaign.description}
                </p>

                {/* Fixture links inside campaign */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                    Matcher i den här kampanjen
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
                        mysteryLabel={mysteryFixtureLabel(findCase(match.key)?.sport)}
                        href={arenaHref(match.key, campaign.id)}
                        clueCount={false}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex w-full max-w-full flex-col justify-between gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center">
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {campaign.matches.length}{' '}
                  {campaign.matches.length === 1 ? 'historisk match' : 'historiska matcher'}
                </span>
                <Link
                  href={arenaHref(
                    (firstOpenMatch(campaign.matches, solved) ?? campaign.matches[0]).key,
                    campaign.id,
                  )}
                  className="w-full max-w-full px-4 py-2 bg-zinc-900 text-white hover:bg-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors sm:w-auto text-center"
                >
                  Starta kampanj
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
