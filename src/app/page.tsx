'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import AuthGateModal from '@/components/AuthGateModal';
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
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState('Scout');
  const [streak, setStreak] = useState(1);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check Supabase Auth state & handle
  useEffect(() => {
    const initPlayer = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.username) {
          setPlayerName(profile.username);
        } else if (user.email) {
          setPlayerName(user.email.split('@')[0]);
        }
      } else {
        const saved = localStorage.getItem('shc_handle');
        if (saved) setPlayerName(saved);
      }

      const savedStreak = parseInt(localStorage.getItem('shc_streak') || '1', 10);
      setStreak(savedStreak);
    };

    initPlayer();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        setCurrentUser(session?.user || null);
        if (session?.user?.email) {
          setPlayerName(session.user.email.split('@')[0]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    setCurrentUser(null);
    setPlayerName('Scout');
    localStorage.removeItem('shc_handle');
  };

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
          checkExistingScore(matched);
          setLoading(false);
          return;
        }
      }

      const { data: allMatches } = await supabaseClient
        .from('challenges')
        .select('*')
        .order('id', { ascending: true });

      if (allMatches && allMatches.length > 0) {
        const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const dailyIndex = dayNumber % allMatches.length;
        const todaysMatch = allMatches[dailyIndex];

        setChallenge(todaysMatch);
        setupOptions(todaysMatch);
        checkExistingScore(todaysMatch);
      }

      setLoading(false);
    };

    const checkExistingScore = (item: Challenge) => {
      const scoreKey = `shc_score_${item.slug || item.id}`;
      const savedScore = localStorage.getItem(scoreKey);
      if (savedScore) {
        setScore(parseInt(savedScore, 10));
        setGameWon(true);
        setShowModal(false);
      }
    };

    fetchChallenge();
  }, [specificMatch]);

  // The Daily Drop is free, but playing further archive fixtures requires a Scout account.
  const handlePlayAnotherClick = () => {
    if (!currentUser) {
      setShowModal(false);
      setShowAuthGate(true);
      return;
    }
    handlePlayAnother();
  };

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

      if (!isArchiveMode && !specificMatch) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('shc_streak', newStreak.toString());
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
    const clueNumber = currentClueIdx + 1;
    const squares = Array.from({ length: 6 })
      .map((_, i) => (i < clueNumber ? '🟩' : '⬛'))
      .join('');

    let handlePrompt = playerName;
    if (handlePrompt === 'Scout') {
      const input = prompt('Enter your scout handle for the duel link:', 'Scout');
      if (input && input.trim()) {
        handlePrompt = input.trim();
        localStorage.setItem('shc_handle', handlePrompt);
        setPlayerName(handlePrompt);
      }
    }

    const matchIdentifier = challenge?.slug || challenge?.id;
    const shareUrl = `${window.location.origin}/?vs=${encodeURIComponent(handlePrompt)}&clues=${clueNumber}&pts=${score}&match=${matchIdentifier}`;

    let shareText = '';
    if (challenger && !isArchiveMode) {
      const challengerScoreNum = challengerPts ? parseInt(challengerPts, 10) : 0;
      const resultVerb = score > challengerScoreNum ? 'defeated' : score === challengerScoreNum ? 'tied with' : 'lost to';
      shareText = `SportsHistoryClue Duel ⚔️\nI just ${resultVerb} ${challenger}!\nMe: ${score.toLocaleString()} PTS vs ${challenger}: ${challengerScoreNum.toLocaleString()} PTS\nCan you beat us? 👉 ${shareUrl}`;
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
        <h2 className="text-xl font-black uppercase text-zinc-900 mb-2">No Matches Found</h2>
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
  const isDuel = Boolean(challenger && !isArchiveMode);
  const playerWonDuel = isDuel && score > challengerScoreVal;
  const playerTiedDuel = isDuel && score === challengerScoreVal;

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Soft-gate modal for guests reaching archive-only features */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        featureName="Play Another Match"
      />

      {/* 1. Slide-Out Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-zinc-100">
                <span className="text-sm font-black tracking-tight uppercase">
                  Game Modes &amp; Hub
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Login / Join Card inside Drawer */}
              {!currentUser ? (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="text-xs font-black uppercase tracking-wider text-blue-900 mb-1">
                    Scout Registration
                  </div>
                  <p className="text-[11px] text-blue-700 leading-snug mb-3">
                    Track your solve streaks, win badges, and climb the leaderboard.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login?mode=signup"
                      onClick={() => setMenuOpen(false)}
                      className="py-2 px-3 text-center bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Join Free
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="py-2 px-3 text-center bg-white text-zinc-800 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      {playerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-black text-zinc-900 block truncate max-w-[140px]">
                        {playerName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">
                        ● Logged In
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-[11px] font-bold text-zinc-400 hover:text-rose-600 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="mt-5 space-y-2">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                >
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                    📅
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-zinc-900 group-hover:text-blue-600">
                      Daily Drop
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Today's global mystery match
                    </span>
                  </div>
                </Link>

                <Link
                  href="/campaigns"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                >
                  <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                    🗺️
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-zinc-900 group-hover:text-amber-600">
                      Campaigns &amp; Eras
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Cold War on Ice, Miracle Upsets, etc.
                    </span>
                  </div>
                </Link>

                <Link
                  href="/disciplines"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                >
                  <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                    🏒
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-zinc-900 group-hover:text-emerald-600">
                      Browse by Sport
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Hockey, Football, Olympics, Boxing
                    </span>
                  </div>
                </Link>

                <Link
                  href="/leaderboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                >
                  <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
                    🏆
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-zinc-900 group-hover:text-purple-600">
                      Leaderboard
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Top scouts &amp; daily high scores
                    </span>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                >
                  <span className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center text-sm font-bold">
                    👤
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-zinc-900 group-hover:text-black">
                      Scout Profile
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Career points, accuracy &amp; history
                    </span>
                  </div>
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-zinc-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Scout Handle</span>
                <span className="font-bold text-zinc-800">{playerName}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Daily Streak</span>
                <span className="font-bold text-amber-600">🔥 {streak} Days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenger Notification Bar */}
      {challenger && !isArchiveMode && (
        <div className="bg-blue-600 text-white px-6 py-2.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm sticky top-0 z-30">
          <span>⚡</span>
          <span>
            <strong>{challenger}</strong> scored {challengerScoreVal.toLocaleString()} PTS (Clue {challengerClues || '2'}). Beat them!
          </span>
        </div>
      )}

      {/* Main Header with Login & Join Buttons */}
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

          <div className="flex items-center gap-3 sm:gap-4">
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

            {/* Auth Buttons in Header */}
            {!currentUser ? (
              <div className="hidden sm:flex items-center gap-2 border-l border-zinc-200 pl-3">
                <Link
                  href="/login"
                  className="px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                >
                  Join
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 border-l border-zinc-200 pl-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">
                    {playerName.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[80px] truncate">{playerName}</span>
                </Link>
              </div>
            )}

            {/* Hamburger / Modes */}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              aria-label="Open Modes Menu"
            >
              <span>☰</span>
              <span className="hidden sm:inline">Modes</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Deduction Arena */}
      <div className="max-w-2xl w-full mx-auto px-6 py-6 flex-1 flex flex-col justify-center relative z-10">
        {gameWon ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {isDuel && (
              <div
                className={`p-5 rounded-3xl border text-center ${
                  playerWonDuel
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : playerTiedDuel
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase tracking-wider block mb-1">
                  Head-to-Head Result
                </span>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {playerWonDuel
                    ? `🏆 You Defeated ${challenger}!`
                    : playerTiedDuel
                    ? `🤝 Tied with ${challenger}!`
                    : `💀 ${challenger} Won This Round`}
                </h2>
                <div className="flex justify-center items-center gap-6 mt-3 text-xs font-mono font-bold">
                  <div>
                    You: <span className="text-sm font-black">{score.toLocaleString()} PTS</span>
                  </div>
                  <div className="text-zinc-400">VS</div>
                  <div>
                    {challenger}: <span className="text-sm font-black">{challengerScoreVal.toLocaleString()} PTS</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 md:p-8 shadow-sm text-center relative z-10">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold uppercase rounded-full tracking-wider mb-3 inline-block">
                Match Solved · Clue {currentClueIdx + 1} of 6
              </span>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900">
                {challenge.subject} ({challenge.year})
              </h1>
              <p className="text-sm font-mono font-black text-blue-600 mt-1">
                Score: {score.toLocaleString()} PTS
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 relative z-20">
                <button
                  onClick={handlePlayAnotherClick}
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
                <button
                  onClick={() => setMenuOpen(true)}
                  className="px-4 py-3.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 transition-all"
                >
                  More Modes ☰
                </button>
              </div>
            </div>

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

              {!isArchiveMode && !emailSubscribed && (
                <div className="border-t border-zinc-100 pt-6">
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 text-center">
                    <span className="text-xl block mb-1">📬</span>
                    <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900">
                      Get Tomorrow's Mystery Match at 00:00 UTC
                    </h4>
                    <p className="text-xs text-zinc-500 font-medium mt-1 mb-4">
                      One daily 60-second sports puzzle directly to your inbox. No spam.
                    </p>

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
                  </div>
                </div>
              )}
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

            <div className="space-y-2 relative z-20">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black text-xl font-bold w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"
            >
              ✕
            </button>

            <span className="text-4xl block mb-2">{gameWon ? '🏆' : '⏱️'}</span>
            <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              {isDuel
                ? playerWonDuel
                  ? `You Beat ${challenger}!`
                  : playerTiedDuel
                  ? `Tied with ${challenger}!`
                  : `${challenger} Wins!`
                : gameWon
                ? 'Deduction Confirmed!'
                : 'Out of Clues'}
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

            <div className="space-y-2 relative z-10">
              <button
                onClick={handlePlayAnotherClick}
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
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 text-zinc-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:text-zinc-800 block"
              >
                Read Match Dossier &amp; Lore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
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