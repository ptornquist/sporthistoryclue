'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import {
  isSoundMuted,
  playCluePenalty,
  playVictoryFanfare,
  playWhistle,
  playWrongBuzzer,
  toggleSoundMute,
  triggerHaptic,
} from '@/lib/audio';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import { ClueStack } from '@/components/game/ClueStack';
import { DateSwitcher } from '@/components/game/DateSwitcher';
import { GuessQuestionHeader } from '@/components/game/GuessQuestionHeader';
import { SolvedFixtureCard } from '@/components/game/SolvedFixtureCard';
import { findFixtureSolve, lockDropLocally, persistFixtureScore, readLocalDropSolve } from '@/lib/fixture-solves';
import { completePendingDuel } from '@/lib/duels';
import { rememberSolvedCase } from '@/lib/solved-cases';
import { isDateKey, isGuestOpenDrop, shiftUtcDateKey, utcDateKey } from '@/lib/drop-dates';
import { distinctOptionValues, formatOptionText } from '@/lib/option-text';

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

const OLYMPIC_DECOYS = [
  '1896 Athens: First Modern Olympiad (1896)',
  '1936 Berlin Olympics (1936)',
  '1968 Mexico City: Black Power Salute (1968)',
  '1988 Seoul Olympics (1988)',
];

const GENERAL_DECOYS = [
  '1980 Lake Placid: USA vs Soviet Union',
  '1992 Barcelona: USA Dream Team vs Croatia',
  '1994 Lillehammer: Sweden vs Canada',
  '1974 Munich: West Germany vs Netherlands',
];

function setupOptions(options: string[], category: string): string[] {
  const pool = /olympic/i.test(category) ? OLYMPIC_DECOYS : GENERAL_DECOYS;
  const four = distinctOptionValues([...options, ...pool, ...GENERAL_DECOYS], 4);
  for (let index = four.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = four[index];
    four[index] = four[swap];
    four[swap] = current;
  }
  return four;
}

export function DailyDropArena() {
  const [duelHandle, setDuelHandle] = useState<string | null>(null);
  const [duelPts, setDuelPts] = useState(0);

  const [challenge, setChallenge] = useState<DailyFixture | null>(null);
  const [activeMatch, setActiveMatch] = useState<string | null>(null);
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [pinnedDrop, setPinnedDrop] = useState<string | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [currentClueIdx, setCurrentClueIdx] = useState(0);
  const [score, setScore] = useState(10000);
  const [selectedWrong, setSelectedWrong] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [earnedScore, setEarnedScore] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [guessing, setGuessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('Scout');
  const [streak, setStreak] = useState(1);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(true);
  const whistled = useRef(false);

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
    setSoundMuted(isSoundMuted());
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
      setIsSolved(false);
      setEarnedScore(null);
      setGameOver(false);
      try {
        const params = new URLSearchParams(window.location.search);
        const today = utcDateKey();
        const urlDate = params.get('date');
        const urlMatch = params.get('match')?.trim() || '';
        const activeDate = pinnedDrop ?? (isDateKey(urlDate) ? urlDate : null);
        const match = pinnedDrop || activeDate ? '' : urlMatch;
        const query = match
          ? `?match=${encodeURIComponent(match)}`
          : activeDate && activeDate !== today
            ? `?date=${encodeURIComponent(activeDate)}`
            : '';
        const response = await fetch(`/api/daily${query}`);
        if (response.status === 401) {
          setAuthGateOpen(true);
          throw new Error('Daily drop unavailable');
        }
        if (!response.ok) {
          throw new Error('Daily drop unavailable');
        }
        const fixture = (await response.json()) as DailyFixture;
        whistled.current = false;
        setActiveMatch(match || null);
        setChoiceOptions(setupOptions(fixture.options ?? [], fixture.category));
        const dropDate = fixture.date_key || 'today';
        const localKey = 'shc_solved_' + dropDate;
        const isLocallySolved = localStorage.getItem(localKey);
        const localScore = readLocalDropSolve(localStorage, dropDate);
        const solvedRecord = isSupabaseConfigured ? await findFixtureSolve(fixture.id) : null;
        if (isLocallySolved || solvedRecord) {
          const awarded = localScore ?? solvedRecord?.score_awarded ?? 0;
          setIsSolved(true);
          setGameWon(true);
          setEarnedScore(awarded);
          setScore(awarded);
        }
        setChallenge(fixture);
      } catch {
        showToast('Could not load this drop.');
        setChallenge(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [pinnedDrop]);

  const openWithWhistle = () => {
    if (whistled.current || isSoundMuted()) return;
    whistled.current = true;
    playWhistle();
  };

  const handleToggleSound = () => {
    const muted = toggleSoundMute();
    setSoundMuted(muted);
    if (!muted) {
      whistled.current = true;
      playWhistle();
    }
  };

  const handleRevealClue = () => {
    if (!challenge || isSolved || gameWon || gameOver) return;
    if (currentClueIdx < challenge.clues.length - 1) {
      playCluePenalty();
      triggerHaptic(20);
      setCurrentClueIdx(prev => prev + 1);
      setScore(prev => Math.max(1000, prev - 1500));
    }
  };

  const openDate = (dateKey: string) => {
    if (!isGuestOpenDrop(dateKey) && (!authReady || !currentUser)) {
      setAuthGateOpen(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete('match');
    if (dateKey === utcDateKey()) params.delete('date');
    else params.set('date', dateKey);
    const query = params.toString();
    window.history.replaceState(null, '', query ? `/?${query}` : '/');
    setPinnedDrop(dateKey);
  };

  const handleGuess = async (option: string) => {
    if (!challenge || isSolved || gameWon || gameOver || guessing) return;
    setGuessing(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challenge.id,
          date_key: challenge.date_key,
          option,
          match: activeMatch,
        }),
      });
      if (!response.ok) throw new Error('Verify failed');
      const result = (await response.json()) as { correct?: boolean; subject?: string; year?: number };

      if (result.correct) {
        if (result.subject && result.year) {
          setSolution({ subject: result.subject, year: result.year });
        }
        playVictoryFanfare();
        triggerHaptic([50, 50, 100]);
        const dropDate = challenge.date_key || 'today';
        const currentScore = score;
        lockDropLocally(dropDate, currentScore, localStorage);
        setGameWon(true);
        setIsSolved(true);
        setEarnedScore(currentScore);
        rememberSolvedCase(challenge.id, currentScore);
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('shc_streak', newStreak.toString());

        if (isSupabaseConfigured) {
          try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user?.id) {
              await persistFixtureScore({ id: challenge.id, date: dropDate }, currentScore);
              const { data: prof } = await supabaseClient
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .maybeSingle();
              const challengeId = /^\d{4}-\d{2}-\d{2}$/.test(dropDate)
                ? dropDate
                : new Date().toISOString().split('T')[0];
              if (prof?.username) {
                await completePendingDuel(prof.username, challengeId, currentScore);
              }
              const { error: streakError } = await supabaseClient
                .from('profiles')
                .update({ streak: newStreak })
                .eq('id', user.id);
              if (streakError) console.error('Score save error:', streakError);
            }
          } catch (error) {
            console.error('Score save error:', error);
          }
        }
        return;
      }

      playWrongBuzzer();
      triggerHaptic([40, 60, 40]);
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
            match: activeMatch,
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
  const slotCount = 5;
  const revealedCount = Math.min(currentClueIdx + 1, slotCount);
  const gridCells: string[] = Array.from({ length: slotCount }, (_, index) => {
    if (index < revealedCount) return '🟩';
    return '⬜';
  });
  if (selectedWrong.length > 0) {
    gridCells[Math.min(revealedCount, slotCount - 1)] = '🟥';
  }
  const gridLine = gridCells.join(' ');
  const todayKey = utcDateKey();
  const yesterdayKey = shiftUtcDateKey(todayKey, -1);
  const playerHandle = playerName.replace(/^@/, '') || 'Scout';
  const resultUrl = `https://sportshistoryclue.com/?duel=${encodeURIComponent(playerHandle)}&pts=${userFinalScore}`;
  const resultText = [
    'SportsHistoryClue 🏆',
    gridLine,
    `🎯 Solved on Clue ${revealedCount} of 5 (${userFinalScore.toLocaleString()} PTS)`,
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

        <div className="max-w-3xl mx-auto px-6 py-8" onPointerDown={openWithWhistle}>
          {/* Header Info */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {challenge.category}
              </span>
              <h1 className="text-xl font-black uppercase tracking-tight mt-1 text-zinc-900">
                Daily Drop
              </h1>
              <div className="mt-3">
                <DateSwitcher
                  todayKey={todayKey}
                  activeKey={challenge.date_key}
                  onYesterday={() => openDate(yesterdayKey)}
                  onToday={() => openDate(todayKey)}
                  onForward={() => openDate(todayKey)}
                />
              </div>
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

          <div className="mb-6">
            <div className="mb-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleToggleSound}
                aria-pressed={soundMuted}
                aria-label={soundMuted ? 'Unmute match sounds' : 'Mute match sounds'}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-sm hover:border-blue-600"
              >
                {soundMuted ? '🔇' : '🔊'}
              </button>
              <span className="text-xs font-mono font-bold text-amber-600">
                🔥 {streak} Streak
              </span>
            </div>
            <ClueStack
              clues={challenge.clues}
              revealedIndex={currentClueIdx}
              locked={isSolved || gameWon || gameOver}
              onReveal={handleRevealClue}
            />
          </div>

          {/* Options / Deduction Grid */}
          {!isSolved && !gameWon && !gameOver && (
            <div>
              <GuessQuestionHeader />
              <div className="grid grid-cols-2 gap-3">
                {choiceOptions.map((option) => {
                  const isWrong = selectedWrong.includes(option);
                  const label = formatOptionText(option) || option;
                  return (
                    <button
                      key={option}
                      disabled={isWrong || guessing}
                      onClick={() => handleGuess(option)}
                      className={`p-4 rounded-2xl text-left text-xs font-bold transition-all border ${
                        isWrong
                          ? 'bg-rose-50 border-rose-200 text-rose-400 line-through cursor-not-allowed'
                          : 'bg-white border-zinc-200 hover:border-blue-600 hover:shadow-md text-zinc-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(isSolved || gameWon || gameOver) && (
            <div className="space-y-4">
              {isDuelActive && (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
                  <span className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Head-to-Head Showdown
                  </span>
                  {isVictory && (
                    <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black uppercase text-emerald-800">
                      🏆 Victory — Outperformed @{duelHandle} by {pointDiff.toLocaleString()} PTS!
                    </div>
                  )}
                  {isDefeat && (
                    <div className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-1.5 text-xs font-black uppercase text-rose-800">
                      💀 Defeat — @{duelHandle} edged you out by {pointDiff.toLocaleString()} PTS!
                    </div>
                  )}
                  {isTie && (
                    <div className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-black uppercase text-amber-800">
                      🤝 Stalemate — Perfect score tie!
                    </div>
                  )}
                  <button
                    onClick={handleShareShowdown}
                    className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-black"
                  >
                    Share Showdown Result
                  </button>
                </div>
              )}

              {isSolved || gameWon ? (
                <SolvedFixtureCard
                  sport={challenge.category}
                  year={solution?.year ?? null}
                  score={earnedScore ?? score}
                  cells={gridCells}
                  streak={streak}
                  onShare={handleShareResult}
                />
              ) : (
                <div className="rounded-2xl border-2 border-zinc-950 bg-white p-6 text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">Game Over</h2>
                  <p className="mt-2 text-sm font-bold text-zinc-700">
                    {solution ? `${challenge.category} (${solution.year})` : challenge.category}
                  </p>
                  <p className="mt-3 text-lg tracking-widest" aria-label="Score grid">{gridLine}</p>
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

