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
  story?: string;
  fun_facts?: string[];
}

function DailyDropArena() {
  const searchParams = useSearchParams();
  const challenger = searchParams.get('vs');
  const challengerClues = searchParams.get('clues');
  const challengerPts = searchParams.get('pts');

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [currentClueIdx, setCurrentClueIdx] = useState(0);
  const [score, setScore] = useState(10000);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWrong, setSelectedWrong] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Setup options helper
  const setupOptions = (item: Challenge) => {
    if (item.options && Array.isArray(item.options) && item.options.length > 0) {
      setOptions([...item.options].sort(() => Math.random() - 0.5));
    } else {
      const correct = `${item.subject} (${item.year})`;
      setOptions([
        correct,
        '1992 Barcelona: USA Dream Team vs Croatia',
        '1980 Lake Placid: USA vs Soviet Union',
        '1994 Lillehammer: Sweden vs Canada',
      ].sort(() => Math.random() - 0.5));
    }
  };

  // Fetch Daily Challenge
  useEffect(() => {
    const fetchDailyChallenge = async () => {
      setLoading(true);
      const savedDate = localStorage.getItem('shc_daily_date');
      const todayStr = new Date().toISOString().slice(0, 10);

      const { data } = await supabaseClient
        .from('challenges')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setChallenge(data);
        setupOptions(data);

        if (savedDate === todayStr) {
          const savedScore = localStorage.getItem('shc_daily_score');
          if (savedScore) {
            setScore(parseInt(savedScore, 10));
            setGameWon(true);
            setShowModal(false);
          }
        }
      }
      setLoading(false);
    };

    fetchDailyChallenge();
  }, []);

  // Handler to load another random fixture from the archive
  const handlePlayAnother = async () => {
    setLoading(true);
    setIsArchiveMode(true);
    setGameWon(false);
    setGameOver(false);
    setShowModal(false);
    setSelectedWrong([]);
    setCurrentClueIdx(0);
    setScore(10000);

    const { data } = await supabaseClient
      .from('challenges')
      .select('*')
      .neq('id', challenge?.id || '')
      .limit(10);

    if (data && data.length > 0) {
      const randomItem = data[Math.floor(Math.random() * data.length)];
      setChallenge(randomItem);
      setupOptions(randomItem);
    }
    setLoading(false);
  };

  const handleSelectOption = (option: string) => {
    if (selectedWrong.includes(option) || gameWon || gameOver || !challenge) return;

    const isCorrect =
      option.toLowerCase().includes(challenge.subject.toLowerCase()) ||
      option.toLowerCase().includes(challenge.title.toLowerCase()) ||
      (challenge.options && option === challenge.options[0]);

    if (isCorrect) {
      setGameWon(true);
      setShowModal(true);

      if (!isArchiveMode) {
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem('shc_daily_date', todayStr);
        localStorage.setItem('shc_daily_score', score.toString());
      }
      saveScore(score);
    } else {
      setSelectedWrong((prev) => [...prev, option]);
      const nextScore = Math.max(2000, score - 2000);
      setScore(nextScore);

      if (currentClueIdx < challenge.clues.length - 1) {
        setCurrentClueIdx((prev) => prev + 1);
      } else {
        setGameOver(true);
        setShowModal(true);
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

  const handleShare = () => {
    const url = `${window.location.origin}/?vs=Scout&clues=${currentClueIdx + 1}&pts=${score}`;
    const text = `SportsHistoryClue 🏆\nI cracked today's mystery match on Clue ${currentClueIdx + 1} (${score.toLocaleString()} PTS)!\nCan you beat my score? 👉 ${url}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-400">
        Loading Match Fixture...
      </main>
    );
  }

  if (!challenge) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black uppercase text-zinc-900 mb-2">No Matches Found</h2>
        <p className="text-zinc-500 text-xs">Check your database connection.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Challenger Banner (Optional) */}
      {challenger && !isArchiveMode && (
        <div className="bg-blue-600 text-white px-6 py-2.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm">
          <span>⚡</span>
          <span>
            <strong>{challenger}</strong> solved this match on Clue {challengerClues || '2'} ({challengerPts ? parseInt(challengerPts).toLocaleString() : '8,000'} PTS). Beat them!
          </span>
        </div>
      )}

      {/* Header Navigation */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </Link>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
              {isArchiveMode ? 'Archive Practice' : 'Daily Drop'}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div>
              <span className="block text-[9px] font-mono font-bold uppercase text-zinc-400 text-right">Potential</span>
              <span className="font-mono font-black text-blue-600 text-sm">{score.toLocaleString()} PTS</span>
            </div>

            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                    idx === currentClueIdx
                      ? 'bg-blue-600 text-white'
                      : idx < currentClueIdx
                      ? 'bg-zinc-200 text-zinc-600'
                      : 'border border-zinc-300 text-zinc-300'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Play / Dossier Body */}
      <div className="max-w-2xl w-full mx-auto px-6 py-6 flex-1 flex flex-col justify-center">
        {gameWon ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Dossier Header Card */}
            <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 md:p-8 shadow-sm text-center">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold uppercase rounded-full tracking-wider mb-3 inline-block">
                Match Solved · Clue {currentClueIdx + 1} of 6
              </span>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900">
                {challenge.subject} ({challenge.year})
              </h1>
              <p className="text-sm font-mono font-black text-blue-600 mt-1">
                Score: {score.toLocaleString()} PTS
              </p>

              {/* Action Buttons: Play Another Match is Primary */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  onClick={handlePlayAnother}
                  className="px-6 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm"
                >
                  Play Another Match →
                </button>
                <button
                  onClick={handleShare}
                  className="px-5 py-3.5 bg-zinc-100 text-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-all"
                >
                  {copied ? '✓ Copied!' : 'Challenge a Friend ⚡'}
                </button>
              </div>
            </div>

            {/* Match Dossier & Facts */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Match Dossier
                </span>
                <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                  {challenge.story ||
                    `The 1992 United States Men's Olympic Basketball Team, nicknamed the "Dream Team", was the first American Olympic team to feature active NBA superstars including Michael Jordan, Magic Johnson, and Larry Bird. They dominated Barcelona 1992, defeating opponents by an average of 43.8 points.`}
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-3">
                  Scout Lore &amp; Trivia
                </span>
                <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✦</span>
                    <span>Head coach Chuck Daly famously did not call a single timeout throughout the entire tournament.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✦</span>
                    <span>Opposing players frequently asked for autographs and photos with Jordan, Barkley, and Magic right after final whistles.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Active Match Clues */
          <>
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-10 shadow-sm text-center mb-6 relative">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold uppercase rounded-full tracking-wider mb-4 inline-block">
                Clue {currentClueIdx + 1} of 6
              </span>

              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-snug text-zinc-900">
                "{challenge.clues[currentClueIdx]}"
              </h1>

              <div className="mt-6">
                {currentClueIdx < challenge.clues.length - 1 && !gameOver && (
                  <button
                    onClick={handleUnlockClue}
                    className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-800 transition-colors"
                  >
                    Reveal next clue (-2,000 PTS) →
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <span className="block text-center text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Identify This Historical Matchup
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {options.map((option, idx) => {
                  const isWrong = selectedWrong.includes(option);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      disabled={isWrong || gameOver}
                      className={`p-4 rounded-2xl border text-left font-bold text-xs md:text-sm transition-all flex items-center justify-between ${
                        isWrong
                          ? 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through cursor-not-allowed opacity-50'
                          : 'bg-white border-zinc-200 text-zinc-800 hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-sm active:scale-[0.99]'
                      }`}
                    >
                      <span className="truncate pr-2">{option}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {isWrong ? '✕' : `[${String.fromCharCode(65 + idx)}]`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal on match conclusion */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black text-xl font-bold w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"
            >
              ✕
            </button>

            <span className="text-4xl block mb-2">{gameWon ? '🏆' : '⏱️'}</span>
            <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              {gameWon ? 'Deduction Confirmed!' : 'Out of Clues'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-1 mb-6">
              Match: <strong>{challenge.subject} ({challenge.year})</strong>
            </p>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-6">
              <span className="block text-[10px] font-mono uppercase text-zinc-400">Final Score</span>
              <span className="text-3xl font-black font-mono text-blue-600">
                {gameWon ? `+${score.toLocaleString()}` : '0'} PTS
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handlePlayAnother}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all"
              >
                Play Another Fixture →
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-zinc-100 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all"
              >
                Read Match Dossier &amp; Lore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-zinc-400 font-mono">
        SportsHistoryClue · New drop released daily at 00:00 UTC
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
          Loading Arena...
        </main>
      }
    >
      <DailyDropArena />
    </Suspense>
  );
}