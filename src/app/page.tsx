import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import { DailyDropArena } from '@/components/game/DailyDropArena';
import { FirstVisitBriefing } from '@/components/HowToPlayModal';
import { findCase } from '@/lib/case-files';
import { arrangeClueLadder } from '@/lib/clue-ladder';
import { sanitizeClues } from '@/lib/clue-sanitation';
import { loadDatedPublicDrop, loadPublicArchive, loadPublicChallengeById, loadTodayPublicDrop, utcTodayKey, type PublicDaily } from '@/lib/daily-drop';
import { selectChallengeOptions } from '@/lib/decoy-options';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type HomeSearchParams = {
  duel?: string | string[];
  pts?: string | string[];
  match?: string | string[];
  challenge?: string | string[];
  score?: string | string[];
  campaign?: string | string[];
  date?: string | string[];
  id?: string | string[];
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
  const duel = firstParam(params.duel);
  const pts = firstParam(params.pts);
  const match = firstParam(params.match);
  const title = duel
    ? `Can you beat @${duel} on SportsHistoryClue?`
    : 'SportsHistoryClue — The Daily Sports Deduction Puzzle';
  const description = 'Crack the mystery historical fixture in 6 clues or fewer.';
  const image = `/api/og?duel=${encodeURIComponent(duel)}&pts=${encodeURIComponent(pts)}&match=${encodeURIComponent(match)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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
  const challengeSlug = firstParam(params.challenge);
  if (!firstParam(params.match) && /^[a-z0-9-]{1,80}$/i.test(challengeSlug)) {
    redirect(`/play/${challengeSlug}`);
  }
  const specificMatch = firstParam(params.match);
  const campaignId = firstParam(params.campaign);
  const duel = firstParam(params.duel);
  const duelPts = Number.parseInt(firstParam(params.pts), 10) || 0;
  const requestedDate = firstParam(params.date);
  const requestedId = firstParam(params.id);
  const archiveId = /^[a-z0-9-]{1,80}$/i.test(requestedId) ? requestedId : '';
  const archiveDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate <= utcTodayKey() ? requestedDate : '';
  const training = firstParam(params.training) === '1';
  const archive = specificMatch ? await loadPublicArchive(specificMatch) : null;
  let datedDrop: PublicDaily | null = null;
  let todayDrop: PublicDaily | null = null;
  if (!specificMatch && archiveId) {
    datedDrop = await loadPublicChallengeById(archiveId);
  } else if (!specificMatch && archiveDate) {
    datedDrop = await loadDatedPublicDrop(archiveDate);
  } else if (!specificMatch) {
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching fixture for date:', today);
    todayDrop = await loadTodayPublicDrop();
    console.log('Active challenge loaded from Supabase:', todayDrop);
  }
  const file = findCase(specificMatch);
  const lockedOptions = archive?.challenge.optionsLocked === true;
  const initialFixture = archive?.challenge
    ? {
        ...archive.challenge,
        clues: lockedOptions
          ? archive.challenge.clues
          : arrangeClueLadder(
              sanitizeClues(archive.challenge.clues, {
                title: file?.title || archive.challenge.category,
                year: file?.year,
              }),
              { category: file?.context || archive.challenge.category },
            ),
        options: lockedOptions ? archive.challenge.options : selectChallengeOptions(archive.optionSource),
      }
    : datedDrop ?? todayDrop;

  return (
    <>
      <Header />
      <FirstVisitBriefing />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
            Laddar kluringen...
          </div>
        }
      >
        <DailyDropArena
          key={`${specificMatch}:${campaignId}:${duel}:${archiveDate}:${archiveId}:${training ? 'training' : 'play'}`}
          specificMatch={specificMatch}
          campaignId={campaignId}
          initialFixture={initialFixture}
          initialDuel={duel}
          initialDuelPts={duelPts}
          archiveDate={archiveDate}
          archiveId={archiveId}
          training={training}
        />
      </Suspense>
    </>
  );
}
