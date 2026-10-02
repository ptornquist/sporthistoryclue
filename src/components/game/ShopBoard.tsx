import { formatShopBalance, SHOP_ITEMS, type ShopItem } from "@/lib/shop-catalog";

export function ShopBoard({
  balance,
  items = SHOP_ITEMS,
}: {
  balance: number | null;
  items?: ShopItem[];
}) {
  return (
    <section>
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <span className="block text-[11px] font-mono font-bold uppercase text-zinc-400">Career score</span>
        <p className="mt-1 font-mono text-4xl font-black text-blue-600">{formatShopBalance(balance)}</p>
        <p className="mt-2 text-xs font-medium text-zinc-500">
          {balance == null
            ? "Sign in to spend the points on your scout profile."
            : "Points from cleared fixtures are ready to spend."}
        </p>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-black uppercase tracking-tight">Unlockable badges</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const inReach = balance != null && balance >= item.cost;
          return (
            <li key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black uppercase tracking-wide text-zinc-900">{item.name}</p>
                <span className="shrink-0 font-mono text-xs font-black text-blue-600">
                  {item.cost.toLocaleString("en-US")} PTS
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-zinc-500">{item.detail}</p>
              <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                {inReach ? "In reach" : "Unlockable"}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
