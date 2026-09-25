import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DailyDropArena } from '@/components/game/DailyDropArena';
import { loadPublicArchive } from '@/lib/daily-drop';

type HomeSearchParams = {
  duel?: string | string[];
  pts?: string | string[];
  match?: string | string[];
  campaign?: string | string[];
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
  const title = duel
    ? `Can you beat @${duel} on SportsHistoryClue?`
    : 'SportsHistoryClue — The Daily Sports Deduction Puzzle';
  const description = 'Crack the mystery historical fixture in 6 clues or fewer.';
  const image = `/api/og?duel=${encodeURIComponent(duel)}&pts=${encodeURIComponent(pts)}`;

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
  const specificMatch = firstParam(params.match);
  const campaignId = firstParam(params.campaign);
  const archive = specificMatch ? await loadPublicArchive(specificMatch) : null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
          Loading Drop...
        </div>
      }
    >
      <DailyDropArena
        key={`${specificMatch}:${campaignId}`}
        specificMatch={specificMatch}
        campaignId={campaignId}
        initialFixture={archive?.challenge ?? null}
      />
    </Suspense>
  );
}
