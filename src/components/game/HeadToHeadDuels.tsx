import Link from "next/link";
import { ScoutHandleLink } from "@/components/game/ScoutHandleLink";
import { groupDuels, type DuelRow } from "@/lib/duels";

export function HeadToHeadDuels({
  duels,
  myUsername,
}: {
  duels: DuelRow[];
  myUsername: string;
}) {
  const groups = groupDuels(duels, myUsername);

  return (
    <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">
        ⚔️ Huvud-mot-huvud Dueller ({duels.length})
      </h2>

      <section>
        <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Inkommande utmaningar</h3>
        {groups.incoming.length === 0 ? (
          <p className="mt-2 text-xs font-medium text-zinc-400">Inga inkommande utmaningar.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {groups.incoming.map((duel) => (
              <li key={duel.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-sm font-bold text-zinc-900">
                  <ScoutHandleLink username={duel.challenger_username} className="hover:underline" /> utmanade dig på {duel.challenge_id}!
                </p>
                <Link
                  href={`/?date=${encodeURIComponent(duel.challenge_id || "")}`}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Acceptera & spela
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Skickade utmaningar</h3>
        {groups.sent.length === 0 ? (
          <p className="mt-2 text-xs font-medium text-zinc-400">Inga väntande utmaningar.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {groups.sent.map((duel) => (
              <li key={duel.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm font-bold text-zinc-900">
                Du utmanade <ScoutHandleLink username={duel.opponent_username} className="hover:underline" /> · Väntar på resultat...
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Avklarade dueller</h3>
        {groups.completed.length === 0 ? (
          <p className="mt-2 text-xs font-medium text-zinc-400">Inga avklarade dueller.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {groups.completed.map((duel) => {
              const challenger = duel.challenger_username?.replace(/^@/, "") || "scout";
              const opponent = duel.opponent_username?.replace(/^@/, "") || "scout";
              const winner = duel.winner_username?.replace(/^@/, "").toLowerCase();
              return (
                <li key={duel.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm font-bold text-zinc-900">
                  {winner === challenger.toLowerCase() ? "👑 " : ""}
                  <ScoutHandleLink username={challenger} className="hover:underline" /> {(duel.challenger_score || 0).toLocaleString()} poäng
                  {" mot "}
                  {winner === opponent.toLowerCase() ? "👑 " : ""}
                  <ScoutHandleLink username={opponent} className="hover:underline" /> {(duel.opponent_score || 0).toLocaleString()} poäng
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
