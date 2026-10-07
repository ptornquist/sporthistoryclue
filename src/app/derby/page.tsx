"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScopeToggle } from "@/components/ScopeToggle";
import { SupportersTable } from "@/components/derby/SupportersTable";
import type { BoardScope } from "@/lib/board-scope";
import { useI18n } from "@/lib/i18n/use-i18n";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import {
  FAVORITE_CLUB_KEY,
  isKnownClub,
  rankClubs,
  type ClubMembership,
  type DerbyMode,
} from "@/lib/premier-league";

export default function DerbyPage() {
  const { messages } = useI18n();
  const [mode, setMode] = useState<DerbyMode>("total");
  const [scope, setScope] = useState<BoardScope>("world");
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const saved = window.localStorage.getItem(FAVORITE_CLUB_KEY);
      if (isKnownClub(saved)) setHighlightId(saved);

      if (!isSupabaseConfigured) return;

      try {
        const { data: auth } = await supabaseClient.auth.getUser();
        if (auth.user) {
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("favorite_club")
            .eq("id", auth.user.id)
            .maybeSingle();
          const clubId = profile?.favorite_club;
          if (typeof clubId === "string" && isKnownClub(clubId)) {
            setHighlightId(clubId);
            window.localStorage.setItem(FAVORITE_CLUB_KEY, clubId);
          }
        }

        const { data, error } = await supabaseClient
          .from("profiles")
          .select("favorite_club, total_score")
          .not("favorite_club", "is", null);
        if (!error && data) {
          setMemberships(
            data.flatMap((row) => {
              const favorite = row.favorite_club;
              if (typeof favorite !== "string") return [];
              return [{ favorite_club: favorite, total_score: row.total_score ?? 0 }];
            }),
          );
        }
      } catch {
        setMemberships([]);
      }
    };

    void load();
  }, []);

  const rows = rankClubs(memberships, mode, scope);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
              {messages.derby.title}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              {messages.derby.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <ScopeToggle
              value={scope}
              onChange={setScope}
              swedenLabel={messages.scope.sweden}
              worldLabel={messages.scope.international}
              ariaLabel={messages.derby.scopeToggle}
            />
            <div className="flex self-start rounded-2xl bg-zinc-100 p-1" role="group" aria-label={messages.derby.tableToggle}>
              <button
                type="button"
                aria-pressed={mode === "total"}
                onClick={() => setMode("total")}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  mode === "total" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {messages.derby.total}
              </button>
              <button
                type="button"
                aria-pressed={mode === "average"}
                onClick={() => setMode("average")}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  mode === "average" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {messages.derby.average}
              </button>
            </div>
          </div>
        </div>

        <section className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm sm:p-6">
          <SupportersTable
            rows={rows}
            highlightId={highlightId}
            labels={{
              rank: messages.derby.rank,
              club: messages.derby.club,
              scouts: messages.derby.scouts,
              points: messages.derby.clubPoints,
              average: messages.derby.averagePerScout,
            }}
          />
        </section>
      </div>
      <Footer />
    </main>
  );
}
