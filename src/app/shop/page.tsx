'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { ShopBoard } from '@/components/game/ShopBoard';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { loadShopBalance, purchaseBadge } from '@/lib/shop-catalog';
import { SHOP_MEDALS } from '@/lib/scout-badges';

export const BADGES = SHOP_MEDALS;

export default function ShopPage() {
  const [careerScore, setCareerScore] = useState<number | null>(null);
  const [ownedBadges, setOwnedBadges] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    loadShopBalance().then((score) => {
      if (active) setCareerScore(score);
    });

    if (isSupabaseConfigured) {
      const supabase = supabaseClient;
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !active) return;
        const { data: ownedData } = await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', user.id);
        const ownedIds = new Set(ownedData?.map((badge) => badge.badge_id) || []);
        if (active) setOwnedBadges(ownedIds);
      })().catch((error) => {
        console.error('Failed to load owned badges:', error);
      });
    }

    return () => {
      active = false;
    };
  }, []);

  const handlePurchase = async (badgeId: string, cost: number) => {
    const { data, error } = await purchaseBadge(badgeId, cost);
    if (data?.success) {
      setCareerScore(data.new_score ?? 0);
      setOwnedBadges((prev) => new Set([...prev, badgeId]));
    } else {
      alert(data?.error || error?.message || 'Kunde inte handla');
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight">Shopen</h1>
        <p className="mt-1 text-xs font-medium text-zinc-500">
          Handla medaljer för karriärpoäng.
        </p>
        <div className="mt-8">
          <ShopBoard
            balance={careerScore}
            badges={BADGES}
            ownedIds={ownedBadges}
            onPurchase={handlePurchase}
          />
        </div>
      </div>
    </main>
  );
}
