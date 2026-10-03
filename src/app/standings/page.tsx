'use client';

import React, { useEffect, useState } from 'react';
import { fetchCareerStandings, type CareerStanding } from '@/lib/career-standings';
import Header from '@/components/Header';
import FindScouts from '@/components/game/FindScouts';
import { ScoutHandleLink } from '@/components/game/ScoutHandleLink';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { getFollowingIds } from '@/lib/supabase/network';
import { sendDuelChallenge } from '@/lib/duels';
import { FOOTBALL_CLUBS, HOCKEY_CLUBS, rankLeague, type ClubChampionshipRow } from '@/lib/swedish-clubs';

export function StandingsBoard({
  rows,
  currentUsername,
  onChallenge,
}: {
  rows: CareerStanding[];
  currentUsername?: string | null;
  onChallenge?: (username: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-zinc-500">Inga scouter på tavlan ännu.</p>
    );
  }

  const podium = [rows[1], rows[0], rows[2]];
  const medals = ['🥈', '👑', '🥉'];
  const labels = ['Plats #2', 'Ledare', 'Plats #3'];

  return (
    <>
      <div className="mb-8 grid grid-cols-3 items-end gap-3">
        {podium.map((row, index) => (
          <div
            key={labels[index]}
            className={`rounded-2xl border bg-white p-4 text-center ${
              index === 1 ? 'border-2 border-blue-600 py-6' : 'border-zinc-200'
            }`}
          >
            <span className="text-2xl">{medals[index]}</span>
            <p className="mt-1 text-[11px] font-mono font-bold uppercase text-zinc-400">{labels[index]}</p>
            <p className="truncate text-sm font-black text-zinc-900">
              {row?.username ? (
                <ScoutHandleLink username={row.username} className="hover:underline" />
              ) : (
                '—'
              )}
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-blue-600">
              {(row?.career_score || 0).toLocaleString()} poäng
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Placering</th>
              <th className="px-4 py-3">Scout</th>
              <th className="px-4 py-3">Avklarade</th>
              <th className="px-4 py-3 text-right">Karriärpoäng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-mono text-xs font-bold text-zinc-400">#{index + 1}</td>
                <td className="px-4 py-3 text-sm font-black text-zinc-900">
                  <div className="flex items-center justify-between gap-2">
                    <ScoutHandleLink username={row.username} className="hover:underline" />
                    {onChallenge && (row.username || '').replace(/^@/, '').toLowerCase() !== (currentUsername || '').replace(/^@/, '').toLowerCase() && (
                      <button
                        type="button"
                        onClick={() => onChallenge(row.username || '')}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                      >
                        ⚔️ Utmana
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-zinc-500">{row.fixtures_cleared || 0}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-black text-blue-600">
                  {(row.career_score || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ClubLeagueTabs({
  league,
  onLeague,
}: {
  league: 'hockey' | 'football';
  onLeague: (league: 'hockey' | 'football') => void;
}) {
  const tabClass = (active: boolean) =>
    `rounded-xl border-2 px-4 py-2 text-xs font-black uppercase ${
      active ? 'border-blue-600 bg-blue-600 text-white' : 'border-zinc-200 bg-white text-zinc-700'
    }`;

  return (
    <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Klubbliga">
      <button type="button" role="tab" aria-selected={league === 'hockey'} onClick={() => onLeague('hockey')} className={tabClass(league === 'hockey')}>
        🏒 HOCKEYLIGAN
      </button>
      <button type="button" role="tab" aria-selected={league === 'football'} onClick={() => onLeague('football')} className={tabClass(league === 'football')}>
        ⚽ FOTBOLLSLIGAN
      </button>
    </div>
  );
}

export function ClubChampionshipBoard({
  rows,
  label = 'Klubbligan',
}: {
  rows: ClubChampionshipRow[];
  label?: string;
}) {
  return (
    <section aria-label={label}>
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Placering</th>
              <th className="px-4 py-3">Klubb</th>
              <th className="px-4 py-3">Scouter</th>
              <th className="px-4 py-3 text-right">Poäng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, index) => (
              <tr key={row.club}>
                <td className="px-4 py-3 font-mono text-xs font-bold text-zinc-400">#{index + 1}</td>
                <td className="px-4 py-3 text-sm font-black text-zinc-900">{row.club}</td>
                <td className="px-4 py-3 text-xs font-bold text-zinc-500">{row.scouts}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-black text-blue-600">
                  {row.points.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StandingsPage() {
  const [rows, setRows] = useState<CareerStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [view, setView] = useState<'scouts' | 'hockey' | 'football'>('scouts');
  const [leagueRows, setLeagueRows] = useState<ClubChampionshipRow[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const standingsPromise = isSupabaseConfigured ? fetchCareerStandings() : Promise.resolve([]);
    standingsPromise
      .then((standings) => {
        if (active) setRows(standings);
      })
      .catch(() => {
        if (active) setRows([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    if (isSupabaseConfigured) {
      supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (!active || !user) return;
        setUserId(user.id);
        supabaseClient
          .from('profiles')
          .select('username, career_score')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (!active || !data) return;
            setMyUsername(data.username || null);
            setMyScore(data.career_score || 0);
          }, () => undefined);
        getFollowingIds(user.id).then((ids) => {
          if (active) setFollowingIds(ids);
        }).catch(() => {
          if (active) setFollowingIds([]);
        });
      }).catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (view === 'scouts') return;
    let active = true;
    const loadClubs = async () => {
      const clubs = view === 'hockey' ? HOCKEY_CLUBS : FOOTBALL_CLUBS;
      try {
        await Promise.resolve();
        if (!active) return;
        setClubsLoading(true);
        if (!isSupabaseConfigured) {
          setLeagueRows(rankLeague(clubs, []));
          return;
        }
        if (view === 'hockey') {
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('favorite_hockey_club, career_score');
          if (!active) return;
          if (error) {
            console.error('Failed to load Hockeyligan:', error);
            setLeagueRows([]);
            return;
          }
          setLeagueRows(rankLeague(HOCKEY_CLUBS, (data ?? []).map((row) => ({
            club: row.favorite_hockey_club,
            career_score: row.career_score,
          }))));
          return;
        }
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('favorite_football_club, career_score');
        if (!active) return;
        if (error) {
          console.error('Failed to load Fotbollsligan:', error);
          setLeagueRows([]);
          return;
        }
        setLeagueRows(rankLeague(FOOTBALL_CLUBS, (data ?? []).map((row) => ({
          club: row.favorite_football_club,
          career_score: row.career_score,
        }))));
      } catch (error) {
        console.error('Failed to load Klubbligan:', error);
        if (active) setLeagueRows([]);
      } finally {
        if (active) setClubsLoading(false);
      }
    };
    void loadClubs();
    return () => {
      active = false;
    };
  }, [view]);

  const handleChallenge = async (opponentUsername: string) => {
    const { data, error } = await sendDuelChallenge(opponentUsername, myScore);
    if (data?.success) {
      alert(`Utmaning skickad till @${opponentUsername.replace(/^@/, '')}! ⚔️`);
    } else {
      alert(data?.error || error?.message || 'Kunde inte skicka utmaningen');
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          {view === 'hockey' ? 'Hockeyligan' : view === 'football' ? 'Fotbollsligan' : 'Global Tabell'}
        </h1>
        <p className="mt-1 text-xs font-medium text-zinc-500">
          {view === 'hockey'
            ? 'Sammanlagda karriärpoäng för scouter som valt samma SHL-klubb.'
            : view === 'football'
              ? 'Sammanlagda karriärpoäng för scouter som valt samma Allsvenskan-klubb.'
              : 'Rankad efter karriärpoäng från varje avklarad match.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Standings view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'scouts'}
            onClick={() => setView('scouts')}
            className={`rounded-xl border-2 px-4 py-2 text-xs font-black uppercase ${
              view === 'scouts'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-700'
            }`}
          >
            🌐 GLOBALA SCOUTER
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'hockey'}
            onClick={() => {
              setClubsLoading(true);
              setView('hockey');
            }}
            className={`rounded-xl border-2 px-4 py-2 text-xs font-black uppercase ${
              view === 'hockey'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-700'
            }`}
          >
            🏒 HOCKEYLIGAN
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'football'}
            onClick={() => {
              setClubsLoading(true);
              setView('football');
            }}
            className={`rounded-xl border-2 px-4 py-2 text-xs font-black uppercase ${
              view === 'football'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-700'
            }`}
          >
            ⚽ FOTBOLLSLIGAN
          </button>
        </div>
        {view === 'scouts' ? (
          <div className="mt-8">
            <FindScouts
              currentUserId={userId}
              currentUsername={myUsername}
              followingIds={followingIds}
              onChallenge={handleChallenge}
            />
          </div>
        ) : null}
        <div className="mt-8">
          {view === 'scouts' ? (
            loading ? (
              <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400">Laddar tabellen...</p>
            ) : (
              <StandingsBoard rows={rows} currentUsername={myUsername} onChallenge={handleChallenge} />
            )
          ) : clubsLoading ? (
            <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
              {view === 'hockey' ? 'Laddar Hockeyligan...' : 'Laddar Fotbollsligan...'}
            </p>
          ) : (
            <ClubChampionshipBoard
              rows={leagueRows}
              label={view === 'hockey' ? 'Hockeyligan' : 'Fotbollsligan'}
            />
          )}
        </div>
      </div>
    </main>
  );
}
