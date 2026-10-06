"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClueCard } from "@/components/game/ClueCard";
import { InputBar } from "@/components/game/InputBar";
import { ScoreCard } from "@/components/game/ScoreCard";
import { Badge } from "@/components/ui/badge";
import { extraCluesFromVisible } from "@/lib/grade";
import { markExpeditionSolved, recordDailyResult } from "@/lib/progress";
import {
  MAX_CLUES,
  liveScorePreview,
  scoreAttempt,
  type ScoreBreakdown,
} from "@/lib/scoring";
import type { EventOption, PublicPuzzle, Sport } from "@/lib/types";

interface GameBoardProps {
  puzzle: PublicPuzzle;
  events: EventOption[];
  mode: "daily" | "expedition" | "play";
  dateKey?: string;
  expeditionSlug?: string;
  expeditionTitle?: string;
  nextHref?: string;
  nextLabel?: string;
  onNext?: () => void;
}

interface Answer {
  title: string;
  year: number;
  summary: string;
  sport: Sport;
}

interface ScoreResponse {
  success?: boolean;
  isFullyCorrect?: boolean;
  isYearCorrect?: boolean;
  isSubjectCorrect?: boolean;
  pointsAwarded?: number;
  revealedAnswer?: string | null;
  revealedYear?: number | null;
  correct?: boolean;
  breakdown?: ScoreBreakdown | null;
  answer?: Answer | null;
  error?: string;
}

export function GameBoard({
  puzzle,
  events,
  mode,
  dateKey,
  expeditionSlug,
  expeditionTitle,
  nextHref,
  nextLabel,
  onNext,
}: GameBoardProps) {
  const [cluesRevealed, setCluesRevealed] = React.useState(1);
  const [viewingClue, setViewingClue] = React.useState(1);
  const [pending, setPending] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ScoreBreakdown | null>(null);
  const [answer, setAnswer] = React.useState<Answer | undefined>();
  const [scoreOpen, setScoreOpen] = React.useState(false);

  const finished = result !== null;
  const live = liveScorePreview(cluesRevealed);
  const clue = puzzle.clues[viewingClue - 1];

  async function postScore(body: Record<string, unknown>): Promise<ScoreResponse> {
    const response = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as ScoreResponse;
  }

  function persist(breakdown: ScoreBreakdown) {
    if (mode === "daily" && dateKey) {
      recordDailyResult({
        dateKey,
        puzzleId: puzzle.id,
        score: breakdown.total,
        solved: breakdown.solved,
        cluesRevealed,
      });
    }
    if (mode === "expedition" && expeditionSlug && breakdown.solved) {
      markExpeditionSolved(expeditionSlug, puzzle.id);
    }
  }

  async function onGuess(subject: string, year: number) {
    if (finished || pending) return;
    setPending(true);
    setNotice(null);
    try {
      const extraClues = extraCluesFromVisible(cluesRevealed);
      const data = await postScore({
        puzzleId: puzzle.id,
        mode,
        dateKey,
        expeditionSlug,
        guessedSubject: subject,
        guessedYear: year,
        cluesRevealed: extraClues,
      });
      if (data.error) {
        setNotice(data.error);
        return;
      }
      if (!data.isFullyCorrect) {
        if (data.isSubjectCorrect && !data.isYearCorrect) {
          setNotice("Rätt ämne, fel år. Arkivet vill fortfarande ha datumet.");
        } else if (data.isYearCorrect && !data.isSubjectCorrect) {
          setNotice("Rätt år, fel ämne. Prova ett annat namn.");
        } else {
          setNotice("Inte rätt. Visa en ledtråd till eller prova ett annat namn.");
        }
        return;
      }
      const breakdown =
        data.breakdown ??
        scoreAttempt({
          cluesRevealed,
          extraClues,
          guessedYear: year,
          actualYear: data.revealedYear ?? year,
          eventCorrect: true,
          yearCorrect: true,
        });
      const filed: Answer | undefined = data.answer
        ? data.answer
        : data.revealedAnswer && data.revealedYear
          ? {
              title: data.revealedAnswer,
              year: data.revealedYear,
              summary: "",
              sport: puzzle.sport,
            }
          : undefined;
      setResult(breakdown);
      setAnswer(filed);
      setScoreOpen(true);
      persist(breakdown);
    } catch {
      setNotice("Arkivet svarar inte. Försök igen.");
    } finally {
      setPending(false);
    }
  }

  function onGiveUp() {
    if (finished || pending) return;
    const breakdown = scoreAttempt({
      cluesRevealed,
      extraClues: extraCluesFromVisible(cluesRevealed),
      guessedYear: 0,
      actualYear: 0,
      eventCorrect: false,
      yearCorrect: false,
    });
    setResult(breakdown);
    setAnswer(undefined);
    setScoreOpen(true);
    persist(breakdown);
  }

  function onReveal() {
    if (finished || cluesRevealed >= MAX_CLUES) return;
    const next = cluesRevealed + 1;
    setCluesRevealed(next);
    setViewingClue(next);
    setNotice(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
            {mode === "daily" ? "Daily brief" : mode === "play" ? "Random plate" : expeditionTitle}
          </p>
          <h1 className="font-serif text-3xl text-paper sm:text-4xl">Vilken klassiker är det här?</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="paper">{puzzle.era.replace("-", " ")}</Badge>
          <div className="rounded-md border border-gold/30 bg-ink px-3 py-2 text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50">
              Running score
            </p>
            <p className="font-serif text-2xl tabular-nums text-gold">{live}</p>
          </div>
        </div>
      </div>

      {clue && (
        <ClueCard
          clue={clue}
          clueNumber={viewingClue}
          cluesRevealed={cluesRevealed}
          onSelectClue={setViewingClue}
        />
      )}

      <AnimatePresence>
        {notice && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-md border border-amber/40 bg-crimson/20 px-4 py-3 text-sm text-paper"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      <InputBar
        events={events}
        cluesRevealed={cluesRevealed}
        canRevealMore={cluesRevealed < MAX_CLUES && !finished}
        disabled={finished}
        pending={pending}
        onGuess={onGuess}
        onReveal={onReveal}
        onGiveUp={onGiveUp}
      />

      {result && (
        <ScoreCard
          open={scoreOpen}
          onOpenChange={setScoreOpen}
          breakdown={result}
          cluesRevealed={cluesRevealed}
          answer={answer}
          dateKey={dateKey}
          expeditionTitle={expeditionTitle}
          nextHref={nextHref}
          nextLabel={nextLabel}
          onNext={onNext}
        />
      )}
    </div>
  );
}
