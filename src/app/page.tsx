'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Challenge {
  id: string;
  slug?: string;
  title: string;
  category: string;
  clues: string[];
  subject: string;
  year: number;
  options?: string[];
  story?: string;
}

const FALLBACK_CHALLENGE: Challenge = {
  id: 'miracle-1980',
  title: 'Miracle on Ice',
  category: 'Ice Hockey',
  year: 1980,
  subject: 'USA vs Soviet Union (Winter Olympics)',
  clues: [
    'A squad of amateur and collegiate players faces off against four-time defending gold medalists.',
    'Contested in Lake Placid, New York.',
    'Herb Brooks coached the underdog roster with revolutionary conditioning.',
    'Team captain Mike Eruzione scores the historic game-winner with 10:00 remaining.',
    'Al Michaels delivers the legendary broadcast call: "Do you believe in miracles?!"',
    'Final score: USA 4, Soviet Union 3 on February 22, 1980.'
  ],
  options: [
    'USA vs Soviet Union (1980)',
    'Canada vs Soviet Union (1972)',
    'USA Dream Team vs Croatia (1992)',
    'Sweden vs Canada (1994)'
  ]
};

function DailyDropArena() {
  const searchParams = useSearchParams();
  const duelHandle = searchParams.get('duel');
  const duelPtsParam = searchParams.get('pts');
  const duelPts = duelPtsParam ? parseInt(duelPtsParam, 10) || 0 : 0;
  const specificMatch = searchParams.get('match');

  const [challenge, setChallenge] = useState<Challenge | null>(
    isSupabaseConfigured ? null : FALLBACK_CHALLENGE,
  );
  const [currentClueIdx, setCurrentClueIdx] = useState(0);
  const [score, setScore] = useState(10000);
  const [options, setOptions] = useState<string[]>(() =>
    isSupabaseConfigured ? [] : [...(FALLBACK_CHALLENGE.options ?? [])],
  );
  const [selectedWrong, setSelectedWrong] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('Scout');
  const [streak, setStreak] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const initPlayer = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('username, streak')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.username) setPlayerName(profile.username);
        else if (user.email) setPlayerName(user.email.split('@')[0]);

        if (profile?.streak) setStreak(profile.streak);
      } else {
        const saved = localStorage.getItem('shc_handle');
        if (saved) setPlayerName(saved);
        const savedStreak = parseInt(localStorage.getItem('shc_streak') || '1', 10);
        setStreak(savedStreak);
      }
    };

    initPlayer();
  }, []);

  const setupOptions = (item: Challenge) => {
    if (item.options && Array.isArray(item.options) && item.options.length > 0) {
      setOptions([...item.options].sort(() => Math.random() - 0.5));
    } else {
      const correct = `${item.subject} (${item.year})`;
      setOptions([
        correct,
        '1992 Barcelona: USA Dream Team vs Croatia',
        '1972 Munich: USA vs Soviet Union',
        '1994 Lillehammer: Sweden vs Canada',
      ].sort(() => Math.random() - 0.5));
    }
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!isSupabaseConfigured) {
        setChallenge(FALLBACK_CHALLENGE);
        setupOptions(FALLBACK_CHALLENGE);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        if (specificMatch) {
          const { data: matched } = await supabaseClient
            .from('challenges')
            .select('*')
            .or(`slug.eq.${specificMatch},id.eq.${specificMatch}`)
            .limit(1)
            .maybeSingle();

          if (matched) {
            setChallenge(matched);
            setupOptions(matched);
            setLoading(false);
            return;
          }
        }

        const withTimeout = <T,>(promise: PromiseLike<T>, ms = 4000): Promise<T> =>
          Promise.race([
            Promise.resolve(promise),
            new Promise<T>((_, reject) => {
              setTimeout(() => reject(new Error('Challenge request timed out.')), ms);
            }),
          ]);

        const { data: allMatches } = await withTimeout(
          supabaseClient.from('challenges').select('*').order('id', { ascending: true }),
        );

        if (allMatches && allMatches.length > 0) {
          const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
          const todaysMatch = allMatches[dayNumber % allMatches.length];
          setChallenge(todaysMatch);
          setupOptions(todaysMatch);
        } else {
          setChallenge(FALLBACK_CHALLENGE);
          setupOptions(FALLBACK_CHALLENGE);
        }
      } catch {
        setChallenge(FALLBACK_CHALLENGE);
        setupOptions(FALLBACK_CHALLENGE);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [specificMatch]);

  const handleRevealClue = () => {
    if (!challenge) return;
    if (currentClueIdx < challenge.clues.length - 1) {
      setCurrentClueIdx(prev => prev + 1);
      setScore(prev => Math.max(1000, prev - 1500));
    }
  };

  const handleGuess = (option: string) => {
    if (!challenge || gameWon || gameOver) return;

    const isMatch = option.includes(challenge.subject) || option.includes(challenge.year.toString());
    if (isMatch) {
      setGameWon(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('shc_streak', newStreak.toString());

      if (currentUser?.id) {
        supabaseClient
          .from('profiles')
          .update({ streak: newStreak })
          .eq('id', currentUser.id)
          .then();
      }
    } else {
      setSelectedWrong(prev => [...prev, option]);
      const newScore = Math.max(0, score - 2500);
      setScore(newScore);
      if (newScore <= 0 || selectedWrong.length >= 2) {
        setGameOver(true);
      }
    }
  };

  const sharePayload = async (title: string, text: string, url: string) => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text.includes(url) ? text : `${text}\n${url}`);
      showToast('📋 Result copied to clipboard!');
    }
  };

  const handleChallengeScout = async () => {
    const handle = playerName.replace(/^@/, '') || 'Scout';
    const link = `https://sportshistoryclue.com/?duel=${encodeURIComponent(handle)}&pts=${score}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      showToast('⚔️ Duel link copied to clipboard!');
    }
  };

  const handleShareShowdown = async () => {
    if (!duelHandle) return;
    const userScore = gameWon ? score : 0;
    const handle = playerName.replace(/^@/, '') || 'Scout';
    const outcome = userScore > duelPts 
      ? `I defeated @${duelHandle}` 
      : userScore === duelPts 
      ? `Tied with @${duelHandle}` 
      : `Close match against @${duelHandle}`;

    const text = [
      '⚔️ DUEL SHOWDOWN on SportsHistoryClue!',
      outcome,
      `Me: ${userScore.toLocaleString()} PTS vs @${duelHandle}: ${duelPts.toLocaleString()} PTS`,
      "Think you can beat us both? Play today's drop:",
      `https://sportshistoryclue.com/?duel=${encodeURIComponent(handle)}&pts=${userScore}`,
    ].join('\n');

    const url = `https://sportshistoryclue.com/?duel=${encodeURIComponent(handle)}&pts=${userScore}`;
    await sharePayload('SportsHistoryClue Duel', text, url);
  };

  if (loading || !challenge) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
        Loading Match Fixture...
      </main>
    );
  }

  const isDuelActive = Boolean(duelHandle);
  const userFinalScore = gameWon ? score : 0;
  const isVictory = isDuelActive && userFinalScore > duelPts;
  const isDefeat = isDuelActive && userFinalScore < duelPts;
  const isTie = isDuelActive && userFinalScore === duelPts;
  const pointDiff = Math.abs(userFinalScore - duelPts);
  const slotCount = 6;
  const revealedCount = Math.min(currentClueIdx + 1, slotCount);
  const gridCells: string[] = Array.from({ length: slotCount }, (_, index) => {
    if (index < revealedCount) return '🟩';
    return '⬜';
  });
  if (selectedWrong.length > 0) {
    gridCells[Math.min(revealedCount, slotCount - 1)] = '🟥';
  }
  const gridLine = gridCells.join(' ');
  const matchLabel = challenge.slug || String(Math.floor(Date.now() / (1000 * 60 * 60 * 24)));
  const playerHandle = playerName.replace(/^@/, '') || 'Scout';
  const resultUrl = `https://sportshistoryclue.com/?duel=${encodeURIComponent(playerHandle)}&pts=${userFinalScore}`;
  const resultText = [
    'SportsHistoryClue 🏆',
    gridLine,
    `🎯 Solved on Clue ${revealedCount} of 6 (${userFinalScore.toLocaleString()} PTS)`,
    `🔥 ${streak}-Day Streak`,
    '',
    "Can you crack today's case?",
    resultUrl,
  ].join('\n');

  const handleShareResult = () => {
    sharePayload('SportsHistoryClue', resultText, resultUrl);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Duel Banner */}
        {isDuelActive && !gameWon && !gameOver && (
          <div className="bg-blue-600 text-white px-4 py-2.5 text-center text-xs font-bold tracking-wide">
            ⚔️ Duel Active: Beat @{duelHandle}&apos;s score of {duelPts.toLocaleString()} PTS!
          </div>
        )}

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl animate-fade-in">
            {toastMessage}
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header Info */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {challenge.category}
              </span>
              <h1 className="text-xl font-black uppercase tracking-tight mt-1 text-zinc-900">
                Daily Drop
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Potential Score</span>
              <span className="text-2xl font-black text-blue-600 font-mono">
                {score.toLocaleString()} <span className="text-xs text-zinc-400 font-sans">PTS</span>
              </span>
            </div>
          </div>

          {/* Clues Box */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                Clue {currentClueIdx + 1} of {challenge.clues.length}
              </span>
              <span className="text-xs font-mono font-bold text-amber-600">
                🔥 {streak} Streak
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {challenge.clues.slice(0, currentClueIdx + 1).map((clue, idx) => (
                <div key={idx} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm font-medium text-zinc-800">
                  <span className="font-mono text-xs text-blue-600 font-bold mr-2">#{idx + 1}</span>
                  {clue}
                </div>
              ))}
            </div>

            {!gameWon && !gameOver && currentClueIdx < challenge.clues.length - 1 && (
              <button
                onClick={handleRevealClue}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors"
              >
                Reveal Next Clue (-1,500 PTS)
              </button>
            )}
          </div>

          {/* Options / Deduction Grid */}
          {!gameWon && !gameOver && (
            <div>
              <p className="text-xs font-mono font-bold uppercase text-zinc-400 mb-3">
                Identify the Historical Matchup
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((option, idx) => {
                  const isWrong = selectedWrong.includes(option);
                  return (
                    <button
                      key={idx}
                      disabled={isWrong}
                      onClick={() => handleGuess(option)}
                      className={`p-4 rounded-2xl text-left text-xs font-bold transition-all border ${
                        isWrong
                          ? 'bg-rose-50 border-rose-200 text-rose-400 line-through cursor-not-allowed'
                          : 'bg-white border-zinc-200 hover:border-blue-600 hover:shadow-md text-zinc-800'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Showdown / Victory Result */}
          {(gameWon || gameOver) && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
              
              {/* Head-to-Head Duel Card */}
              {isDuelActive && (
                <div className="mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Head-to-Head Showdown
                  </span>
                  
                  {isVictory && (
                    <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4">
                      🏆 Victory — Outperformed @{duelHandle} by {pointDiff.toLocaleString()} PTS!
                    </div>
                  )}
                  {isDefeat && (
                    <div className="inline-block bg-rose-100 text-rose-800 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4">
                      💀 Defeat — @{duelHandle} edged you out by {pointDiff.toLocaleString()} PTS!
                    </div>
                  )}
                  {isTie && (
                    <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4">
                      🤝 Stalemate — Perfect score tie!
                    </div>
                  )}

                  <div className="grid grid-cols-3 items-center max-w-sm mx-auto">
                    <div>
                      <p className="text-xs font-bold text-zinc-700 truncate">@{duelHandle}</p>
                      <p className="text-xl font-black font-mono text-zinc-900">{duelPts.toLocaleString()}</p>
                    </div>
                    <div className="text-zinc-300 font-black text-sm">VS</div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 truncate">You (@{playerName})</p>
                      <p className="text-xl font-black font-mono text-blue-600">{userFinalScore.toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleShareShowdown}
                    className="mt-5 w-full py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    Share Showdown Result
                  </button>
                </div>
              )}

              {/* Standard Outcome */}
              <h2 className="text-2xl font-black uppercase tracking-tight mb-1 text-zinc-900">
                {gameWon ? 'Fixture Solved!' : 'Game Over'}
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                {challenge.subject} ({challenge.year})
              </p>

              <div className="mx-auto mb-6 max-w-xs rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-center">
                <p className="text-[11px] font-black uppercase tracking-wide text-zinc-900">
                  SportsHistoryClue #{matchLabel}
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  {gridCells.map((cell, index) => (
                    <span key={index} className="mx-0.5 inline-block">{cell}</span>
                  ))}
                  <span className="ml-1 font-mono text-xs font-bold text-zinc-700">
                    · {userFinalScore.toLocaleString()} PTS
                  </span>
                </p>
                <p className="mt-1 text-xs font-bold text-amber-600">🔥 {streak}-Day Streak</p>
              </div>

              <div className="inline-block bg-blue-50 border border-blue-200 px-6 py-3 rounded-2xl mb-6">
                <span className="block text-[10px] font-mono font-bold uppercase text-blue-600">Final Score</span>
                <span className="text-3xl font-black font-mono text-blue-600">{userFinalScore.toLocaleString()} PTS</span>
              </div>

              {!isDuelActive && (
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={handleShareResult}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    Share Result
                  </button>
                  <button
                    onClick={handleShareResult}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Copy Score
                  </button>
                  <button
                    onClick={handleChallengeScout}
                    className="px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Challenge a Scout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
          Loading Drop...
        </div>
      }
    >
      <DailyDropArena />
    </Suspense>
  );
}
