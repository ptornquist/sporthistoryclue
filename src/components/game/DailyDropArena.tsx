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
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { rememberSolvedCase } from '@/lib/solved-cases';
import { arenaHref, nextStorylineMatch, storylineById } from '@/lib/storylines';
import { findCase } from '@/lib/case-files';
import { presentClues } from '@/lib/present-clues';
import { localizeSurface, swedishAnswer } from '@/lib/decoy-options';
import { swedishSurface } from '@/lib/swedish-surface';
import { ChallengeFriendModal } from '@/components/ChallengeFriendModal';
import { cosmeticName } from '@/lib/cosmetics';
import { useCosmeticWallet } from '@/lib/useCosmeticWallet';
import { CommunityClueDistribution } from '@/components/CommunityClueDistribution';
import { HistoricalMiniRecap } from '@/components/HistoricalMiniRecap';
import { DailyDropWaitHub } from '@/components/game/DailyDropWaitHub';
import { activeStreak, loadSolvedHistory, recordSolvedDate, utcDateKey } from '@/lib/utc-streak';
import { formatArchiveDate, isDateKey } from '@/lib/archive-calendar';
import { formatMessage } from '@/lib/i18n/format';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Locale } from '@/lib/i18n/types';
import { rememberDailyCompletion } from '@/lib/daily-completions';
import { decideWinner, duelHandleName, duelPrompt, rememberDuel } from '@/lib/duels';
import {
  FAVORITE_CLUB_KEY,
  derbyContributionLine,
  findClub,
  isKnownClub,
} from '@/lib/premier-league';

interface DailyFixture {
  id: string;
  date_key: string;
  category: string;
  clues: string[];
  options: string[];
  sportId?: string;
  sportName?: string;
}

function cleanFixture(fixture: DailyFixture, locale: Locale = "sv"): DailyFixture {
  const file = findCase(fixture.id);
  const category = localizeSurface(file?.context || fixture.category, locale);
  return {
    ...fixture,
    category,
    options: (fixture.options ?? []).map((option) => localizeSurface(option, locale)),
    clues: presentClues(fixture.id, fixture.clues ?? [], {
      title: file?.title || fixture.category,
      year: file?.year,
      category,
    }, locale),
  };
}

interface DailyResponse extends DailyFixture {
  challenge?: DailyFixture;
  mode?: string;
}

interface Solution {
  subject: string;
  year: number;
}

function dayIndexFromKey(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function setupOptions(options: string[]): string[] {
  const four = Array.from(new Set(options.filter(Boolean))).slice(0, 4);
  for (let index = four.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = four[index];
    four[index] = four[swap];
    four[swap] = current;
  }
  return four;
}

function MatchModeBanner({
  campaignTitle,
  category,
  specificMatch,
  campaignId,
  archiveDate = '',
  training = false,
}: {
  campaignTitle?: string;
  category: string;
  specificMatch: string;
  campaignId: string;
  archiveDate?: string;
  training?: boolean;
}) {
  if (campaignId && campaignTitle) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-6 py-3 text-amber-950">
        <span className="text-xs font-black uppercase tracking-wide">🏆 Utmaning · {campaignTitle}</span>
        <Link href="/campaigns" className="text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950">
          ← Tillbaka till utmaningar
        </Link>
      </div>
    );
  }
  if (specificMatch) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-6 py-3 text-blue-950">
        <span className="text-xs font-black uppercase tracking-wide">
          📚 Sportarkiv{category ? ` · ${swedishSurface(category)}` : ''}
        </span>
        <Link href="/disciplines" className="text-xs font-bold uppercase tracking-wider text-blue-800 hover:text-blue-950">
          ← Tillbaka till grenar
        </Link>
      </div>
    );
  }
  if (isDateKey(archiveDate)) {
    const label = training ? 'SCOUTTRÄNING' : 'ARKIVKLURING';
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-6 py-3 text-blue-950">
        <span className="text-xs font-black tracking-wide">
          {label} · {formatArchiveDate(archiveDate)}
        </span>
        <Link href="/archive" className="text-xs font-bold tracking-wider text-blue-800 hover:text-blue-950">
          Tillbaka till kalendern
        </Link>
      </div>
    );
  }
  return null;
}

export function DailyDropArena({
  specificMatch = '',
  campaignId = '',
  initialFixture = null,
  initialDuel = '',
  initialDuelPts = 0,
  archiveDate = '',
  training = false,
}: {
  specificMatch?: string;
  campaignId?: string;
  initialFixture?: DailyFixture | null;
  initialDuel?: string;
  initialDuelPts?: number;
  archiveDate?: string;
  training?: boolean;
}) {
  const [duelHandle, setDuelHandle] = useState<string | null>(initialDuel || null);
  const [duelPts, setDuelPts] = useState(initialDuelPts);
  const [opponentTitle, setOpponentTitle] = useState('');
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [favoriteClubId, setFavoriteClubId] = useState<string | null>(null);
  const [statsRefresh, setStatsRefresh] = useState(0);
  const statsSent = useRef<string | null>(null);
  const duelLogged = useRef<string | null>(null);
  const { wallet, awardSolve } = useCosmeticWallet();
  const { locale, messages } = useLanguage();
  const sourceRef = useRef<DailyFixture | null>(initialFixture);
  const optionSourceRef = useRef<string[]>(initialFixture?.options ?? []);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const [challenge, setChallenge] = useState<DailyFixture | null>(
    initialFixture ? cleanFixture(initialFixture) : null,
  );
  const [choiceOptions, setChoiceOptions] = useState<string[]>(initialFixture?.options ?? []);
  const activeArchiveDate = isDateKey(archiveDate) ? archiveDate : null;
  const [solution, setSolution] = useState<Solution | null>(null);
  const [currentClueIdx, setCurrentClueIdx] = useState(0);
  const [score, setScore] = useState(10000);
  const [selectedWrong, setSelectedWrong] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [guessing, setGuessing] = useState(false);
  const [loading, setLoading] = useState(!initialFixture);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [playerName, setPlayerName] = useState('Scout');
  const [streak, setStreak] = useState(1);
  const [solvedDates, setSolvedDates] = useState<string[]>([]);
  const streakLock = useRef(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [soundMuted, setSoundMuted] = useState(true);

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    const next = cleanFixture(source, locale);
    setChallenge((current) => (
      current ? { ...current, category: next.category, clues: next.clues, options: next.options } : next
    ));
    const rawOptions = optionSourceRef.current.length > 0 ? optionSourceRef.current : source.options ?? [];
    setChoiceOptions(rawOptions.map((option) => localizeSurface(option, locale)));
    setSelectedWrong((prev) => prev.map((item) => {
      const match = rawOptions.find((option) => (
        option === item
        || localizeSurface(option, "sv") === item
        || localizeSurface(option, "en") === item
      ));
      return localizeSurface(match ?? item, locale);
    }));
  }, [locale]);
  const whistled = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const applyStoredStreak = (profileStreak?: number | null) => {
      if (streakLock.current) return;
      const history = loadSolvedHistory();
      setSolvedDates(history);
      if (history.length > 0) {
        setStreak(activeStreak(history, utcDateKey(new Date())));
        return;
      }
      if (profileStreak) {
        setStreak(profileStreak);
        return;
      }
      const savedStreak = parseInt(localStorage.getItem('shc_streak') || '1', 10);
      setStreak(savedStreak);
    };

    const initPlayer = async () => {
      const storedClub = localStorage.getItem(FAVORITE_CLUB_KEY);
      if (isKnownClub(storedClub)) setFavoriteClubId(storedClub);

      if (!isSupabaseConfigured) {
        const saved = localStorage.getItem('shc_handle');
        if (saved) setPlayerName(saved);
        applyStoredStreak();
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

          const { data: allegiance } = await supabaseClient
            .from('profiles')
            .select('favorite_club')
            .eq('id', user.id)
            .maybeSingle();
          const clubId = allegiance?.favorite_club;
          if (typeof clubId === 'string' && isKnownClub(clubId)) {
            setFavoriteClubId(clubId);
            localStorage.setItem(FAVORITE_CLUB_KEY, clubId);
          }

          applyStoredStreak(profile?.streak);
        } else {
          const saved = localStorage.getItem('shc_handle');
          if (saved) setPlayerName(saved);
          applyStoredStreak();
        }
      } catch {
        const saved = localStorage.getItem('shc_handle');
        if (saved) setPlayerName(saved);
        applyStoredStreak();
      }
    };

    initPlayer();
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setSoundMuted(isSoundMuted());
    });
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      const params = new URLSearchParams(window.location.search);
      setDuelHandle(params.get('duel'));
      const pts = params.get('pts');
      setDuelPts(pts ? parseInt(pts, 10) || 0 : 0);
    });
  }, []);

  useEffect(() => {
    if ((!gameWon && !gameOver) || !challenge) return;
    const marker = `${challenge.id}:${gameWon ? currentClueIdx + 1 : 0}`;
    if (statsSent.current === marker) return;
    statsSent.current = marker;
    const storageKey = `shc_stat_${challenge.id}`;
    let clientKey = "";
    try {
      clientKey = window.localStorage.getItem(storageKey) || "";
      if (!/^[a-z0-9]{8,80}$/i.test(clientKey)) {
        clientKey = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
        window.localStorage.setItem(storageKey, clientKey);
      }
    } catch {
      clientKey = "guestkey1";
    }
    void fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: challenge.id,
        clueIndex: gameWon ? currentClueIdx + 1 : 0,
        won: gameWon,
        clientKey,
      }),
    })
      .then(() => setStatsRefresh((value) => value + 1))
      .catch(() => setStatsRefresh((value) => value + 1));
  }, [gameWon, gameOver, challenge, currentClueIdx]);

  useEffect(() => {
    if (!duelHandle || !isSupabaseConfigured) return;
    let cancelled = false;
    void Promise.resolve(
      supabaseClient
        .from('profiles')
        .select('equipped_title')
        .ilike('username', duelHandle)
        .maybeSingle(),
    ).then(({ data, error }) => {
      if (!cancelled && !error) setOpponentTitle(cosmeticName(data?.equipped_title));
    }).catch(() => {
      if (!cancelled) setOpponentTitle('');
    });
    return () => {
      cancelled = true;
    };
  }, [duelHandle]);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!specificMatch) setLoading(true);
      setSolution(null);
      setCurrentClueIdx(0);
      setScore(10000);
      setSelectedWrong([]);
      setGameWon(false);
      setGameOver(false);
      setCoinsEarned(0);
      try {
        const query = new URLSearchParams();
        if (specificMatch) query.set('match', specificMatch);
        else if (activeArchiveDate) query.set('date', activeArchiveDate);
        const suffix = query.toString() ? `?${query.toString()}` : '';
        const response = await fetch(`/api/daily${suffix}`);
        if (!response.ok) {
          throw new Error('Daily drop unavailable');
        }
        const payload = (await response.json()) as DailyResponse;
        const raw = payload.challenge ?? payload;
        sourceRef.current = raw;
        const shuffled = setupOptions(raw.options ?? []);
        optionSourceRef.current = shuffled;
        const fixture = cleanFixture(raw, localeRef.current);
        whistled.current = false;
        setChoiceOptions(shuffled.map((option) => localizeSurface(option, localeRef.current)));
        setChallenge(fixture);
      } catch {
        showToast('Kunde inte ladda kluringen.');
        setChallenge(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [activeArchiveDate, specificMatch]);

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
    if (!challenge) return;
    if (currentClueIdx < challenge.clues.length - 1) {
      playCluePenalty();
      triggerHaptic(20);
      setCurrentClueIdx(prev => prev + 1);
      setScore(prev => Math.max(1000, prev - 1500));
    }
  };

  const logFinishedDuel = (playerScore: number) => {
    if (!duelHandle || !challenge) return;
    const marker = `${challenge.id}:${duelHandle}:${playerScore}`;
    if (duelLogged.current === marker) return;
    duelLogged.current = marker;
    const own = duelHandleName(playerName);
    const challengerUsername = duelHandle.replace(/^@/, '').trim();
    const body = {
      challengeId: challenge.id,
      challengerUsername,
      challengerScore: duelPts,
      opponentUsername: own,
      opponentScore: playerScore,
    };
    void fetch('/api/duels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { duelId?: string };
        if (!payload.duelId) return;
        rememberDuel({
          id: payload.duelId,
          created_at: new Date().toISOString(),
          challenge_id: challenge.id,
          challenger_username: challengerUsername,
          challenger_score: duelPts,
          opponent_username: own,
          opponent_score: playerScore,
          winner_username: decideWinner(challengerUsername, duelPts, own, playerScore),
        });
      })
      .catch(() => undefined);
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
        playVictoryFanfare();
        triggerHaptic([50, 50, 100]);
        setGameWon(true);
        rememberSolvedCase(challenge.id, score);
        const today = utcDateKey(new Date());
        const solvedKey = isDateKey(challenge.date_key) ? challenge.date_key : today;
        if (!specificMatch) {
          void rememberDailyCompletion(
            { dropDate: solvedKey, solved: true, score, challengeId: challenge.id },
            currentUser?.id ?? null,
          );
        }
        const history = specificMatch ? loadSolvedHistory() : recordSolvedDate(solvedKey);
        const newStreak = specificMatch ? streak + 1 : activeStreak(history, today);
        streakLock.current = true;
        if (!specificMatch) setSolvedDates(history);
        setStreak(newStreak);
        localStorage.setItem('shc_streak', newStreak.toString());

        if (currentUser?.id && isSupabaseConfigured) {
          supabaseClient
            .from('profiles')
            .update({ streak: newStreak })
            .eq('id', currentUser.id)
            .then();
        }
        const reward = await awardSolve({
          matchId: challenge.id,
          pointScore: score,
          isDaily: !specificMatch,
          streakContinued: newStreak >= 2,
          duelWon: Boolean(duelHandle) && score > duelPts,
          newStreak,
        });
        setCoinsEarned(reward.earned);
        logFinishedDuel(score);
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
        if (!specificMatch) {
          const today = utcDateKey(new Date());
          const dropDate = isDateKey(challenge.date_key) ? challenge.date_key : today;
          void rememberDailyCompletion(
            { dropDate, solved: false, score: newScore, challengeId: challenge.id },
            currentUser?.id ?? null,
          );
        }
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
        logFinishedDuel(0);
      }
    } catch {
      showToast('Kunde inte kontrollera svaret.');
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
      showToast('📋 Resultatet kopierades!');
    }
  };

  const handleChallengeScout = async () => {
    const handle = playerName.replace(/^@/, '') || 'Scout';
    const link = `https://sportshistoryclue.com/?duel=${encodeURIComponent(handle)}&pts=${score}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      showToast('⚔️ Duellänken kopierades!');
    }
  };

  const handleShareShowdown = async () => {
    if (!duelHandle) return;
    const userScore = gameWon ? score : 0;
    const handle = playerName.replace(/^@/, '') || 'Scout';
    const outcome = userScore > duelPts 
      ? `Jag slog @${duelHandle}`
      : userScore === duelPts
      ? `Oavgjort mot @${duelHandle}`
      : `Jämn duell mot @${duelHandle}`;

    const text = [
      '⚔️ DUELL i SportsHistoryClue!',
      outcome,
      `Jag: ${userScore.toLocaleString('sv-SE')} poäng mot @${duelHandle}: ${duelPts.toLocaleString('sv-SE')} poäng`,
      'Kan du slå oss båda? Spela dagens kluring:',
      `https://sportshistoryclue.com/?duel=${encodeURIComponent(handle)}&pts=${userScore}`,
    ].join('\n');

    const url = `https://sportshistoryclue.com/?duel=${encodeURIComponent(handle)}&pts=${userScore}`;
    await sharePayload('SportsHistoryClue-duell', text, url);
  };

  const campaign = storylineById(campaignId);
  const playingArchive = Boolean(specificMatch);

  if (loading || !challenge) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col font-mono text-xs uppercase text-zinc-400">
        <MatchModeBanner
          campaignTitle={campaign?.title}
          category=""
          specificMatch={specificMatch}
          campaignId={campaignId}
          archiveDate={activeArchiveDate ?? ''}
          training={training}
        />
        <div className="flex flex-1 items-center justify-center">
          {loading ? messages.play.loading : messages.play.unavailable}
        </div>
      </main>
    );
  }

  const isDuelActive = Boolean(duelHandle);
  const userFinalScore = gameWon ? score : 0;
  const pledgedClub = findClub(favoriteClubId);
  const isVictory = isDuelActive && userFinalScore > duelPts;
  const isDefeat = isDuelActive && userFinalScore < duelPts;
  const isTie = isDuelActive && userFinalScore === duelPts;
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
  const viewingArchiveDate = activeArchiveDate !== null;
  const nextMatch = nextStorylineMatch(campaignId, challenge.id);
  const sportLabel = challenge.sportName || challenge.category;
  const sportHref = challenge.sportId ? `/disciplines?sport=${encodeURIComponent(challenge.sportId)}` : '/disciplines';
  const playerHandle = playerName.replace(/^@/, '') || 'Scout';
  const resultUrl = `https://sportshistoryclue.com/?duel=${encodeURIComponent(playerHandle)}&pts=${userFinalScore}`;
  const resultText = [
    'SportsHistoryClue 🏆',
    gridLine,
    `🎯 Löst på ledtråd ${revealedCount} av 6 (${userFinalScore.toLocaleString('sv-SE')} poäng)`,
    `🔥 ${streak} dagars svit`,
    '',
    'Kan du knäcka dagens kluring?',
    resultUrl,
  ].join('\n');

  const handleShareResult = () => {
    sharePayload('SportsHistoryClue', resultText, resultUrl);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between">
      <div>
        <Navbar />
        <MatchModeBanner
          campaignTitle={campaign?.title}
          category={challenge.category}
          specificMatch={specificMatch}
          campaignId={campaignId}
          archiveDate={activeArchiveDate ?? ''}
          training={training}
        />

        {/* Duel Banner */}
        {isDuelActive && !gameWon && !gameOver && (
          <div className="bg-blue-600 text-white px-4 py-2.5 text-center text-xs font-bold tracking-wide">
            {formatMessage(messages.play.duelLive, {
              handle: duelHandle ?? '',
              title: opponentTitle ? ` ["${opponentTitle}"]` : '',
              points: duelPts.toLocaleString('sv-SE'),
            })}
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
                {playingArchive
                  ? (campaign ? messages.play.campaignMatch : messages.play.archiveMatch)
                  : messages.play.daily}
              </h1>
              {!playingArchive && (
                <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                  {messages.play.puzzleLabel}{dayIndexFromKey(challenge.date_key)} · {challenge.date_key} UTC
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">{messages.play.possibleScore}</span>
              <span className="text-2xl font-black text-blue-600 font-mono">
                {score.toLocaleString('sv-SE')} <span className="text-xs text-zinc-400 font-sans">{messages.play.points}</span>
              </span>
            </div>
          </div>

          {!playingArchive && (
            <div className="mb-6 flex items-center justify-center gap-4">
              {viewingArchiveDate ? (
                <>
                  <Link href="/" className="text-blue-600 font-bold text-xs hover:underline">
                    {messages.play.backToday}
                  </Link>
                  <Link
                    href="/archive"
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider transition-all border border-zinc-200"
                  >
                    <span>{messages.play.fullCalendar}</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/archive"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider transition-all border border-zinc-200"
                >
                  <span>{messages.play.openCalendar}</span>
                  <span className="text-zinc-400">→</span>
                </Link>
              )}
            </div>
          )}

          {/* Clues Box */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                {formatMessage(messages.play.clueProgress, {
                  current: currentClueIdx + 1,
                  total: challenge.clues.length,
                })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={handleToggleSound}
                  aria-pressed={soundMuted}
                  aria-label={soundMuted ? messages.play.soundOn : messages.play.soundOff}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-sm hover:border-blue-600"
                >
                  {soundMuted ? '🔇' : '🔊'}
                </button>
                <span className="text-xs font-mono font-bold text-amber-600">
                  🔥 {formatMessage(messages.play.streak, { count: streak })}
                </span>
              </div>
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
                className="w-full min-h-[48px] touch-manipulation py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors active:scale-[0.98]"
              >
                {messages.play.revealNext}
              </button>
            )}
          </div>

          {/* Options / Deduction Grid */}
          {!gameWon && !gameOver && (
            <div>
              <p className="text-xs font-mono font-bold uppercase text-zinc-400 mb-3">
                {messages.play.identify}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 touch-manipulation">
                {choiceOptions.map((option, idx) => {
                  const isWrong = selectedWrong.includes(option);
                  return (
                    <button
                      key={idx}
                      disabled={isWrong || guessing}
                      onClick={() => handleGuess(option)}
                      className={`min-h-[48px] touch-manipulation p-4 rounded-2xl text-left text-xs font-bold transition-all border active:scale-[0.98] ${
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
            <>
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
              
              {/* Head-to-Head Duel Card */}
              {isDuelActive && (
                <div className="mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Duell man mot man
                  </span>
                  <p className="mb-4 text-sm font-black text-zinc-900">
                    mot @{duelHandle}{opponentTitle ? ` ["${opponentTitle}"]` : ''}
                  </p>
                  
                  {isVictory && (
                    <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black mb-4">
                      {duelPrompt(duelHandle ?? "", userFinalScore, duelPts)}
                    </div>
                  )}
                  {isDefeat && (
                    <div className="inline-block bg-rose-100 text-rose-800 px-4 py-1.5 rounded-full text-xs font-black mb-4">
                      {duelPrompt(duelHandle ?? "", userFinalScore, duelPts)}
                    </div>
                  )}
                  {isTie && (
                    <div className="inline-block bg-zinc-100 text-zinc-700 px-4 py-1.5 rounded-full text-xs font-black mb-4">
                      {duelPrompt(duelHandle ?? "", userFinalScore, duelPts)}
                    </div>
                  )}

                  <div className="grid grid-cols-3 items-center max-w-sm mx-auto">
                    <div>
                      <p className="text-xs font-bold text-zinc-700 truncate">@{duelHandle}</p>
                      <p className="text-xl font-black font-mono text-zinc-900">{duelPts.toLocaleString('sv-SE')}</p>
                    </div>
                    <div className="text-zinc-300 font-black text-sm">MOT</div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 truncate">
                        Du (@{playerName}){cosmeticName(wallet.equippedTitle) ? ` ["${cosmeticName(wallet.equippedTitle)}"]` : ''}
                      </p>
                      <p className="text-xl font-black font-mono text-blue-600">{userFinalScore.toLocaleString('sv-SE')}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleShareShowdown}
                    className="mt-5 w-full py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    {messages.play.shareDuel}
                  </button>
                </div>
              )}

              {/* Standard Outcome */}
              <h2 className="text-2xl font-black uppercase tracking-tight mb-1 text-zinc-900">
                {gameWon ? messages.play.solved : messages.play.gameOver}
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                {solution ? `${swedishAnswer(solution.subject)} (${solution.year})` : messages.play.sealed}
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
                    · {userFinalScore.toLocaleString('sv-SE')} {messages.play.points}
                  </span>
                </p>
                <p className="mt-1 text-xs font-bold text-amber-600">🔥 {formatMessage(messages.play.dayStreak, { count: streak })}</p>
              </div>

              <div className="inline-block bg-blue-50 border border-blue-200 px-6 py-3 rounded-2xl mb-6">
                <span className="block text-[10px] font-mono font-bold uppercase text-blue-600">{messages.play.finalScore}</span>
                <span className="text-3xl font-black font-mono text-blue-600">{userFinalScore.toLocaleString('sv-SE')} {messages.play.points}</span>
              </div>

              {gameWon && pledgedClub && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-zinc-800">
                    {derbyContributionLine(userFinalScore, pledgedClub.name)}
                  </p>
                  <Link href="/derby" className="mt-2 inline-block text-xs font-bold text-blue-600 hover:text-blue-700">
                    {messages.play.fanMap}
                  </Link>
                </div>
              )}

              {gameWon && coinsEarned > 0 && (
                <div className="mb-6 inline-block rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-sm font-black tracking-wide text-amber-800">
                  {formatMessage(messages.play.coins, { count: coinsEarned })}
                </div>
              )}

              {gameWon && campaign && nextMatch && (
                <Link
                  href={arenaHref(nextMatch.key, campaign.id)}
                  className="mb-4 inline-flex px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {messages.play.nextMatch}
                </Link>
              )}
              {gameWon && playingArchive && !campaign && (
                <Link
                  href={sportHref}
                  className="mb-4 inline-flex px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {formatMessage(messages.play.backToSport, { sport: swedishSurface(sportLabel) })}
                </Link>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setChallengeOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-sm"
                >
                  {messages.play.challengeFriend}
                </button>
                <button
                  onClick={handleShareResult}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                >
                  {messages.play.shareResult}
                </button>
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      void navigator.clipboard.writeText(resultText).then(() => {
                        showToast(messages.play.copied);
                      });
                    }
                  }}
                  className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {messages.play.copyScore}
                </button>
                {(playingArchive || !gameWon) && (
                  <button
                    onClick={handleChallengeScout}
                    className="px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    {messages.play.challengeScout}
                  </button>
                )}
              </div>
            </div>

            {gameWon && !playingArchive && (
              <DailyDropWaitHub
                streak={streak}
                solvedDates={solvedDates}
                duelLink={resultUrl}
                onCopyLink={() => {
                  if (navigator.clipboard) {
                    void navigator.clipboard.writeText(resultUrl).then(() => {
                      showToast('⚔️ Duellänken kopierades!');
                    });
                  }
                }}
                onShareLink={() => {
                  void sharePayload(
                    'SportsHistoryClue-duell',
                    `⚔️ Utmana mig i SportsHistoryClue. Slå ${userFinalScore.toLocaleString('sv-SE')} poäng.\n${resultUrl}`,
                    resultUrl,
                  );
                }}
              />
            )}

            <div className="mt-4 space-y-4">
              <CommunityClueDistribution
                challengeId={challenge.id}
                userSolvedClue={gameWon ? currentClueIdx + 1 : 0}
                refreshToken={statsRefresh}
              />
              <HistoricalMiniRecap challenge={challenge} />
            </div>
            </>
          )}
        </div>
      </div>
      <Footer />
      <ChallengeFriendModal
        isOpen={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        matchSlug={findCase(challenge.id)?.slug ?? challenge.id}
        matchTitle={findCase(challenge.id)?.title ?? (playingArchive ? swedishSurface(sportLabel) : 'Dagens kluring')}
        userScore={userFinalScore > 0 ? userFinalScore : null}
        category={challenge.category}
        username={playerName}
        campaignId={campaign?.id}
      />
    </main>
  );
}

