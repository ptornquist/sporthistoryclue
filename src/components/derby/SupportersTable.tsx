import type { ClubStanding } from "@/lib/premier-league";

export function SupportersTable({
  rows,
  highlightId,
}: {
  rows: ClubStanding[];
  highlightId: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-200 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            <th className="px-3 py-3 font-bold">Rank</th>
            <th className="px-3 py-3 font-bold">Club</th>
            <th className="px-3 py-3 font-bold">Active Scouts</th>
            <th className="px-3 py-3 font-bold">Total Club Points</th>
            <th className="px-3 py-3 font-bold">Average PTS / Scout</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const mine = highlightId === row.id;
            return (
              <tr
                key={row.id}
                className={
                  mine
                    ? "border-2 border-blue-600 bg-blue-50/80"
                    : "border-b border-zinc-100"
                }
              >
                <td className="px-3 py-3 font-mono text-sm font-black text-zinc-500">#{row.rank}</td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-2 font-black text-sm text-zinc-900">
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: row.color }}
                    />
                    {row.name}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm font-bold text-zinc-700">👥 {row.scouts}</td>
                <td className="px-3 py-3 font-mono text-sm font-black text-zinc-900">
                  {row.totalPoints.toLocaleString()}
                </td>
                <td className="px-3 py-3 font-mono text-sm font-bold text-zinc-600">
                  {row.average.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
