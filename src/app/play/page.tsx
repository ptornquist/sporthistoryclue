'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Challenge {
  id: string;
  category: string;
  title: string;
  clues: string[];
  subject: string;
  year: number;
}

export default function PlayPage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Game State
  const [activeClueIndex, setActiveClueIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(1);
  const [subjectGuess, setSubjectGuess] = useState('');
  const [yearGuess, setYearGuess] = useState<number | ''>('');
  const [status, setStatus] = useState<'playing' | 'won' | 'incorrect'>('playing');
  const [feedback, setFeedback] = useState<string | null>(null);

  // 10,000 starting score, drops 2,000 per additional clue
  const currentScore = Math.max(0, 10000 - (revealedCount - 1) * 2000);

  const fetchRandomChallenge = async () => {
    setLoading(true);
    setStatus('playing');
    setSubjectGuess('');
    setYearGuess('');
    setFeedback(null);
    setActiveClueIndex(0);
    setRevealedCount(1);

    // Fetch available challenges
    const { data } = await supabaseClient
      .from('challenges')
      .select('*')
      .limit(20);

    if (data && data.length > 0) {
      const randomItem = data[Math.floor(Math.random() * data.length)];
      setChallenge({
        ...randomItem,
        clues: typeof randomItem.clues === 'string' ? JSON.parse(randomItem.clues) : randomItem.clues
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
      await fetchRandomChallenge();
    };
    init();
  }, []);

  const handleUnlockClue = () => {
    if (revealedCount < 6) {
      const next = revealedCount + 1;
      setRevealedCount(next);
      setActiveClueIndex(next - 1);
    }
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !subjectGuess.trim() || status === 'won') return;

    const normalizedGuess = subjectGuess.toLowerCase().trim();
    const correctSubject = challenge.subject.toLowerCase().trim();
    const isSubjectMatch =
      normalizedGuess.includes(correctSubject) ||
      correctSubject.includes(normalizedGuess);
    const isYearMatch = yearGuess === '' || Number(yearGuess) === Number(challenge.year);

    if (isSubjectMatch && isYearMatch) {
      setStatus('won');
      setFeedback(`Moment Identified! Cleared on Clue ${revealedCount} for ${currentScore.toLocaleString()} PTS.`);

      if (user) {
        await supabaseClient.from('match_history').insert({
          user_id: user.id,
          challenge_id: challenge.id,
          score: currentScore,
          clues_used: revealedCount,
        });
      }
    } else {
      setStatus('incorrect');
      if (!isSubjectMatch && isYearMatch) {
        setFeedback('Year matches, but subject/fixture is incorrect.');
      } else if (isSubjectMatch && !isYearMatch) {
        setFeedback('Subject confirmed, but the year is off.');
      } else {
        setFeedback('Incorrect subject and year.');
      }

      setTimeout(() => {
        setStatus((prev) => (prev === 'won' ? 'won' : 'playing'));
        setFeedback(null);
      }, 3000);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'ice_hockey':
      case 'hockey':
        return '🏒';
      case 'football':
      case 'soccer':
        return '⚽';
      case 'golf':
        return '⛳';
      case 'tennis':
        return '🎾';
      case 'olympics':
        return '🥇';
      default:
        return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center font-bold uppercase tracking-widest text-xs">
        Loading Arena Fixture...
      </div>
    );
  }

  if (!challenge) {
    return (
      <main className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="text-4xl mb-4">🏟️</div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">NO MATCHES IN ARCHIVE</h1>
        <p className="text-zinc-500 mb-8 max-w-sm text-sm">Add questions to your Supabase challenges table to play.</p>
        <Link href="/" className="text-xs font-black tracking-wider uppercase text-blue-600 hover:underline">
          ← Back to Arena
        </Link>
      </main>
    );
  }

  const clues = challenge.clues || [];

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <div>
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-black transition-colors">
              ← Exit
            </Link>
            <span className="text-zinc-300">/</span>
            <div className="flex items-center gap-2">
              <span>{getCategoryIcon(challenge.category)}</span>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-800">
                Random Series · {challenge.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Score & Stepper */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Score Potential</span>
              <span className="text-lg font-black font-mono tracking-tight text-blue-600">
                {currentScore.toLocaleString()} <span className="text-xs font-semibold text-zinc-400">PTS</span>
              </span>
            </div>

            <div className="flex gap-1.5 ml-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isUnlocked = idx < revealedCount;
                const isActive = idx === activeClueIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => isUnlocked && setActiveClueIndex(idx)}
                    disabled={!isUnlocked}
                    className={`w-7 h-7 rounded-lg text-xs font-black font-mono transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                        : isUnlocked
                        ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        : 'bg-zinc-100 text-zinc-300 cursor-not-allowed border border-dashed border-zinc-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Clue Arena */}
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm mb-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black tracking-wider uppercase">
                Clue {activeClueIndex + 1} of 6
              </span>
              <button
                onClick={fetchRandomChallenge}
                className="text-xs font-bold text-zinc-400 hover:text-black uppercase tracking-wider transition-colors"
              >
                Skip Match ↷
              </button>
            </div>

            <p className="text-2xl md:text-3xl font-black text-zinc-900 leading-snug tracking-tight">
              {clues[activeClueIndex] || 'No further clues available.'}
            </p>
          </div>

          {feedback && (
            <div className={`p-4 rounded-2xl mb-6 text-sm font-bold text-center transition-all ${
              status === 'won'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback}
            </div>
          )}

          {revealedCount > 1 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                Unlocked Clues
              </span>
              {clues.slice(0, revealedCount).map((clue, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveClueIndex(idx)}
                  className={`p-4 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                    idx === activeClueIndex
                      ? 'bg-white border-blue-500 shadow-sm text-zinc-900'
                      : 'bg-zinc-50 border-zinc-200/80 text-zinc-500 hover:bg-zinc-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-zinc-400">#{idx + 1}</span>
                    <span className="line-clamp-1">{clue}</span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold">Review</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Action Controls */}
      <footer className="bg-white border-t border-zinc-200 px-6 py-5 sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto">
          {status === 'won' ? (
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black tracking-tight text-zinc-900">MOMENT CLEARED</h3>
                <p className="text-xs font-semibold text-zinc-500">
                  {challenge.subject} ({challenge.year}) · +{currentScore.toLocaleString()} PTS Earned
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchRandomChallenge}
                  className="px-6 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Next Fixture →
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Exit
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGuess} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={subjectGuess}
                  onChange={(e) => setSubjectGuess(e.target.value)}
                  placeholder="Identify the athlete, club, or historic clash..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="w-full md:w-32">
                <input
                  type="number"
                  value={yearGuess}
                  onChange={(e) => setYearGuess(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Year (opt)"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-semibold font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Submit Guess
                </button>
                <button
                  type="button"
                  onClick={handleUnlockClue}
                  disabled={revealedCount >= 6}
                  className="px-4 py-3.5 bg-zinc-100 border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors whitespace-nowrap"
                >
                  Clue (-2K)
                </button>
              </div>
            </form>
          )}
        </div>
      </footer>
    </main>
  );
}