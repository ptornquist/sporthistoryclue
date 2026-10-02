import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { ExpeditionDesk } from "@/components/game/ExpeditionDesk";
import {
  eventDictionary,
  expeditions,
  getExpedition,
  getExpeditionPuzzles,
} from "@/lib/catalog";
import { toPublicPuzzle } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plate?: string }>;
}

export async function generateStaticParams() {
  return expeditions.map((expedition) => ({ slug: expedition.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const expedition = getExpedition(slug);
  return { title: expedition?.title ?? "Expedition" };
}

export default async function ExpeditionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { plate } = await searchParams;
  const expedition = getExpedition(slug);
  if (!expedition) notFound();

  const puzzles = getExpeditionPuzzles(slug).map(toPublicPuzzle);
  const index = Math.max(
    0,
    puzzles.findIndex((puzzle) => puzzle.id === plate),
  );
  const currentIndex = plate ? (index === -1 ? 0 : index) : 0;
  const current = puzzles[currentIndex];
  const next = puzzles[currentIndex + 1];

  return (
    <>
      <Header />
      <ExpeditionDesk
      expedition={expedition}
      puzzles={puzzles}
      current={current}
      currentIndex={currentIndex}
      events={eventDictionary}
      nextHref={
        next
          ? `/expeditions/${slug}?plate=${next.id}`
          : "/expeditions"
      }
      nextLabel={next ? "Next plate" : "Back to expeditions"}
      />
    </>
  );
}
