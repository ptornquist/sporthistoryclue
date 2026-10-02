'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { ShopBoard } from '@/components/game/ShopBoard';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { loadShopBalance, purchaseBadge } from '@/lib/shop-catalog';

const BADGES = [
  {
    id: 'rookie_pin',
    name: 'ROOKIE PIN',
    cost: 500,
    icon: '📌',
    bg: 'bg-amber-100 border-amber-300 text-amber-900',
    desc: 'A first-season scout badge for clearing the opening fixtures.',
  },
  {
    id: 'archive_lantern',
    name: 'ARCHIVE LANTERN',
    cost: 1500,
    icon: '🏮',
    bg: 'bg-orange-100 border-orange-300 text-orange-900',
    desc: 'Lights the older drawers in the match archive.',
  },
  {
    id: 'gold_whistle',
    name: 'GOLD WHISTLE',
    cost: 3000,
    icon: '🪙',
    bg: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    desc: 'Marks a scout who reads the room before the climax.',
  },
  {
    id: 'hof_sash',
    name: 'HALL OF FAME SASH',
    cost: 7500,
    icon: '🎖️',
    bg: 'bg-purple-100 border-purple-300 text-purple-900',
    desc: 'Worn after a long career on the standings board.',
  },
  {
    id: 'chief_intel',
    name: 'CHIEF OF INTEL CREST',
    cost: 12000,
    icon: '👑',
    bg: 'bg-emerald-100 border-emerald-300 text-emerald-950',
    desc: 'The top shelf of the club shop.',
  },
];

export { BADGES };

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
      alert(data?.error || error?.message || 'Could not purchase');
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight">Scout Shop</h1>
        <p className="mt-1 text-xs font-medium text-zinc-500">
          Spend career points on unlockable badges.
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
