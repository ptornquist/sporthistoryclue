"use client";

import { findCosmetic, titleClassName } from "@/lib/cosmetics";
import { inviteClubLink, whatsAppClubInvite, type ClubActivity, type ClubMember, type ClubSummary } from "@/lib/clubs";
import { ScoutAvatar } from "@/components/game/ScoutAvatar";

function titleLabel(titleId: string | null): string {
  const item = titleId ? findCosmetic(titleId) : undefined;
  if (!item) return "";
  return `${item.emoji} ${item.name}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="font-mono text-sm font-black text-amber-700">#1 🥇</span>;
  if (rank === 2) return <span className="font-mono text-sm font-black text-zinc-500">#2 🥈</span>;
  if (rank === 3) return <span className="font-mono text-sm font-black text-amber-800">#3 🥉</span>;
  return <span className="font-mono text-sm font-bold text-zinc-400">#{rank}</span>;
}

export function ClubComposer({
  clubName,
  joinCode,
  busy,
  onClubName,
  onJoinCode,
  onCreate,
  onJoin,
}: {
  clubName: string;
  joinCode: string;
  busy: boolean;
  onClubName: (value: string) => void;
  onJoinCode: (value: string) => void;
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Create a Club</h2>
        <p className="mt-1 text-sm text-zinc-500">Start a private table for the people you actually play with.</p>
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-zinc-400" htmlFor="club-name">
          Club name
        </label>
        <input
          id="club-name"
          value={clubName}
          onChange={(event) => onClubName(event.target.value)}
          placeholder="Locker Room Legends"
          maxLength={48}
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-blue-400"
        />
        <button
          type="button"
          disabled={busy || clubName.trim().length < 1}
          onClick={onCreate}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-2xl text-sm"
        >
          Create Club →
        </button>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Join with Code</h2>
        <p className="mt-1 text-sm text-zinc-500">Enter the six-character code from a teammate.</p>
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-zinc-400" htmlFor="club-code">
          Invite code
        </label>
        <input
          id="club-code"
          value={joinCode}
          onChange={(event) => onJoinCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          placeholder="HOCKEY"
          maxLength={6}
          autoCapitalize="characters"
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 font-mono text-lg tracking-[0.3em] text-zinc-900 uppercase outline-none focus:border-blue-400"
        />
        <button
          type="button"
          disabled={busy || joinCode.trim().length !== 6}
          onClick={onJoin}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-2xl text-sm"
        >
          Join Club →
        </button>
      </section>
    </div>
  );
}

export function ClubStandings({
  club,
  members,
  activity,
  viewerId,
  onCopyInvite,
}: {
  club: ClubSummary;
  members: ClubMember[];
  activity: ClubActivity[];
  viewerId: string;
  onCopyInvite: () => void;
}) {
  const owner = members.find((member) => member.role === "owner");
  const invite = inviteClubLink(club.code);
  const scoutLabel = club.memberCount === 1 ? "1 scout" : `${club.memberCount} scouts`;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">{club.name}</h2>
          {club.role === "owner" ? (
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              Owner
            </span>
          ) : (
            <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Owner · @{owner?.username || "Scout"}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-medium text-zinc-500">{scoutLabel}</p>

        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Invite code</p>
          <p className="mt-1 font-mono text-3xl font-black tracking-[0.28em] text-zinc-900">{club.code}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopyInvite}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-black"
            >
              Copy Invite Link
            </button>
            <a
              href={whatsAppClubInvite(club.name, club.code)}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:border-emerald-400"
            >
              🟢 WhatsApp
            </a>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] text-zinc-500">{invite}</p>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Private Club Standings</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-3 py-2 font-bold">Rank</th>
                <th className="px-3 py-2 font-bold">Scout</th>
                <th className="px-3 py-2 font-bold">Streak</th>
                <th className="px-3 py-2 font-bold">Solved Matches</th>
                <th className="px-3 py-2 font-bold">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => {
                const title = titleLabel(member.equippedTitle);
                const mine = member.id === viewerId;
                return (
                  <tr
                    key={member.id}
                    className={mine ? "ring-2 ring-blue-500/20 bg-blue-50/30" : "border-t border-zinc-100"}
                  >
                    <td className="px-3 py-3">
                      <RankBadge rank={index + 1} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <ScoutAvatar
                          frameId={member.equippedFrame}
                          avatarUrl={member.avatarUrl}
                          label={member.username}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-zinc-900">@{member.username}</p>
                          {title ? (
                            <p className={`truncate text-[11px] font-bold ${titleClassName(member.equippedTitle)}`}>{title}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-amber-700">🔥 {member.streak}</td>
                    <td className="px-3 py-3 text-sm font-bold text-zinc-700">{member.matchesSolved}</td>
                    <td className="px-3 py-3 font-mono text-sm font-black text-blue-600">
                      {member.totalScore.toLocaleString()} PTS
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Club Activity</h3>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Club solves will show up here after the next Daily Drop.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {activity.map((item) => (
              <li key={item.id} className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800">
                {item.line}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
