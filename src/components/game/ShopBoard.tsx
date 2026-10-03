import { formatShopBalance } from "@/lib/shop-catalog";

export interface ShopBadge {
  id: string;
  name: string;
  cost: number;
  icon: string;
  bg: string;
  desc: string;
}

export function ShopBoard({
  balance,
  badges,
  ownedIds = new Set<string>(),
  onPurchase,
}: {
  balance: number | null;
  badges: ShopBadge[];
  ownedIds?: ReadonlySet<string>;
  onPurchase?: (badgeId: string, cost: number) => void;
}) {
  return (
    <section>
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <span className="block text-[11px] font-mono font-bold uppercase text-zinc-400">Karriärpoäng</span>
        <p className="mt-1 font-mono text-4xl font-black text-blue-600">{formatShopBalance(balance)}</p>
        <p className="mt-2 text-xs font-medium text-zinc-500">
          {balance == null
            ? "Logga in för att handla med poängen på din profil."
            : "Poäng från avklarade matcher är redo att användas."}
        </p>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-black uppercase tracking-tight">Utmärkelser</h2>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {badges.map((badge) => {
          const owned = ownedIds.has(badge.id);
          const affordable = balance != null && balance >= badge.cost;
          const price = `${badge.cost.toLocaleString("en-US")} poäng`;
          return (
            <li key={badge.id} className={`flex flex-col gap-4 rounded-2xl border-2 p-5 sm:flex-row sm:items-center ${badge.bg}`}>
              <span className="text-3xl p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-200" aria-hidden="true">
                {badge.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black tracking-wide">{badge.name}</p>
                <p className="mt-1 text-xs font-medium">{badge.desc}</p>
                <p className="mt-2 font-mono text-xs font-black">{price}</p>
              </div>
              <div className="shrink-0">
                {owned ? (
                  <span className="px-3 py-1.5 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 rounded-xl font-black text-xs">
                    ✓ ÄGD
                  </span>
                ) : affordable ? (
                  <button
                    type="button"
                    onClick={() => onPurchase?.(badge.id, badge.cost)}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white border-2 border-zinc-950 rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5"
                  >
                    LÅS UPP FÖR {price}
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-400 rounded-xl font-bold text-xs uppercase">
                    KRÄVER {price}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
