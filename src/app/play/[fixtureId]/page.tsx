import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { DailyDropArena } from "@/components/game/DailyDropArena";
import { FirstVisitBriefing } from "@/components/HowToPlayModal";
import { findCase } from "@/lib/case-files";
import { loadPublicArchive } from "@/lib/daily-drop";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlayParams = { fixtureId: string };
type PlaySearch = { campaign?: string | string[] };

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PlayParams>;
}): Promise<Metadata> {
  const { fixtureId } = await params;
  const file = findCase(fixtureId);
  const title = file ? `${file.title} — SportsHistoryClue` : "SportsHistoryClue";
  return { title, description: "Deducera den historiska matchen." };
}

export default async function PlayFixturePage({
  params,
  searchParams,
}: {
  params: Promise<PlayParams>;
  searchParams: Promise<PlaySearch>;
}) {
  const { fixtureId } = await params;
  const query = await searchParams;
  const campaignId = firstParam(query.campaign);
  if (!/^[a-z0-9-]{1,80}$/i.test(fixtureId)) notFound();

  const archive = await loadPublicArchive(fixtureId);
  if (!archive) notFound();

  return (
    <>
      <Header />
      <FirstVisitBriefing />
      <DailyDropArena
        key={`${fixtureId}:${campaignId}`}
        specificMatch={fixtureId}
        campaignId={campaignId}
        initialFixture={archive.challenge}
        playMode="fixture"
      />
    </>
  );
}
