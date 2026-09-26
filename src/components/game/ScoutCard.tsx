import Link from "next/link";
import {
  FEATURED_BADGES,
  FRAMES,
  TITLES,
  badgeUnlocked,
  cosmeticName,
  scoutLevel,
  titleClassName,
  type CosmeticWallet,
} from "@/lib/cosmetics";
import { ScoutAvatar } from "@/components/game/ScoutAvatar";

export function ScoutCard({
  handle,
  email,
  avatarUrl,
  wallet,
  careerScore,
  solvedCount,
  currentStreak,
  bestStreak,
  solvedSlugs,
  solvedScores,
  badgeTimes,
  signedIn,
  profileReady,
  onEquip,
}: {
  handle: string;
  email?: string | null;
  avatarUrl?: string | null;
  wallet: CosmeticWallet;
  careerScore: number;
  solvedCount: number;
  currentStreak: number;
  bestStreak: number;
  solvedSlugs: string[];
  solvedScores: number[];
  badgeTimes: Record<string, string>;
  signedIn: boolean;
  profileReady: boolean;
  onEquip: (itemId: string) => void;
}) {
  const level = scoutLevel(careerScore);
  const average = solvedCount > 0 ? Math.round(careerScore / solvedCount) : 0;
  const titleName = cosmeticName(wallet.equippedTitle) || "Archive Rookie";
  const titleItem = TITLES.find((item) => item.id === wallet.equippedTitle);
  const unlockedTitles = TITLES.filter((item) => wallet.unlockedTitles.includes(item.id));
  const unlockedFrames = FRAMES.filter((item) => wallet.unlockedFrames.includes(item.id));
  const progress = `${Math.round(level.progress * 100)}%`;

  const stats = [
    { label: "Total Score", value: careerScore.toLocaleString() },
    { label: "Average Score", value: average.toLocaleString() },
    { label: "Matches Solved", value: solvedCount.toLocaleString() },
    { label: "Coin Balance", value: wallet.coins.toLocaleString() },
    { label: "Current Streak", value: `${currentStreak}` },
    { label: "Best Streak", value: `${bestStreak}` },
  ];

  return (
    <section className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoutAvatar frameId={wallet.equippedFrame} avatarUrl={avatarUrl} label={handle} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">@{handle}</h1>
            <p className={`mt-2 inline-flex rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold uppercase tracking-wider ${titleClassName(wallet.equippedTitle)}`}>
              {titleItem?.emoji ?? "🗂️"} {titleName}
            </p>
            {email && <p className="mt-2 text-sm text-zinc-400">{email}</p>}
            <div className="mt-4 max-w-md">
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <span>Level {level.level}</span>
                <span>
                  {careerScore.toLocaleString()} / {level.nextScore.toLocaleString()} XP
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: progress }} />
              </div>
            </div>
          </div>
          <Link
            href="/shop"
            className="self-start bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Pro Shop
          </Link>
        </div>

        {!signedIn && profileReady && (
          <p className="mt-4 text-xs font-medium text-zinc-500">
            This card is saved on this device.{" "}
            <Link href="/login" className="font-bold text-blue-600">
              Sign in
            </Link>{" "}
            to sync coins and cosmetics.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{stat.label}</span>
            <span className="mt-1 block text-2xl font-black font-mono text-zinc-900">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900">Wardrobe</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Equipped title
            <select
              aria-label="Equipped title"
              value={wallet.equippedTitle}
              onChange={(event) => onEquip(event.target.value)}
              className="mt-2 w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-900"
            >
              {unlockedTitles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.emoji} {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Equipped frame
            <select
              aria-label="Equipped frame"
              value={wallet.equippedFrame}
              onChange={(event) => onEquip(event.target.value)}
              className="mt-2 w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-900"
            >
              {unlockedFrames.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.emoji} {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-black uppercase tracking-tight text-zinc-900">Featured badges</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_BADGES.map((badge) => {
            const unlocked = badgeUnlocked(badge.id, { ...wallet, matchesSolved: solvedCount, bestStreak }, solvedSlugs, solvedScores);
            const unlockedAt = badgeTimes[badge.id];
            const when = unlockedAt ? new Date(unlockedAt) : null;
            const stamp = when && !Number.isNaN(when.getTime()) ? when.toLocaleDateString() : "";
            return (
              <article
                key={badge.id}
                title={badge.detail}
                className={`group rounded-2xl border p-4 ${
                  unlocked
                    ? "border-blue-200 bg-white shadow-[0_0_18px_rgba(37,99,235,0.12)]"
                    : "border-zinc-200 bg-zinc-50 grayscale"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl" aria-hidden>
                    {badge.emoji}
                  </span>
                  {!unlocked && (
                    <span className="text-sm" aria-hidden>
                      🔒
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-black text-zinc-900">{badge.name}</h3>
                {unlocked ? (
                  <p className="mt-1 text-[11px] font-mono font-bold text-blue-700">{stamp ? `Unlocked ${stamp}` : "Unlocked"}</p>
                ) : (
                  <p className="mt-1 hidden text-[11px] font-medium text-zinc-500 max-sm:block group-hover:block">{badge.detail}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
