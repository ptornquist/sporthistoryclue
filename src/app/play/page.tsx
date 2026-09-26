'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

interface Challenge {
  id: string;
  title: string;
  category: string;
  clues: string[];
  subject: string;
  year: number;
  options?: string[];
}

function PlayContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'ice_hockey';

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [currentClueIdx, setCurrentClueIdx] = useState(0);
  const [score, setScore] = useState(10000);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWrong, setSelectedWrong] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      const { data } = await supabaseClient
        .from('challenges')
        .select('*')
        .eq('category', category)
        .limit(1)
        .maybeSingle();

      if (data) {
        setChallenge(data);

        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          setOptions([...data.options].sort(() => Math.random() - 0.5));
        } else {
          const correctAnswer = `${data.subject} (${data.year})`;
          setOptions([
            correctAnswer,
            'Canada vs Soviet Union (1972)',
            'USA vs Soviet Union (1980)',
            'Sweden vs Finland (2006)',
          ].sort(() => Math.random() - 0.5));
        }
      }
      setLoading(false);
    };

    fetchChallenge();
  }, [category]);

  const handleSelectOption = (option: string) => {
    if (selectedWrong.includes(option) || gameWon || gameOver || !challenge) return;

    const isCorrect =
      option.toLowerCase().includes(challenge.subject.toLowerCase()) ||
      option.toLowerCase().includes(challenge.title.toLowerCase()) ||
      (challenge.options && option === challenge.options[0]);

    if (isCorrect) {
      setGameWon(true);
      saveScore(score);
    } else {
      setSelectedWrong((prev) => [...prev, option]);
      const nextScore = Math.max(2000, score - 2000);
      setScore(nextScore);

      if (currentClueIdx < challenge.clues.length - 1) {
        setCurrentClueIdx((prev) => prev + 1);
      } else {
        setGameOver(true);
      }
    }
  };

  const handleUnlockClue = () => {
    if (!challenge || currentClueIdx >= challenge.clues.length - 1) return;
    setScore((prev) => Math.max(2000, prev - 2000));
    setCurrentClueIdx((prev) => prev + 1);
  };

  const saveScore = async (finalScore: number) => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || !challenge) return;

    await supabaseClient.from('match_history').insert({
      user_id: user.id,
      challenge_id: challenge.id,
      score: finalScore,
      clues_used: currentClueIdx + 1,
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-400">
        Loading Arena Dossier...
      </main>
    );
  }

  if (!challenge) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-4">🏟️</span>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 mb-2">No Matches in Archive</h2>
        <p className="text-zinc-500 text-xs mb-6">Add questions to your Supabase challenges table to play.</p>
        <Link href="/" className="text-xs font-black uppercase text-blue-600 tracking-wider hover:underline">
          ← Back to Arena
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-black">
            ← Exit Match
          </Link>

          <div className="flex items-center gap-6">
            <div>
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 text-right">Score Potential</span>
              <span className="font-mono font-black text-blue-600 text-base">{score.toLocaleString()} PTS</span>
            </div>

            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                    idx === currentClueIdx
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100'
                      : idx < currentClueIdx
                      ? 'bg-zinc-200 text-zinc-500'
                      : 'border border-dashed border-zinc-300 text-zinc-300'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Deduction Arena */}
      <div className="max-w-3xl w-full mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm mb-8 text-center relative">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[11px] font-bold uppercase rounded-full tracking-wider mb-6 inline-block">
            Clue {currentClueIdx + 1} of 6
          </span>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-snug text-zinc-900">
            {challenge.clues[currentClueIdx]}
          </h2>

          <div className="mt-8 flex justify-center">
            {currentClueIdx < challenge.clues.length - 1 && !gameWon && !gameOver && (
              <button
                onClick={handleUnlockClue}
                className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                Skip to next clue (-2,000 PTS) →
              </button>
            )}
          </div>
        </div>

        {/* 4 Suggestion Cards */}
        <div>
          <span className="block text-center text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
            Select Your Historical Deduction
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {options.map((option, idx) => {
              const isWrong = selectedWrong.includes(option);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isWrong || gameWon || gameOver}
                  className={`p-4 md:p-5 rounded-2xl border text-left font-bold text-sm transition-all duration-150 flex items-center justify-between ${
                    isWrong
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through cursor-not-allowed opacity-60'
                      : gameWon
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-400'
                      : 'bg-white border-zinc-200 text-zinc-800 hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-sm active:scale-[0.99]'
                  }`}
                >
                  <span className="truncate pr-2">{option}</span>
                  <span className="text-xs font-mono text-zinc-400">
                    {isWrong ? '✕' : `[${String.fromCharCode(65 + idx)}]`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Victory / Defeat Modal */}
      {(gameWon || gameOver) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
            <span className="text-4xl block mb-2">{gameWon ? '🏆' : '⏱️'}</span>
            <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              {gameWon ? 'Match Solved!' : 'Out of Deductions'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-1 mb-6">
              {gameWon
                ? `You correctly identified ${challenge.subject} (${challenge.year}) on Clue ${currentClueIdx + 1}.`
                : `The fixture was ${challenge.subject} (${challenge.year}).`}
            </p>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-6">
              <span className="block text-[10px] font-mono uppercase text-zinc-400">Points Awarded</span>
              <span className="text-3xl font-black font-mono text-blue-600">
                {gameWon ? `+${score.toLocaleString()}` : '0'} PTS
              </span>
            </div>

            <div className="flex gap-3">
              <Link
                href="/standings"
                className="flex-1 py-3 bg-zinc-100 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-zinc-200 text-center"
              >
                Standings
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 text-center"
              >
                Next Arena
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="h-6"></div>
    </main>
  );
}

export default function PlayArenaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-400">
          Loading Arena Dossier...
        </main>
      }
    >
      <PlayContent />
    </Suspense>
  );
}