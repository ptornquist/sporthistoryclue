"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SupportersTable } from "@/components/derby/SupportersTable";
import { useI18n } from "@/lib/i18n/use-i18n";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import {
  isClubOnBoard,
  membershipsForBoard,
  rankBoard,
  storageKeyForBoard,
  type DerbyBoard,
  type DerbyMode,
  type DerbyScoreRow,
} from "@/lib/premier-league";

export default function DerbyPage() {
  const { messages } = useI18n();
  const [mode, setMode] = useState<DerbyMode>("total");
  const [board, setBoard] = useState<DerbyBoard>("hockey");
  const [scoreRows, setScoreRows] = useState<DerbyScoreRow[]>([]);
  const [highlights, setHighlights] = useState<Partial<Record<DerbyBoard, string>>>({});

  useEffect(() => {
    const load = async () => {
      const stored: Partial<Record<DerbyBoard, string>> = {};
      for (const name of ["hockey", "football", "international"] as const) {
        const value = window.localStorage.getItem(storageKeyForBoard(name));
        if (isClubOnBoard(value, name)) stored[name] = value;
      }
      setHighlights(stored);

      if (!isSupabaseConfigured) return;

      try {
        const { data: auth } = await supabaseClient.auth.getUser();
        if (auth.user) {
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("hockey_club, football_club, international_club, favorite_club")
            .eq("id", auth.user.id)
            .maybeSingle();
          const next = { ...stored };
          for (const name of ["hockey", "football", "international"] as const) {
            const column = profile?.[`${name}_club`];
            const value = typeof column === "string" ? column : name === "football" ? profile?.favorite_club : null;
            if (typeof value === "string" && isClubOnBoard(value, name)) {
              next[name] = value;
              window.localStorage.setItem(storageKeyForBoard(name), value);
            }
          }
          setHighlights(next);
        }

        const wide = await supabaseClient
          .from("profiles")
          .select("hockey_club, football_club, international_club, hockey_score, football_score, international_score, favorite_club, total_score");
        if (!wide.error && wide.data) {
          setScoreRows(wide.data as DerbyScoreRow[]);
          return;
        }
        const narrow = await supabaseClient
          .from("profiles")
          .select("favorite_club, total_score")
          .not("favorite_club", "is", null);
        if (!narrow.error && narrow.data) setScoreRows(narrow.data as DerbyScoreRow[]);
      } catch {
        setScoreRows([]);
      }
    };

    void load();
  }, []);

  const rows = rankBoard(membershipsForBoard(scoreRows, board), board, mode);
  const highlightId = highlights[board] ?? null;

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
            <div className="flex self-start rounded-2xl bg-zinc-100 p-1" role="group" aria-label={messages.derby.scopeToggle}>
              {([
                ["hockey", messages.derby.boardHockey],
                ["football", messages.derby.boardFootball],
                ["international", messages.derby.boardInternational],
              ] as const).map(([name, label]) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={board === name}
                  onClick={() => setBoard(name)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider ${
                    board === name ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
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
