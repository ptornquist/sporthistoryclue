import Link from "next/link";
import type { ReactNode } from "react";
import type { UnlockedAccolade } from "@/lib/scout-badges";
import { cleanScoutHandle, formatCareerPoints } from "@/lib/scout-profile";

export function ScoutPublicCard({
  username,
  careerScore = 0,
  fixturesCleared = 0,
  badges = [],
  missing = false,
  actions = null,
}: {
  username: string;
  careerScore?: number;
  fixturesCleared?: number;
  badges?: UnlockedAccolade[];
  missing?: boolean;
  actions?: ReactNode;
}) {
  const handle = cleanScoutHandle(username) || "scout";
  const initial = handle.charAt(0).toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-10 text-zinc-900">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link href="/standings" className="text-sm font-black text-blue-600 hover:underline">
          ← Back to Standings
        </Link>

        {missing ? (
          <section className="rounded-3xl border-2 border-zinc-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black uppercase tracking-tight">Scout profile</h1>
            <p className="mt-3 text-sm font-semibold text-zinc-500">
              {cleanScoutHandle(username)
                ? `No scout found matching '@${cleanScoutHandle(username)}'.`
                : "No scout found."}
            </p>
          </section>
        ) : (
          <section className="flex flex-col gap-6 rounded-3xl border-2 border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <header className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-zinc-950 bg-amber-400 text-2xl font-black text-zinc-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                aria-hidden
              >
                {initial}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Scout profile</p>
                <h1 className="text-3xl font-black tracking-tight text-zinc-950">@{handle}</h1>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">CAREER SCORE</p>
                <p className="mt-1 font-mono text-2xl font-black text-blue-600">
                  {formatCareerPoints(careerScore)}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">FIXTURES CLEARED</p>
                <p className="mt-1 font-mono text-2xl font-black text-zinc-950">
                  {(fixturesCleared || 0).toLocaleString("en-US")}
                </p>
              </div>
            </div>

            {actions}

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">Badges &amp; Honours</h2>
              {badges.length === 0 ? (
                <p className="mt-3 text-sm font-semibold text-zinc-500">
                  This scout has not unlocked any honours yet.
                </p>
              ) : (
                <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {badges.map((badge) => (
                    <li
                      key={badge.id}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 ${badge.bg}`}
                    >
                      <span className="text-2xl" aria-hidden>
                        {badge.icon}
                      </span>
                      <span className="font-black text-xs uppercase tracking-wide">
                        {badge.icon} {badge.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
