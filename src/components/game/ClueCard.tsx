"use client";

import { ClueReveal } from "@/components/game/clues/ClueReveal";
import { ImageClue } from "@/components/game/clues/ImageClue";
import { QuoteClue } from "@/components/game/clues/QuoteClue";
import { StatsClue } from "@/components/game/clues/StatsClue";
import { TextClue } from "@/components/game/clues/TextClue";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Clue } from "@/lib/types";

interface ClueCardProps {
  clue: Clue;
  clueNumber: number;
  cluesRevealed: number;
  onSelectClue: (clueNumber: number) => void;
}

export function ClueCard({
  clue,
  clueNumber,
  cluesRevealed,
  onSelectClue,
}: ClueCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gold/25 bg-card shadow-[0_24px_80px_-32px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-3 border-b border-gold/20 bg-ink px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="gold">Ledtråd {clueNumber}</Badge>
          {clue.kicker && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber">
              {clue.kicker}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }, (_, index) => {
            const number = index + 1;
            const unlocked = number <= cluesRevealed;
            return (
              <button
                key={number}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectClue(number)}
                className={cn(
                  "h-7 w-7 rounded-sm font-mono text-xs",
                  number === clueNumber
                    ? "bg-gold text-ink"
                    : unlocked
                      ? "bg-paper/10 text-paper hover:bg-gold/20"
                      : "bg-paper/5 text-paper/25",
                )}
                aria-label={`Clue ${number}`}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      <ClueReveal clueNumber={clueNumber}>
        {clue.kind === "image" && clue.image ? <ImageClue image={clue.image} /> : null}
        {clue.kind === "stats" && clue.stats ? (
          <StatsClue stats={clue.stats} cluesRevealed={cluesRevealed} />
        ) : null}
        {clue.kind === "text" ? <TextClue body={clue.body} /> : null}
        {clue.kind === "quote" ? (
          <QuoteClue quote={clue.quote} attribution={clue.attribution} />
        ) : null}
      </ClueReveal>
    </section>
  );
}
