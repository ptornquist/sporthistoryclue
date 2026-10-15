"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScoutCard } from "@/components/game/ScoutCard";
import { ClubAllegianceCard } from "@/components/derby/ClubAllegianceCard";
import { defaultWallet } from "@/lib/cosmetics";
import { ensureScoutProfile } from "@/lib/ensure-profile";
import { setLocale } from "@/lib/i18n/locale-store";
import { isScoutCountry, setCountry } from "@/lib/i18n/profile-preferences";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

/** Working profile when the database row is missing or the page cannot render its loaded data. */
export function ProfileRecovery({ onRetry }: { onRetry?: () => void }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [handle, setHandle] = useState("scout");
  const [email, setEmail] = useState<string | null>(null);
  const [clubs, setClubs] = useState<{ hockey: string | null; football: string | null; international: string | null }>({
    hockey: null,
    football: null,
    international: null,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      try {
        const saved = window.localStorage.getItem("shc_handle");
        if (saved && !cancelled) setHandle(saved);
      } catch {
        // Storage can be blocked. The default handle still renders.
      }
      if (!isSupabaseConfigured) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const auth = await supabaseClient.auth.getUser();
        const user = auth.data?.user ?? null;
        if (!user || cancelled) return;
        const profile = await ensureScoutProfile(user);
        if (cancelled) return;
        setUserId(user.id);
        setEmail(user.email ?? null);
        setHandle(profile.username || "scout");
        setClubs({
          hockey: profile.hockey_club,
          football: profile.football_club,
          international: profile.international_club,
        });
        if (profile.locale === "sv" || profile.locale === "en") setLocale(profile.locale);
        if (profile.country && isScoutCountry(profile.country)) setCountry(profile.country);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          <ScoutCard
            handle={handle || "scout"}
            email={email}
            wallet={defaultWallet()}
            careerScore={0}
            solvedCount={0}
            currentStreak={0}
            bestStreak={0}
            solvedSlugs={[]}
            solvedScores={[]}
            badgeTimes={{}}
            signedIn={Boolean(userId)}
            profileReady={ready}
            onEquip={() => {}}
          />
          <ClubAllegianceCard
            userId={userId}
            initialClubs={clubs}
            onSaved={() => {}}
          />
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-700"
            >
              Försök igen
            </button>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
