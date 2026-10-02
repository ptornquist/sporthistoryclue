export const CLUE_TITLES = [
  "Arena & Stakes",
  "Era & Context",
  "Lineup & Tactics",
  "Archive Photo",
  "The Climax",
] as const;

interface ClueStackProps {
  clues: string[];
  revealedIndex: number;
  locked: boolean;
  onReveal: () => void;
}

export function ClueStack({ clues, revealedIndex, locked, onReveal }: ClueStackProps) {
  const ladder = Math.min(clues.length, CLUE_TITLES.length);
  const visible = Math.min(revealedIndex + 1, ladder);
  const canReveal = !locked && revealedIndex < ladder - 1;

  return (
    <div className="space-y-3">
      {clues.slice(0, visible).map((clue, index) => (
        <article
          key={CLUE_TITLES[index]}
          className="rounded-2xl border-2 border-zinc-900 bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-zinc-500">
            Card #{index + 1}: {CLUE_TITLES[index]}
          </p>
          <p className="text-sm font-medium leading-relaxed text-zinc-800">{clue}</p>
        </article>
      ))}
      {canReveal && (
        <button
          type="button"
          onClick={onReveal}
          className="w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-900 rounded-xl font-black text-sm tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          REVEAL NEXT CLUE (-1,500 PTS)
        </button>
      )}
    </div>
  );
}
