"use client";

import { useEffect, useRef, useState } from "react";
import {
  applyEquip,
  applyPurchase,
  applySolveReward,
  findCosmetic,
  isUnlocked,
  loadWallet,
  saveWallet,
  walletFromProfile,
  type CosmeticWallet,
} from "@/lib/cosmetics";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

interface CosmeticPayload {
  earned?: number;
  coins?: number | null;
  unlocked_titles?: string[] | null;
  unlocked_frames?: string[] | null;
  equipped_title?: string | null;
  equipped_frame?: string | null;
  total_score?: number | null;
  matches_solved?: number | null;
  streak?: number | null;
  best_streak?: number | null;
}

function rpcMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST202" ||
    message.includes("could not find the function") ||
    message.includes("does not exist")
  );
}

function payloadWallet(data: CosmeticPayload, grantedMatchIds: string[]): CosmeticWallet {
  return {
    ...walletFromProfile(data),
    grantedMatchIds,
  };
}

export function useCosmeticWallet() {
  const [wallet, setWallet] = useState<CosmeticWallet>(() => ({
    coins: 0,
    unlockedTitles: ["rookie"],
    unlockedFrames: ["standard"],
    equippedTitle: "rookie",
    equippedFrame: "standard",
    totalScore: 0,
    matchesSolved: 0,
    streak: 0,
    bestStreak: 0,
    grantedMatchIds: [],
  }));
  const [userId, setUserId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const walletRef = useRef(wallet);
  const userIdRef = useRef<string | null>(null);

  const commit = (next: CosmeticWallet) => {
    walletRef.current = next;
    setWallet(next);
    saveWallet(next);
  };

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      const local = loadWallet();
      if (cancelled) return;
      commit(local);
      if (!isSupabaseConfigured) return;
      try {
        const { data: auth } = await supabaseClient.auth.getUser();
        const user = auth.user;
        if (!user || cancelled) return;
        userIdRef.current = user.id;
        if (!cancelled) setUserId(user.id);
        const { data, error } = await supabaseClient
          .from("profiles")
          .select(
            "coins, unlocked_titles, unlocked_frames, equipped_title, equipped_frame, total_score, matches_solved, streak, best_streak",
          )
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled || error || !data) return;
        commit(payloadWallet(data, local.grantedMatchIds));
      } catch {
        // Local wallet already covers guest and offline play.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const purchase = async (itemId: string) => {
    const current = walletRef.current;
    const preview = applyPurchase(current, itemId);
    if (!preview.ok && preview.reason === "coins") {
      flash("Not enough coins for that item.");
      return preview;
    }
    if (!preview.ok) return preview;
    const item = findCosmetic(itemId);
    if (item && isUnlocked(current, item)) return preview;

    if (userIdRef.current && isSupabaseConfigured) {
      const { data, error } = await supabaseClient.rpc("purchase_cosmetic", { item_id: itemId });
      if (!error && data && typeof data === "object") {
        const next = payloadWallet(data as CosmeticPayload, current.grantedMatchIds);
        commit(next);
        return { wallet: next, ok: true as const };
      }
      if (error && /insufficient/i.test(error.message ?? "")) {
        flash("Not enough coins for that item.");
        return { wallet: current, ok: false as const, reason: "coins" as const };
      }
      if (error && !rpcMissing(error)) {
        flash("Could not complete that purchase.");
        return { wallet: current, ok: false as const, reason: "missing" as const };
      }
    }

    commit(preview.wallet);
    return preview;
  };

  const equip = async (itemId: string) => {
    const current = walletRef.current;
    const nextLocal = applyEquip(current, itemId);
    if (nextLocal === current) return current;

    if (userIdRef.current && isSupabaseConfigured) {
      const { data, error } = await supabaseClient.rpc("equip_cosmetic", { item_id: itemId });
      if (!error && data && typeof data === "object") {
        const next = payloadWallet(data as CosmeticPayload, current.grantedMatchIds);
        commit(next);
        return next;
      }
      if (error && !rpcMissing(error)) {
        flash("Could not equip that item.");
        return current;
      }
    }

    commit(nextLocal);
    return nextLocal;
  };

  const awardSolve = async (input: {
    matchId: string;
    pointScore: number;
    isDaily: boolean;
    streakContinued: boolean;
    duelWon: boolean;
    newStreak: number;
  }) => {
    const current = walletRef.current;
    const preview = applySolveReward(current, input);

    if (userIdRef.current && isSupabaseConfigured) {
      const { data, error } = await supabaseClient.rpc("award_solve_coins", {
        match_id: input.matchId,
        point_score: input.pointScore,
        is_daily: input.isDaily,
        streak_continued: input.streakContinued,
        duel_won: input.duelWon,
        new_streak: input.newStreak,
      });
      if (!error && data && typeof data === "object") {
        const payload = data as CosmeticPayload;
        const next = payloadWallet(payload, preview.wallet.grantedMatchIds);
        commit(next);
        return { wallet: next, earned: payload.earned ?? preview.earned };
      }
      if (error && !rpcMissing(error)) {
        return { wallet: current, earned: 0 };
      }
    }

    commit(preview.wallet);
    return preview;
  };

  return { wallet, userId, notice, purchase, equip, awardSolve, flash };
}
