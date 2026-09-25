'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';

interface DailyFixture {
  id: string;
  date_key: string;
  category: string;
  clues: string[];
  options: string[];
}

interface Solution {
  subject: string;
  year: number;
}

function dayIndexFromKey(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().split('T')[0];
}

function DailyDropArena() {
  const [duelHandle, setDuelHandle] = useState<string | null>(null);
  const [duelPts, setDuelPts] = useState(0);

  const [challenge, setChallenge] = useState<DailyFixture | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [currentClueIdx, setCurrentClueIdx] = useState(0);
  const [score, setScore] = useState(10000);
  const [selectedWrong, setSelectedWrong] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [guessing, setGuessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('Scout');
  const [streak, setStreak] = useState(1);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const initPlayer = async () => {
      if (!isSupabaseConfigured) {
        const saved = localStorage.getItem('shc_handle');
        if (saved) setPlayerName(saved);
        const savedStreak = parseInt(localStorage.getItem('shc_streak') || '1', 10);
        setStreak(savedStreak);
        setAuthReady(true);
        return;
      }

      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          setCurrentUser({ id: user.id, email: user.email });
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
      } catch {
        const saved = localStorage.getItem('shc_handle');
        if (saved) setPlayerName(saved);
      } finally {
        setAuthReady(true);
      }
    };

    initPlayer();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDuelHandle(params.get('duel'));
    const pts = params.get('pts');
    setDuelPts(pts ? parseInt(pts, 10) || 0 : 0);
  }, []);

  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      setSolution(null);
      setCurrentClueIdx(0);
      setScore(10000);
      setSelectedWrong([]);
      setGameWon(false);
      setGameOver(false);
      try {
        const query = selectedDate ? `?date=${encodeURIComponent(selectedDate)}` : '';
        const response = await fetch(`/api/daily${query}`);
        if (!response.ok) {
          throw new Error('Daily drop unavailable');
        }
        const fixture = (await response.json()) as DailyFixture;
        setChallenge(fixture);
      } catch {
        showToast('Could not load this drop.');
        setChallenge(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [selectedDate]);

  const handleRevealClue = () => {
    if (!challenge) return;
    if (currentClueIdx < challenge.clues.length - 1) {
      setCurrentClueIdx(prev => prev + 1);
      setScore(prev => Math.max(1000, prev - 1500));
    }
  };

  const openDate = (dateKey: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateKey !== today && (!authReady || !currentUser)) {
      setAuthGateOpen(true);
      return;
    }
    setSelectedDate(dateKey === today ? null : dateKey);
  };

  const handleGuess = async (option: string) => {
    if (!challenge || gameWon || gameOver || guessing) return;
    setGuessing(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challenge.id,
          date_key: challenge.date_key,
          option,
        }),
      });
      if (!response.ok) throw new Error('Verify failed');
      const result = (await response.json()) as { correct?: boolean; subject?: string; year?: number };

      if (result.correct) {
        if (result.subject && result.year) {
          setSolution({ subject: result.subject, year: result.year });
        }
        setGameWon(true);
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('shc_streak', newStreak.toString());

        if (currentUser?.id && isSupabaseConfigured) {
          supabaseClient
            .from('profiles')
            .update({ streak: newStreak })
            .eq('id', currentUser.id)
            .then();
        }
        return;
      }

      const nextWrong = [...selectedWrong, option];
      const newScore = Math.max(0, score - 2500);
      setSelectedWrong(nextWrong);
      setScore(newScore);
      const closed = newScore <= 0 || nextWrong.length >= 3;
      if (closed) {
        setGameOver(true);
        const reveal = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: challenge.id,
            date_key: challenge.date_key,
            option,
            reveal: true,
          }),
        });
        if (reveal.ok) {
          const closedCase = (await reveal.json()) as { subject?: string; year?: number };
          if (closedCase.subject && closedCase.year) {
            setSolution({ subject: closedCase.subject, year: closedCase.year });
          }
        }
      }
    } catch {
      showToast('Could not check that guess.');
    } finally {
      setGuessing(false);
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
        {loading ? 'Loading Match Fixture...' : 'Drop unavailable'}
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
  const matchLabel = String(dayIndexFromKey(challenge.date_key));
  const isArchive = selectedDate !== null;
  const todayKey = new Date().toISOString().split('T')[0];
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
              <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                DROP #{dayIndexFromKey(challenge.date_key)} · {challenge.date_key} UTC
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Potential Score</span>
              <span className="text-2xl font-black text-blue-600 font-mono">
                {score.toLocaleString()} <span className="text-xs text-zinc-400 font-sans">PTS</span>
              </span>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openDate(shiftDateKey(challenge.date_key, -1))}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-700 hover:border-blue-600"
            >
              ‹ Yesterday
            </button>
            <button
              type="button"
              onClick={() => openDate(todayKey)}
              disabled={!isArchive}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-blue-700 disabled:cursor-default disabled:text-zinc-400"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => openDate(shiftDateKey(challenge.date_key, 1))}
              disabled={!isArchive || challenge.date_key >= todayKey}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-700 hover:border-blue-600 disabled:cursor-default disabled:text-zinc-300"
            >
              ›
            </button>
            {isArchive && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Archive Match
              </span>
            )}
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
                {challenge.options.map((option, idx) => {
                  const isWrong = selectedWrong.includes(option);
                  return (
                    <button
                      key={idx}
                      disabled={isWrong || guessing}
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
                {solution ? `${solution.subject} (${solution.year})` : 'Answer sealed until the case closes.'}
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
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        featureName="Past Drops"
      />
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
