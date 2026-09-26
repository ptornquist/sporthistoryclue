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

  const stats = [
    { label: "Total Score", value: careerScore.toLocaleString() },
    { label: "Average Score", value: average.toLocaleString() },
    { label: "Matches Solved", value: solvedCount.toLocaleString() },
    { label: "Coin Balance", value: `🟡 ${wallet.coins.toLocaleString()}` },
    { label: "Current Streak", value: `${currentStreak}` },
    { label: "Best Streak", value: `${bestStreak}` },
  ];

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <ScoutAvatar frameId={wallet.equippedFrame} avatarUrl={avatarUrl} label={handle} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-amber-300/80">Scout Profile</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">@{handle}</h1>
          <p className={`mt-1 text-sm font-black ${titleClassName(wallet.equippedTitle)}`}>
            {titleItem?.emoji ?? "✨"} {titleName}
          </p>
          {email && <p className="mt-1 text-xs text-zinc-500">{email}</p>}
          <div className="mt-4 max-w-md">
            <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <span>Level {level.level}</span>
              <span>{careerScore.toLocaleString()} / {level.nextScore.toLocaleString()} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-300"
                style={{ width: `${Math.round(level.progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <Link
          href="/shop"
          className="self-start rounded-xl bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-950"
        >
          Pro Shop
        </Link>
      </div>

      {!signedIn && profileReady && (
        <p className="mt-4 text-xs font-medium text-zinc-400">
          This card is saved on this device.{" "}
          <Link href="/login" className="font-bold text-amber-300">
            Sign in
          </Link>{" "}
          to sync coins and cosmetics.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{stat.label}</span>
            <span className="mt-1 block text-xl font-black text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Equipped title
          <select
            aria-label="Equipped title"
            value={wallet.equippedTitle}
            onChange={(event) => onEquip(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-bold text-white"
          >
            {unlockedTitles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.emoji} {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Equipped frame
          <select
            aria-label="Equipped frame"
            value={wallet.equippedFrame}
            onChange={(event) => onEquip(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-bold text-white"
          >
            {unlockedFrames.map((item) => (
              <option key={item.id} value={item.id}>
                {item.emoji} {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Featured badges</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FEATURED_BADGES.map((badge) => {
            const unlocked = badgeUnlocked(badge.id, { ...wallet, matchesSolved: solvedCount, bestStreak }, solvedSlugs);
            return (
              <span
                key={badge.id}
                title={badge.detail}
                className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                  unlocked
                    ? "border-amber-300 text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.35)]"
                    : "border-zinc-800 text-zinc-600"
                }`}
              >
                {badge.name}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
