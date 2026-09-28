'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import {
  isSoundMuted,
  playUnlockClick,
  playVictoryFanfare,
  playWhistle,
  playWrongBuzzer,
  triggerHaptic,
} from '@/lib/audio';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { rememberSolvedCase } from '@/lib/solved-cases';
import { arenaHref, nextStorylineMatch, storylineById } from '@/lib/storylines';
import { findCase } from '@/lib/case-files';
import { arrangeClueLadder } from '@/lib/clue-ladder';
import { sanitizeClues } from '@/lib/clue-sanitation';
import { ChallengeFriendModal } from '@/components/ChallengeFriendModal';
import { cn } from '@/lib/utils';
import { cosmeticName } from '@/lib/cosmetics';
import { useCosmeticWallet } from '@/lib/useCosmeticWallet';
import { CommunityClueDistribution } from '@/components/CommunityClueDistribution';
import { HistoricalMiniRecap } from '@/components/HistoricalMiniRecap';
import { DailyDropWaitHub } from '@/components/game/DailyDropWaitHub';
import { recordScoutMatch } from '@/lib/scout-dossier';
import { activeStreak, loadSolvedHistory, recordSolvedChapter, recordSolvedDate, utcDateKey } from '@/lib/utc-streak';
import { clearStaleGameSession } from '@/lib/game-session';
import { isDateKey } from '@/lib/archive-calendar';
import { rememberDailyCompletion } from '@/lib/daily-completions';
import { decideWinner, duelHandleName, duelPrompt, rememberDuel } from '@/lib/duels';
import {
  FAVORITE_CLUB_KEY,
  derbyContributionLine,
  findPremierLeagueClub,
  isPremierLeagueClub,
} from '@/lib/premier-league';
import { TacticalClueBoard } from '@/components/game/TacticalClueBoard';
import {
  FREE_TILE_ID,
  STARTING_SCORE,
  applyTileCost,
  buildTacticalBoard,
  formatPoints,
  safeImageUrl,
} from '@/lib/tactical-board';

interface DailyFixture {
  id: string;
  date_key: string;
  category: string;
  title?: string;
  clues: string[];
  options: string[];
  optionsLocked?: boolean;
  sportId?: string;
  sportName?: string;
  imageUrl?: string | null;
}

function cleanFixture(fixture: DailyFixture): DailyFixture {
  const rest: DailyFixture = { ...fixture };
  delete rest.title;
  if (rest.optionsLocked) {
    return {
      ...rest,
      clues: (rest.clues ?? []).map((clue) => clue.trim()).filter(Boolean).slice(0, 6),
      options: rest.options,
    };
  }
  const file = findCase(rest.id);
  const category = file?.context || rest.category;
  return {
    ...rest,
    clues: arrangeClueLadder(
      sanitizeClues(rest.clues ?? [], {
        title: file?.title || rest.category,
        year: file?.year,
      }),
      { category },
    ),
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

const PLAY_COLUMN = 'flex h-full w-full flex-1 flex-col justify-between gap-2';

export function getSportLabel(sport?: string) {
  const key = sport?.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  switch (key) {
    case 'football':
    case 'soccer':
      return '⚽ FOOTBALL';
    case 'ice hockey':
    case 'hockey':
      return '🏒 ICE HOCKEY';
    case 'boxing':
      return '🥊 BOXING';
    case 'tennis':
      return '🎾 TENNIS';
    case 'athletics':
    case 'track':
      return '🏃 ATHLETICS';
    default:
      return '🏆 SPORTS CLUE';
  }
}

const GUESS_BUTTON =
  'border-[2.5px] border-zinc-950 bg-white hover:bg-zinc-100 active:translate-y-[2px] rounded-xl p-3.5 text-center font-black text-sm md:text-base leading-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all';

export function DailyDropArena({
  specificMatch = '',
  campaignId = '',
  initialFixture = null,
  initialDuel = '',
  initialDuelPts = 0,
  archiveDate = '',
  archiveId = '',
  training = false,
}: {
  specificMatch?: string;
  campaignId?: string;
  initialFixture?: DailyFixture | null;
  initialDuel?: string;
  initialDuelPts?: number;
  archiveDate?: string;
  archiveId?: string;
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

  const [challenge, setChallenge] = useState<DailyFixture | null>(
    initialFixture ? cleanFixture(initialFixture) : null,
  );
  const [choiceOptions, setChoiceOptions] = useState<string[]>(initialFixture?.options ?? []);
  const activeArchiveDate = isDateKey(archiveDate) ? archiveDate : null;
  const [solution, setSolution] = useState<Solution | null>(null);
  const [unlockedTiles, setUnlockedTiles] = useState<string[]>([FREE_TILE_ID]);
  const [activeTile, setActiveTile] = useState(FREE_TILE_ID);
  const [archiveImage, setArchiveImage] = useState<string | null>(null);
  const [archivePhotoMissing, setArchivePhotoMissing] = useState(false);
  const [score, setScore] = useState(STARTING_SCORE);
  const [selectedWrong, setSelectedWrong] = useState<string[]>([]);
  const [litGuess, setLitGuess] = useState<string | null>(null);
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
  const challengeIdRef = useRef('');
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
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
      if (isPremierLeagueClub(storedClub)) setFavoriteClubId(storedClub);

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
          if (typeof clubId === 'string' && isPremierLeagueClub(clubId)) {
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
    if (specificMatch || activeArchiveDate || archiveId) return;
    clearStaleGameSession(window.localStorage, utcDateKey(new Date()), {
      loadingLatest: true,
      challengeId: challenge?.id,
    });
  }, [specificMatch, activeArchiveDate, archiveId, challenge?.id]);

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
    const marker = `${challenge.id}:${gameWon ? Math.max(unlockedTiles.length, 1) : 0}`;
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
        clueIndex: gameWon ? Math.min(6, Math.max(unlockedTiles.length, 1)) : 0,
        won: gameWon,
        clientKey,
      }),
    })
      .then(() => setStatsRefresh((value) => value + 1))
      .catch(() => setStatsRefresh((value) => value + 1));
  }, [gameWon, gameOver, challenge, unlockedTiles.length]);

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
      setUnlockedTiles([FREE_TILE_ID]);
      setActiveTile(FREE_TILE_ID);
      setArchiveImage(null);
      setArchivePhotoMissing(false);
      setScore(STARTING_SCORE);
      challengeIdRef.current = '';
      setSelectedWrong([]);
      setGameWon(false);
      setGameOver(false);
      setCoinsEarned(0);
      try {
        const query = new URLSearchParams();
        if (specificMatch) query.set('match', specificMatch);
        else if (archiveId) query.set('id', archiveId);
        else if (activeArchiveDate) query.set('date', activeArchiveDate);
        const suffix = query.toString() ? `?${query.toString()}` : '';
        const response = await fetch(`/api/daily${suffix}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Daily drop unavailable');
        }
        const payload = (await response.json()) as DailyResponse;
        const fixture = cleanFixture(payload.challenge ?? payload);
        whistled.current = false;
        challengeIdRef.current = fixture.id;
        setChoiceOptions(setupOptions(fixture.options ?? []));
        setChallenge(fixture);
      } catch {
        showToast('Could not load this drop.');
        setChallenge(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [activeArchiveDate, archiveId, specificMatch]);

  const openWithWhistle = () => {
    if (whistled.current || isSoundMuted()) return;
    whistled.current = true;
    playWhistle();
  };

  const selectTile = (index: number) => {
    if (!challenge) return;
    const tile = buildTacticalBoard(challenge.clues)[index];
    if (!tile) return;
    if (unlockedTiles.includes(tile.id)) {
      setActiveTile(tile.id);
      return;
    }
    if (gameWon || gameOver) return;
    playUnlockClick();
    triggerHaptic(12);
    setUnlockedTiles((prev) => (prev.includes(tile.id) ? prev : [...prev, tile.id]));
    setActiveTile(tile.id);
    setScore((prev) => applyTileCost(prev, tile.cost));
    if (!tile.image || archiveImage || challenge.imageUrl || archivePhotoMissing) return;
    const requestedId = challenge.id;
    void fetch(`/api/daily/photo?id=${encodeURIComponent(requestedId)}`)
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: { imageUrl?: string | null } | null) => {
        if (challengeIdRef.current !== requestedId) return;
        const url = safeImageUrl(payload?.imageUrl);
        if (url) setArchiveImage(url);
        else setArchivePhotoMissing(true);
      })
      .catch(() => {
        if (challengeIdRef.current === requestedId) setArchivePhotoMissing(true);
      });
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
        recordSolvedChapter(archiveId || challenge.id);
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
        recordScoutMatch({
          id: challenge.id,
          date: solvedKey,
          sport: challenge.sportName || challenge.category,
          score,
          tilesUnlocked: Math.min(5, Math.max(1, unlockedTiles.length)),
          won: true,
        });

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
        const today = utcDateKey(new Date());
        recordScoutMatch({
          id: challenge.id,
          date: isDateKey(challenge.date_key) ? challenge.date_key : today,
          sport: challenge.sportName || challenge.category,
          score: newScore,
          tilesUnlocked: Math.min(5, Math.max(1, unlockedTiles.length)),
          won: false,
        });
        if (!specificMatch) {
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

  const campaign = storylineById(campaignId);
  const playingArchive = Boolean(specificMatch);

  if (loading || !challenge) {
    return (
      <div className={`${PLAY_COLUMN} items-center justify-center bg-[#fbf9f5] font-mono text-xs uppercase text-zinc-400`}>
        {loading ? 'Loading Match Fixture...' : 'Drop unavailable'}
      </div>
    );
  }

  const isDuelActive = Boolean(duelHandle);
  const userFinalScore = gameWon ? score : 0;
  const pledgedClub = findPremierLeagueClub(favoriteClubId);
  const isVictory = isDuelActive && userFinalScore > duelPts;
  const isDefeat = isDuelActive && userFinalScore < duelPts;
  const isTie = isDuelActive && userFinalScore === duelPts;
  const slotCount = 5;
  const revealedCount = Math.min(unlockedTiles.length, slotCount);
  const gridCells: string[] = Array.from({ length: slotCount }, (_, index) => {
    if (index < revealedCount) return '🟩';
    return '⬜';
  });
  if (selectedWrong.length > 0) {
    gridCells[Math.min(revealedCount, slotCount - 1)] = '🟥';
  }
  const gridLine = gridCells.join(' ');
  const matchLabel = String(dayIndexFromKey(challenge.date_key));
  const nextMatch = nextStorylineMatch(campaignId, challenge.id);
  const sportLabel = getSportLabel(challenge.sportName || challenge.sportId || challenge.category);
  const playing = !gameWon && !gameOver;
  const sportHref = challenge.sportId ? `/disciplines?sport=${encodeURIComponent(challenge.sportId)}` : '/disciplines';
  const playerHandle = playerName.replace(/^@/, '') || 'Scout';
  const resultUrl = `https://sportshistoryclue.com/?duel=${encodeURIComponent(playerHandle)}&pts=${userFinalScore}`;
  const resultText = [
    'SportsHistoryClue 🏆',
    gridLine,
    `🎯 Solved with ${revealedCount} of 5 tactical clues (${formatPoints(userFinalScore)} PTS)`,
    `🔥 ${streak}-Day Streak`,
    '',
    "Can you crack today's case?",
    resultUrl,
  ].join('\n');

  const handleShareResult = () => {
    sharePayload('SportsHistoryClue', resultText, resultUrl);
  };

  return (
    <div className={`${PLAY_COLUMN} bg-[#fbf9f5] text-zinc-900`} onPointerDown={openWithWhistle}>
      <Navbar
        arcade={{
          sport: sportLabel,
          score: `${score.toLocaleString('en-US')} PTS`,
          streak,
        }}
      />

      {isDuelActive && playing && (
        <p className="mt-1 text-center text-[10px] font-black uppercase tracking-wide text-blue-700">
          ⚔️ VS @{duelHandle} · {duelPts.toLocaleString()} PTS
        </p>
      )}

      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      {playing && (
        <div className="flex min-h-0 flex-1 flex-col">
          {isDateKey(archiveDate) && !archiveId && (
            <span className="mb-1 inline-flex w-fit bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
              📅 ARCHIVE FIXTURE
            </span>
          )}
          {archiveId && (
            <span className="mb-1 inline-flex w-fit bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
              STORYLINE CHAPTER
            </span>
          )}
          {training && (
            <span className="sr-only">SCOUT TRAINING</span>
          )}
          <TacticalClueBoard
            tiles={buildTacticalBoard(challenge.clues)}
            unlocked={unlockedTiles}
            activeId={activeTile}
            imageUrl={safeImageUrl(archiveImage || challenge.imageUrl)}
            imageMissing={archivePhotoMissing}
            locked={gameWon || gameOver}
            onSelect={selectTile}
          />
        </div>
      )}

      {playing && (
        <div className="grid shrink-0 grid-cols-2 gap-2">
          {choiceOptions.map((option, idx) => {
            const isWrong = selectedWrong.includes(option);
            const popped = litGuess === option && !isWrong;
            return (
              <button
                key={idx}
                type="button"
                disabled={isWrong || guessing}
                onClick={() => {
                  setLitGuess(option);
                  void handleGuess(option);
                }}
                className={cn(
                  GUESS_BUTTON,
                  popped && 'bg-blue-600 text-white',
                  isWrong &&
                    'cursor-not-allowed border-rose-600 bg-rose-100 text-rose-700 line-through shadow-none hover:bg-rose-100',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {(gameWon || gameOver) && (
        <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
              
              {/* Head-to-Head Duel Card */}
              {isDuelActive && (
                <div className="mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Head-to-Head Showdown
                  </span>
                  <p className="mb-4 text-sm font-black text-zinc-900">
                    VS @{duelHandle}{opponentTitle ? ` ["${opponentTitle}"]` : ''}
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
                      <p className="text-xl font-black font-mono text-zinc-900">{duelPts.toLocaleString()}</p>
                    </div>
                    <div className="text-zinc-300 font-black text-sm">VS</div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 truncate">
                        You (@{playerName}){cosmeticName(wallet.equippedTitle) ? ` ["${cosmeticName(wallet.equippedTitle)}"]` : ''}
                      </p>
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

              {gameWon && pledgedClub && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-zinc-800">
                    {derbyContributionLine(userFinalScore, pledgedClub.name)}
                  </p>
                  <Link href="/derby" className="mt-2 inline-block text-xs font-bold text-blue-600 hover:text-blue-700">
                    View Fan Table →
                  </Link>
                </div>
              )}

              {gameWon && coinsEarned > 0 && (
                <div className="mb-6 inline-block rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-sm font-black tracking-wide text-amber-800">
                  +{coinsEarned} COINS EARNED 🪙
                </div>
              )}

              {gameWon && campaign && nextMatch && (
                <Link
                  href={arenaHref(nextMatch.key, campaign.id)}
                  className="mb-4 inline-flex px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Next Campaign Match →
                </Link>
              )}
              {gameWon && playingArchive && !campaign && (
                <Link
                  href={sportHref}
                  className="mb-4 inline-flex px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  ← Back to {sportLabel} Archive
                </Link>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setChallengeOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-sm"
                >
                  ⚔️ Challenge a Friend
                </button>
                <button
                  onClick={handleShareResult}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                >
                  Share Result
                </button>
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      void navigator.clipboard.writeText(resultText).then(() => {
                        showToast('📋 Result copied to clipboard!');
                      });
                    }
                  }}
                  className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Copy Score
                </button>
                {(playingArchive || !gameWon) && (
                  <button
                    onClick={handleChallengeScout}
                    className="px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Challenge a Scout
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
                      showToast('⚔️ Duel link copied to clipboard!');
                    });
                  }
                }}
                onShareLink={() => {
                  void sharePayload(
                    'SportsHistoryClue Duel',
                    `⚔️ Duel me on SportsHistoryClue. Beat ${userFinalScore.toLocaleString()} PTS.\n${resultUrl}`,
                    resultUrl,
                  );
                }}
              />
            )}

            <div className="mt-4 space-y-4">
              <CommunityClueDistribution
                challengeId={challenge.id}
                userSolvedClue={gameWon ? Math.min(6, Math.max(unlockedTiles.length, 1)) : 0}
                refreshToken={statsRefresh}
              />
              <HistoricalMiniRecap challenge={challenge} />
            </div>
        </div>
      )}
      <ChallengeFriendModal
        isOpen={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        matchSlug={findCase(challenge.id)?.slug ?? challenge.id}
        matchTitle={findCase(challenge.id)?.title ?? (playingArchive ? sportLabel : "Today's Daily Drop")}
        userScore={userFinalScore > 0 ? userFinalScore : null}
        category={challenge.category}
        username={playerName}
        campaignId={campaign?.id}
      />
    </div>
  );
}

