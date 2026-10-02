"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { videoEmbedSrc } from "@/lib/video-embed";

interface HistoricalRecap {
  story: string;
  year: number | null;
  venue: string | null;
  finalScore: string | null;
  decisivePlay: string | null;
  videoUrl: string | null;
}

const EMPTY: HistoricalRecap = {
  story: "",
  year: null,
  venue: null,
  finalScore: null,
  decisivePlay: null,
  videoUrl: null,
};

export function HistoricalMiniRecap({
  challenge,
}: {
  challenge: {
    id: string;
    story?: string | null;
    category?: string;
    year?: number | null;
    venue?: string | null;
    finalScore?: string | null;
    decisivePlay?: string | null;
    videoUrl?: string | null;
  };
}) {
  const [recap, setRecap] = useState<HistoricalRecap>(() => ({
    story: challenge.story ?? "",
    year: challenge.year ?? null,
    venue: challenge.venue ?? null,
    finalScore: challenge.finalScore ?? null,
    decisivePlay: challenge.decisivePlay ?? null,
    videoUrl: challenge.videoUrl ?? null,
  }));

  useEffect(() => {
    if (challenge.story && challenge.venue) return;
    let cancelled = false;
    fetch(`/api/recap?challengeId=${encodeURIComponent(challenge.id)}`)
      .then(async (response) => {
        if (!response.ok) return EMPTY;
        return (await response.json()) as HistoricalRecap;
      })
      .then((next) => {
        if (!cancelled) setRecap(next);
      })
      .catch(() => {
        if (!cancelled) setRecap(EMPTY);
      });
    return () => {
      cancelled = true;
    };
  }, [challenge.id, challenge.story]);

  const facts = [
    { label: "Year", value: recap.year ? String(recap.year) : "—" },
    { label: "Venue", value: recap.venue || "—" },
    { label: "Final Score", value: recap.finalScore || "—" },
    { label: "Decisive Play", value: recap.decisivePlay || "—" },
  ];
  const embed = videoEmbedSrc(recap.videoUrl);

  return (
    <section className="min-h-[220px] rounded-2xl border border-zinc-200 bg-white p-5 text-left text-zinc-900 shadow-sm">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-600" aria-hidden />
        <h3 className="text-sm font-black uppercase tracking-tight">The Decisive Moment</h3>
      </div>
      <div className="mt-3 min-h-[7.5rem]">
        {recap.story ? (
          <p className="text-sm leading-relaxed text-zinc-700">{recap.story}</p>
        ) : (
          <div className="space-y-2" aria-hidden>
            <div className="h-3 rounded bg-zinc-100" />
            <div className="h-3 w-11/12 rounded bg-zinc-100" />
            <div className="h-3 w-10/12 rounded bg-zinc-100" />
            <div className="h-3 w-8/12 rounded bg-zinc-100" />
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{fact.label}</span>
            <span className="mt-1 block text-sm font-black text-zinc-900">{fact.value}</span>
          </div>
        ))}
      </div>
      {embed ? (
        <iframe
          className="mt-4 aspect-video w-full rounded-xl border border-zinc-200"
          src={embed}
          title="Archival reel"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : recap.videoUrl ? (
        <a
          href={recap.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700"
        >
          Watch Archival Reel
        </a>
      ) : null}
    </section>
  );
}
