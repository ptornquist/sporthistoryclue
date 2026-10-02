'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { ShopBoard } from '@/components/game/ShopBoard';
import { loadShopBalance } from '@/lib/shop-catalog';

export default function ShopPage() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    loadShopBalance().then((score) => {
      if (active) setBalance(score);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight">Scout Shop</h1>
        <p className="mt-1 text-xs font-medium text-zinc-500">
          Spend career points on unlockable badges.
        </p>
        <div className="mt-8">
          <ShopBoard balance={balance} />
        </div>
      </div>
    </main>
  );
}
