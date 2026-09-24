'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

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
  fun_facts?: string[] | any;
}

function DailyDropArena() {
  const searchParams = useSearchParams();
  const challenger = searchParams.get('vs');
  const challengerClues = searchParams.get('clues');
  const challengerPts = searchParams.get('pts');
  const specificMatch = searchParams.get('match');

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
  const [playerName, setPlayerName] = useState('Scout');
  const [streak, setStreak] = useState(1);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Load player handle & streak
  useEffect(() => {
    const initPlayer = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.username) {
          setPlayerName(profile.username);
        }
      } else {
        const saved = localStorage.getItem('shc_handle');
        if (saved) setPlayerName(saved);
      }

      const savedStreak = parseInt(localStorage.getItem('shc_streak') || '1', 10);
      setStreak(savedStreak);
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
        '1980 Lake Placid: USA vs Soviet Union',
        '1994 Lillehammer: Sweden vs Canada',
      ].sort(() => Math.random() - 0.5));
    }
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      const todayStr = new Date().toISOString().slice(0, 10);
      let matchQuery = supabaseClient.from('challenges').select('*');

      if (specificMatch) {
        matchQuery = matchQuery.or(`slug.eq.${specificMatch},id.eq.${specificMatch}`);
      } else {
        matchQuery = matchQuery.eq('drop_date', todayStr);
      }

      let { data } = await matchQuery.limit(1).maybeSingle();

      if (!data) {
        const fallback = await supabaseClient
          .from('challenges')
          .select('*')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle();
        data = fallback.data;
      }

      if (data) {
        setChallenge(data);
        setupOptions(data);

        const savedScoreKey = `shc_score_${data.slug || data.id}`;
        const savedScore = localStorage.getItem(savedScoreKey);

        if (savedScore) {
          setScore(parseInt(savedScore, 10));
          setGameWon(true);
          setShowModal(false);
        }
      }
      setLoading(false);
    };

    fetchChallenge();
  }, [specificMatch]);

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
      .limit(20);

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

      const scoreKey = `shc_score_${challenge.slug || challenge.id}`;
      localStorage.setItem(scoreKey, score.toString());
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('shc_streak', newStreak.toString());

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
    const clueNumber = currentClueIdx + 1;
    const squares = Array.from({ length: 6 })
      .map((_, i) => (i < clueNumber ? '🟩' : '⬛'))
      .join('');

    let handlePrompt = playerName;
    if (handlePrompt === 'Scout') {
      const input = prompt('Enter your name for the leaderboard & duel link:', 'Scout');
      if (input && input.trim()) {
        handlePrompt = input.trim();
        localStorage.setItem('shc_handle', handlePrompt);
        setPlayerName(handlePrompt);
      }
    }

    const matchIdentifier = challenge?.slug || challenge?.id;
    const shareUrl = `${window.location.origin}/?vs=${encodeURIComponent(handlePrompt)}&clues=${clueNumber}&pts=${score}&match=${matchIdentifier}`;
    
    let shareText = '';
    if (challenger) {
      const challengerScoreNum = challengerPts ? parseInt(challengerPts, 10) : 0;
      const resultVerb = score > challengerScoreNum ? 'defeated' : score === challengerScoreNum ? 'tied with' : 'lost to';
      shareText = `SportsHistoryClue Duel ⚔️\nI just ${resultVerb} ${challenger} on today's match!\nMe: ${score.toLocaleString()} PTS (Clue ${clueNumber}) vs ${challenger}: ${challengerScoreNum.toLocaleString()} PTS\nCan you beat us? 👉 ${shareUrl}`;
    } else {
      shareText = `SportsHistoryClue 🏆\n${squares} (${score.toLocaleString()} PTS)\nSolved on Clue ${clueNumber} of 6!\nCan you beat ${handlePrompt}? 👉 ${shareUrl}`;
    }

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    await supabaseClient.from('subscribers').insert({ email: newsletterEmail }).select();
    setEmailSubscribed(true);
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
        <h2 className="text-xl font-black uppercase text-zinc-900 mb-2">No Active Match Found</h2>
        <p className="text-zinc-500 text-xs">Verify table population in Supabase.</p>
      </main>
    );
  }

  const parsedFacts = Array.isArray(challenge.fun_facts)
    ? challenge.fun_facts
    : typeof challenge.fun_facts === 'string'
    ? JSON.parse(challenge.fun_facts || '[]')
    : [];

  const challengerScoreVal = challengerPts ? parseInt(challengerPts, 10) : 8000;
  const isDuel = Boolean(challenger);
  const playerWonDuel = isDuel && score > challengerScoreVal;
  const playerTiedDuel = isDuel && score === challengerScoreVal;

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Challenger Notification Bar */}
      {challenger && !isArchiveMode && (
        <div className="bg-blue-600 text-white px-6 py-2.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm">
          <span>⚡</span>
          <span>
            <strong>{challenger}</strong> scored {challengerScoreVal.toLocaleString()} PTS (Clue {challengerClues || '2'}). Beat them!
          </span>
        </div>
      )}

      {/* Top Header */}
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

            <div className="hidden sm:flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
              <span>🔥</span>
              <span>{streak} DAY{streak === 1 ? '' : 'S'}</span>
            </div>

            <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
              Leaderboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Deduction Arena */}
      <div className="max-w-2xl w-full mx-auto px-6 py-6 flex-1 flex flex-col justify-center">
        {gameWon ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Duel Resolution Card */}
            {isDuel && (
              <div className={`p-5 rounded-3xl border text-center ${
                playerWonDuel 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : playerTiedDuel 
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider block mb-1">
                  Head-to-Head Result
                </span>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {playerWonDuel ? `🏆 You Defeated ${challenger}!` : playerTiedDuel ? `🤝 Tied with ${challenger}!` : `💀 ${challenger} Won This Round`}
                </h2>
                <div className="flex justify-center items-center gap-6 mt-3 text-xs font-mono font-bold">
                  <div>You: <span className="text-sm font-black">{score.toLocaleString()} PTS</span></div>
                  <div className="text-zinc-400">VS</div>
                  <div>{challenger}: <span className="text-sm font-black">{challengerScoreVal.toLocaleString()} PTS</span></div>
                </div>
              </div>
            )}

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
                  {copied ? '✓ Result Copied!' : isDuel ? `Reply to ${challenger} ⚡` : 'Challenge a Friend ⚡'}
                </button>
              </div>
            </div>

            {/* Historical Dossier */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Match Dossier
                </span>
                <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                  {challenge.story ||
                    'An extraordinary contest remembered as one of the defining moments in international sporting history.'}
                </p>
              </div>

              {parsedFacts.length > 0 && (
                <div className="border-t border-zinc-100 pt-5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-3">
                    Scout Lore &amp; Trivia
                  </span>
                  <ul className="space-y-3 text-xs text-zinc-600 font-medium">
                    {parsedFacts.map((fact: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-blue-600 font-bold leading-tight">✦</span>
                        <span className="leading-relaxed">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Retention: Daily Drop Email Signup */}
              <div className="border-t border-zinc-100 pt-6">
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 text-center">
                  <span className="text-xl block mb-1">📬</span>
                  <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900">
                    Get Tomorrow's Mystery Match at 00:00 UTC
                  </h4>
                  <p className="text-xs text-zinc-500 font-medium mt-1 mb-4">
                    One daily 60-second sports puzzle directly to your inbox. No spam.
                  </p>

                  {emailSubscribed ? (
                    <div className="text-xs font-mono font-bold text-emerald-600">
                      ✓ You're on the scouting dispatch list!
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribeNewsletter} className="flex gap-2 max-w-sm mx-auto">
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors"
                      >
                        Notify Me
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
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

      {/* Pop-up Modal on Solve */}
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
              {isDuel 
                ? playerWonDuel ? `You Beat ${challenger}!` : playerTiedDuel ? `Tied with ${challenger}!` : `${challenger} Wins!`
                : gameWon ? 'Deduction Confirmed!' : 'Out of Clues'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-1 mb-6">
              Match: <strong>{challenge.subject} ({challenge.year})</strong>
            </p>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-6">
              <span className="block text-[10px] font-mono uppercase text-zinc-400">Final Score</span>
              <span className="text-3xl font-black font-mono text-blue-600">
                {gameWon ? `+${score.toLocaleString()}` : '0'} PTS
              </span>
              {isDuel && (
                <span className="block text-[11px] font-mono font-bold text-zinc-400 mt-1">
                  vs {challenger}: {challengerScoreVal.toLocaleString()} PTS
                </span>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handlePlayAnother}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all"
              >
                Play Another Fixture →
              </button>
              <button
                onClick={handleShare}
                className="w-full py-3 bg-zinc-100 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all"
              >
                {copied ? '✓ Copied!' : isDuel ? `Send Result to ${challenger} ⚡` : 'Challenge a Friend ⚡'}
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