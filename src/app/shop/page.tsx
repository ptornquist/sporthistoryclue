"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FRAMES,
  TITLES,
  VIP_ITEMS,
  isEquipped,
  isUnlocked,
  rarityClassName,
  type CosmeticItem,
  type CosmeticKind,
} from "@/lib/cosmetics";
import { useCosmeticWallet } from "@/lib/useCosmeticWallet";

const TABS: { id: CosmeticKind; label: string }[] = [
  { id: "title", label: "Titles" },
  { id: "frame", label: "Frames" },
  { id: "vip", label: "VIP" },
];

function itemsFor(tab: CosmeticKind): CosmeticItem[] {
  if (tab === "frame") return FRAMES;
  if (tab === "vip") return VIP_ITEMS;
  return TITLES;
}

export default function ProShopPage() {
  const { wallet, notice, purchase, equip } = useCosmeticWallet();
  const [tab, setTab] = useState<CosmeticKind>("title");
  const items = itemsFor(tab);

  const onAction = async (item: CosmeticItem) => {
    if (isUnlocked(wallet, item)) {
      if (item.kind === "vip" || isEquipped(wallet, item)) return;
      await equip(item.id);
      return;
    }
    await purchase(item.id);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/80">
              SportsHistoryClue
            </Link>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">The Pro Shop</h1>
            <p className="mt-1 text-sm text-zinc-400">Customize your scout profile and support the game.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber-300/50 bg-amber-300/10 px-4 py-2 text-sm font-black text-amber-200">
              🟡 {wallet.coins.toLocaleString()} Coins
            </span>
            <Link href="/profile" className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white">
              Scout Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex gap-2" role="tablist" aria-label="Pro Shop catalog">
          {TABS.map((entry) => {
            const active = tab === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(entry.id)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider ${
                  active ? "bg-amber-300 text-zinc-950" : "border border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const unlocked = isUnlocked(wallet, item);
            const equipped = isEquipped(wallet, item);
            const ownedVip = item.kind === "vip" && unlocked;
            const label = equipped ? "Equipped" : ownedVip ? "Owned" : unlocked ? "Equip" : "Purchase";
            return (
              <article
                key={item.id}
                className={`flex flex-col rounded-3xl border bg-zinc-900/80 p-5 ${rarityClassName(item.rarity)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-[0.18em] ${rarityClassName(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  <span className="text-3xl" aria-hidden>
                    {item.emoji}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-black text-white">{item.name}</h2>
                <p className="mt-2 flex-1 text-sm text-zinc-400">{item.quote}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-xs font-black text-amber-200">🟡 {item.cost.toLocaleString()} Coins</span>
                  <button
                    type="button"
                    onClick={() => onAction(item)}
                    disabled={equipped || ownedVip}
                    className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider disabled:cursor-default ${
                      equipped || ownedVip
                        ? "bg-blue-600 text-white"
                        : unlocked
                          ? "bg-emerald-500 text-zinc-950"
                          : "bg-amber-300 text-zinc-950 hover:bg-amber-200"
                    }`}
                  >
                    {label}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {notice && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-rose-400/40 bg-zinc-900 px-5 py-3 text-sm font-bold text-rose-100 shadow-lg"
        >
          {notice}
        </div>
      )}
    </main>
  );
}
