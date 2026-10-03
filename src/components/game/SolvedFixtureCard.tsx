interface SolvedFixtureCardProps {
  sport: string;
  year: number | null;
  score: number;
  cells: string[];
  streak: number;
  fixtureId: string;
  onShare: () => void;
}

export function SolvedFixtureCard({ sport, year, score, cells, streak, fixtureId, onShare }: SolvedFixtureCardProps) {
  const title = year ? `${sport} (${year})` : sport;

  return (
    <div className="rounded-2xl border-2 border-zinc-950 bg-white p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
        Dagens Drop avklarad ✓
      </p>
      <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">Klassiker Avklarad!</h2>
      <p className="mt-2 text-sm font-bold text-zinc-700">{title}</p>
      <p className="mt-3 font-mono text-3xl font-black text-zinc-900">{score.toLocaleString()} poäng</p>
      <p className="mt-3 text-lg tracking-widest" aria-label="Score grid">
        {cells.join(" ")}
      </p>
      <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
        🔥 {streak} dagars svit
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onShare}
          className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-black"
        >
          Dela resultat
        </button>
        <button
          type="button"
          onClick={() => {
            const challengeUrl = `${window.location.origin}?challenge=${fixtureId}&score=${score}`;
            navigator.clipboard.writeText(challengeUrl);
            alert('Utmaningslänk kopierad till urklipp! Skicka den till en vän.');
          }}
          className="w-full py-3 bg-blue-600 text-white font-black uppercase rounded-xl hover:bg-blue-700 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
        >
          <span>⚔️</span> Utmana en vän
        </button>
      </div>
    </div>
  );
}
