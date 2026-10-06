import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DailyDropArena } from '@/components/game/DailyDropArena';
import { ogChallengeHeadline, ogChallengeSubtitle } from '@/lib/challenge-link';
import { findCase } from '@/lib/case-files';
import { loadPublicArchive, utcTodayKey } from '@/lib/daily-drop';
import { selectChallengeOptions } from '@/lib/decoy-options';
import { presentClues } from '@/lib/present-clues';
import { swedishSurface } from '@/lib/swedish-surface';

type HomeSearchParams = {
  duel?: string | string[];
  pts?: string | string[];
  match?: string | string[];
  campaign?: string | string[];
  date?: string | string[];
  training?: string | string[];
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const duel = firstParam(params.duel).replace(/^@/, '').trim();
  const pts = firstParam(params.pts);
  const match = firstParam(params.match);
  const parsedPts = Number.parseInt(pts, 10);
  const title = duel ? ogChallengeHeadline(duel, match || null) : 'Dagens Kluring';
  const description = duel
    ? ogChallengeSubtitle(Number.isFinite(parsedPts) ? parsedPts : 0)
    : 'Sex ledtrådar. Kan du knäcka dagens kluring?';
  const image = `/api/og?duel=${encodeURIComponent(duel)}&pts=${encodeURIComponent(pts)}&match=${encodeURIComponent(match)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: 'sv_SE',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const specificMatch = firstParam(params.match);
  const campaignId = firstParam(params.campaign);
  const duel = firstParam(params.duel);
  const duelPts = Number.parseInt(firstParam(params.pts), 10) || 0;
  const requestedDate = firstParam(params.date);
  const archiveDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate <= utcTodayKey() ? requestedDate : '';
  const training = firstParam(params.training) === '1';
  const archive = specificMatch ? await loadPublicArchive(specificMatch) : null;
  const file = findCase(specificMatch);
  const initialFixture = archive?.challenge
    ? {
        ...archive.challenge,
        category: swedishSurface(file?.context || archive.challenge.category),
        clues: presentClues(archive.challenge.id, archive.challenge.clues, {
          title: file?.title || archive.challenge.category,
          year: file?.year,
          category: file?.context || archive.challenge.category,
        }),
        options: selectChallengeOptions(archive.optionSource),
      }
    : null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
          Laddar kluringen...
        </div>
      }
    >
      <DailyDropArena
        key={`${specificMatch}:${campaignId}:${duel}:${archiveDate}:${training ? 'training' : 'play'}`}
        specificMatch={specificMatch}
        campaignId={campaignId}
        initialFixture={initialFixture}
        initialDuel={duel}
        initialDuelPts={duelPts}
        archiveDate={archiveDate}
        training={training}
      />
    </Suspense>
  );
}
