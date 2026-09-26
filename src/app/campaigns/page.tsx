'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FixturePreview } from '@/components/game/FixturePreview';
import { useSolvedFixtures } from '@/components/game/useSolvedFixtures';
import Footer from '@/components/Footer';
import { ChallengeFriendModal } from '@/components/ChallengeFriendModal';
import { arenaHref, firstOpenMatch, STORYLINES, type Storyline } from '@/lib/storylines';

export default function CampaignsPage() {
  const [storyChallenge, setStoryChallenge] = useState<Storyline | null>(null);
  const solved = useSolvedFixtures(
    STORYLINES.flatMap((campaign) =>
      campaign.matches.map((match) => ({ key: match.key, lookupIds: match.lookupIds })),
    ),
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
            <Link href="/standings" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
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
                        href={arenaHref(match.lookupIds[0] || match.key, campaign.id)}
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
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStoryChallenge(campaign)}
                    className="border border-zinc-200 hover:border-blue-400 text-zinc-700 hover:text-blue-600 px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    ⚔️ Challenge Storyline
                  </button>
                  <Link
                    href={arenaHref(
                      (firstOpenMatch(campaign.matches, solved)?.lookupIds[0]) || campaign.matches[0].key,
                      campaign.id,
                    )}
                    className="px-4 py-2 bg-zinc-900 text-white hover:bg-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Start Campaign
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
      {storyChallenge && (
        <ChallengeFriendModal
          isOpen
          onClose={() => setStoryChallenge(null)}
          matchSlug={storyChallenge.matches[0]?.lookupIds[0] || storyChallenge.matches[0]?.key || storyChallenge.id}
          matchTitle={storyChallenge.title}
          category={storyChallenge.era}
          campaignId={storyChallenge.id}
        />
      )}
    </main>
  );
}
