import Link from "next/link";
import type { UnlockedAccolade } from "@/lib/scout-badges";

export function ScoutAccolades({ badges }: { badges: UnlockedAccolade[] }) {
  return (
    <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">
            🎖️ Scoututmärkelser ({badges.length})
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Upplåsta utmärkelser från shopen.
          </p>
        </div>
        <Link className="text-xs font-black uppercase text-blue-600 hover:underline" href="/shop">
          + Hämta fler
        </Link>
      </div>

      {badges.length === 0 ? (
        <div className="py-6 text-center text-sm font-semibold text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl">
          Inga utmärkelser upplåsta ännu. Handla med karriärpoäng i shopen!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 ${badge.bg} shadow-sm`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <div className="font-black text-xs uppercase tracking-wide leading-tight">
                  {badge.name}
                </div>
                <div className="text-[11px] opacity-75 leading-tight mt-0.5">
                  {badge.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BadgeHandleFlair({ badges }: { badges: UnlockedAccolade[] }) {
  if (badges.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-2xl normal-case" aria-label="Upplåsta utmärkelser">
      {badges.map((badge) => (
        <span key={badge.id} title={badge.name}>
          {badge.icon}
        </span>
      ))}
    </span>
  );
}
