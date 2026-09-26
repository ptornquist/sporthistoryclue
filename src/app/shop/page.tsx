"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const COIN_BADGE =
  "bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold px-3 py-1 rounded-xl inline-flex items-center gap-1.5";

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
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900">THE PRO SHOP</h1>
                <p className="mt-1 text-sm text-zinc-500">Customize your scout identity and unlock sports memorabilia.</p>
              </div>
              <span className={COIN_BADGE}>🟡 {wallet.coins.toLocaleString()} Coins</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Pro Shop catalog">
              {TABS.map((entry) => {
                const active = tab === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(entry.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                      active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const unlocked = isUnlocked(wallet, item);
              const equipped = isEquipped(wallet, item);
              const ownedVip = item.kind === "vip" && unlocked;
              const label = equipped ? "✓ Equipped" : ownedVip ? "✓ Owned" : unlocked ? "Equip" : "Purchase";
              return (
                <article
                  key={item.id}
                  className={`flex flex-col rounded-3xl border p-6 shadow-sm ${rarityClassName(item.rarity)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-xl border px-2 py-0.5 text-[10px] font-black tracking-[0.18em] ${rarityClassName(item.rarity)}`}>
                      {item.rarity}
                    </span>
                    <span className="text-3xl" aria-hidden>
                      {item.emoji}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-black text-zinc-900">{item.name}</h2>
                  <p className="mt-2 flex-1 text-sm text-zinc-600">{item.quote}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className={COIN_BADGE}>🟡 {item.cost.toLocaleString()} Coins</span>
                    <button
                      type="button"
                      onClick={() => onAction(item)}
                      disabled={equipped || ownedVip}
                      className={`rounded-2xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider disabled:cursor-default ${
                        equipped || ownedVip
                          ? "bg-emerald-600 text-white"
                          : unlocked
                            ? "border border-zinc-300 text-zinc-800 hover:border-zinc-400"
                            : "bg-blue-600 text-white hover:bg-blue-700"
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
      </div>
      <Footer />

      {notice && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 shadow-sm"
        >
          {notice}
        </div>
      )}
    </main>
  );
}
