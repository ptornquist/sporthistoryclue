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
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Hämta dagens match
  useEffect(() => {
    const fetchDailyChallenge = async () => {
      setLoading(true);

      // Kontrollera om användaren redan spelat dagens match lokalt
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

        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          setOptions([...data.options].sort(() => Math.random() - 0.5));
        } else {
          const correct = `${data.subject} (${data.year})`;
          setOptions([
            correct,
            'Canada vs Soviet Union (1972)',
            'USA vs Soviet Union (1980)',
            'Sweden vs Finland (2006)',
          ].sort(() => Math.random() - 0.5));
        }

        if (savedDate === todayStr) {
          const savedScore = localStorage.getItem('shc_daily_score');
          if (savedScore) {
            setScore(parseInt(savedScore, 10));
            setGameWon(true);
          }
        }
      }
      setLoading(false);
    };

    fetchDailyChallenge();
  }, []);

  const handleSelectOption = (option: string) => {
    if (selectedWrong.includes(option) || gameWon || gameOver || !challenge) return;

    const isCorrect =
      option.toLowerCase().includes(challenge.subject.toLowerCase()) ||
      option.toLowerCase().includes(challenge.title.toLowerCase()) ||
      (challenge.options && option === challenge.options[0]);

    if (isCorrect) {
      setGameWon(true);
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem('shc_daily_date', todayStr);
      localStorage.setItem('shc_daily_score', score.toString());
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

  const handleShare = () => {
    const url = `${window.location.origin}/?vs=Spelare&clues=${currentClueIdx + 1}&pts=${score}`;
    const text = `SportsHistoryClue 🏆\nKlarade dagens match på ledtråd ${currentClueIdx + 1} (${score.toLocaleString()} PTS)!\nKan du slå mig? 👉 ${url}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-400">
        Laddar dagens match...
      </main>
    );
  }

  if (!challenge) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black uppercase text-zinc-900 mb-2">Ingen aktiv match hittades</h2>
        <p className="text-zinc-500 text-xs">Kör SQL-skriptet i Supabase för att ladda in matcherna.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* 1. Utmanarbanner (visas endast om man fått en utmaning via länk) */}
      {challenger && (
        <div className="bg-blue-600 text-white px-6 py-2.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm">
          <span>⚡</span>
          <span>
            <strong>{challenger}</strong> löste denna match på ledtråd {challengerClues || '2'} ({challengerPts ? parseInt(challengerPts).toLocaleString() : '8 000'} PTS). Kan du slå det?
          </span>
        </div>
      )}

      {/* 2. Minimalistisk Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tighter uppercase">
              Sports<span className="text-blue-600">History</span>Clue
            </span>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-bold">
              Daily Drop
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
              Topplista
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Spelplanen – Rakt på sak */}
      <div className="max-w-2xl w-full mx-auto px-6 py-6 flex-1 flex flex-col justify-center">
        {/* Ledtrådskort */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-10 shadow-sm text-center mb-6 relative">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold uppercase rounded-full tracking-wider mb-4 inline-block">
            Ledtråd {currentClueIdx + 1} av 6
          </span>

          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-snug text-zinc-900">
            "{challenge.clues[currentClueIdx]}"
          </h1>

          <div className="mt-6">
            {currentClueIdx < challenge.clues.length - 1 && !gameWon && !gameOver && (
              <button
                onClick={handleUnlockClue}
                className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                Nästa ledtråd (-2 000 PTS) →
              </button>
            )}
          </div>
        </div>

        {/* De 4 Svarskorten */}
        <div className="space-y-2">
          <span className="block text-center text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Vilken historisk match gäller det?
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((option, idx) => {
              const isWrong = selectedWrong.includes(option);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isWrong || gameWon || gameOver}
                  className={`p-4 rounded-2xl border text-left font-bold text-xs md:text-sm transition-all flex items-center justify-between ${
                    isWrong
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through cursor-not-allowed opacity-50'
                      : gameWon
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-400'
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
      </div>

      {/* 4. Avslutningsdossier vid vinst */}
      {(gameWon || gameOver) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
            <span className="text-4xl block mb-2">{gameWon ? '🏆' : '⏱️'}</span>
            <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              {gameWon ? 'Korrekt Deduktion!' : 'Matchen är slut'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-1 mb-6">
              Rätt match: <strong>{challenge.subject} ({challenge.year})</strong>
            </p>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-6">
              <span className="block text-[10px] font-mono uppercase text-zinc-400">Dina Poäng</span>
              <span className="text-3xl font-black font-mono text-blue-600">
                {gameWon ? `+${score.toLocaleString()}` : '0'} PTS
              </span>
              <span className="block text-[11px] text-zinc-500 font-medium mt-1">
                Löst på ledtråd {currentClueIdx + 1} av 6
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleShare}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{copied ? '✓ Länk kopierad!' : 'Utmana en kompis ⚡'}</span>
              </button>

              <Link
                href="/leaderboard"
                className="w-full py-3 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 block"
              >
                Visa Topplistan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-zinc-400 font-mono">
        SportsHistoryClue · Ny match varje dag kl 00:00
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
          Laddar Arena...
        </main>
      }
    >
      <DailyDropArena />
    </Suspense>
  );
}