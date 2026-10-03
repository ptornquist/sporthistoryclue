'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { fetchCareerStandings } from '@/lib/career-standings';
import { resolveUnlockedBadges, type UnlockedAccolade } from '@/lib/scout-badges';
import { BadgeHandleFlair, ScoutAccolades } from '@/components/game/ScoutAccolades';
import { HeadToHeadDuels } from '@/components/game/HeadToHeadDuels';
import { loadMyDuels, sendDuelChallenge, type DuelRow } from '@/lib/duels';
import FindScouts from '@/components/game/FindScouts';
import Header from '@/components/Header';
import { ScoutHandleLink } from '@/components/game/ScoutHandleLink';
import { type ScoutProfile } from '@/lib/supabase/network';
import { FOOTBALL_CLUBS, HOCKEY_CLUBS, isFootballClub, isHockeyClub } from '@/lib/swedish-clubs';
import { CAREER_UPDATED_EVENT, mergeCareerTotals, readCareerLedger } from '@/lib/career-ledger';
import { loadCareerStats } from '@/lib/career-score';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  favorite_hockey_club?: string | null;
  favorite_football_club?: string | null;
  streak?: number | null;
  total_score?: number | null;
}

interface MatchRecord {
  id: string;
  score: number;
  clues_used: number;
  created_at: string;
  challenges: {
    subject: string;
    year: number;
    category: string;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [careerScore, setCareerScore] = useState<number | null>(null);
  const [fixturesCleared, setFixturesCleared] = useState<number | null>(null);
  const [badges, setBadges] = useState<UnlockedAccolade[]>([]);
  const [duels, setDuels] = useState<DuelRow[]>([]);

  const [network, setNetwork] = useState<ScoutProfile[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const loadData = async () => {
    const localCareer = readCareerLedger(localStorage);
    setCareerScore(localCareer.careerScore);
    setFixturesCleared(localCareer.fixturesCleared);
    if (!isSupabaseConfigured) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setUser(user);

    const standings = await fetchCareerStandings();
    const prof = standings.find((row) => row.id === user.id);
    const { data: avatarRow } = await supabaseClient
      .from('profiles')
      .select('avatar_url, favorite_hockey_club, favorite_football_club')
      .eq('id', user.id)
      .maybeSingle();
    const remoteCareer = await loadCareerStats(user.id);
    const totals = mergeCareerTotals(remoteCareer, localCareer);
    setCareerScore(totals.careerScore);
    setFixturesCleared(totals.fixturesCleared);

    if (prof) {
      setProfile({
        id: prof.id,
        username: prof.username || '',
        display_name: prof.display_name || prof.username || '',
        avatar_url: avatarRow?.avatar_url ?? prof.avatar_url ?? null,
        favorite_hockey_club: avatarRow?.favorite_hockey_club ?? null,
        favorite_football_club: avatarRow?.favorite_football_club ?? null,
        streak: prof.streak,
      });
    }

    const { data: matchHistory } = await supabaseClient
      .from('match_history')
      .select('id, score, clues_used, created_at, challenges(subject, year, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (matchHistory) {
      setMatches(matchHistory as any);
    }

    const supabase = supabaseClient;
    const { data: badgeData } = await supabase
      .from('user_badges')
      .select('badge_id, unlocked_at')
      .eq('user_id', user.id);
    setBadges(resolveUnlockedBadges(badgeData));

    const handle = (prof?.username || '').replace(/^@/, '');
    if (handle) setDuels(await loadMyDuels(handle));

    await loadNetwork(user.id);
  };

  const loadNetwork = async (followerId?: string) => {
    const id = followerId || user?.id;
    if (!id) return;
    const supabase = supabaseClient;
    const { data: networkData, error } = await supabase
      .from('scout_follows')
      .select('following_id, profiles:following_id(id, username, career_score, fixtures_cleared)')
      .eq('follower_id', id);
    if (error) {
      console.error('Failed to load network:', error);
      return;
    }

    const scouts: ScoutProfile[] = [];
    for (const row of (networkData ?? []) as Array<{
      following_id: string;
      profiles:
        | ScoutProfile
        | ScoutProfile[]
        | null;
    }>) {
      const embedded = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      if (!embedded?.id) continue;
      scouts.push({
        id: embedded.id,
        username: embedded.username,
        career_score: embedded.career_score,
        fixtures_cleared: embedded.fixtures_cleared,
      });
    }
    setNetwork(scouts);
    setFollowingIds(scouts.map((scout) => scout.id));
  };

  useEffect(() => {
    const refresh = () => {
      void loadData();
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener(CAREER_UPDATED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CAREER_UPDATED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    if (!fileExt) {
      alert('Error uploading avatar: choose an image file.');
      return;
    }
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    const supabase = supabaseClient;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Error uploading avatar: ' + uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!updateError) {
      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
    } else {
      alert('Error uploading avatar: ' + updateError.message);
    }
  };

  const handleClubChange = async (
    sport: 'hockey' | 'football',
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (!user) return;
    const nextClub = event.target.value;
    const club = nextClub === '' ? null : nextClub;
    if (sport === 'hockey' && club && !isHockeyClub(club)) return;
    if (sport === 'football' && club && !isFootballClub(club)) return;

    const patch = sport === 'hockey'
      ? { favorite_hockey_club: club, updated_at: new Date().toISOString() }
      : { favorite_football_club: club, updated_at: new Date().toISOString() };

    const { error } = await supabaseClient
      .from('profiles')
      .update(patch)
      .eq('id', user.id);

    if (error) {
      alert(error.message || 'Kunde inte spara klubben');
      return;
    }
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleChallenge = async (opponentUsername: string) => {
    const { data, error } = await sendDuelChallenge(opponentUsername, careerScore || 0);
    if (data?.success) {
      alert(`Utmaning skickad till @${opponentUsername.replace(/^@/, '')}! ⚔️`);
      const handle = (profile?.username || '').replace(/^@/, '');
      if (handle) setDuels(await loadMyDuels(handle));
    } else {
      alert(data?.error || error?.message || 'Kunde inte skicka utmaningen');
    }
  };

  const handleToggleFollow = async (targetId: string, isCurrentlyFollowing: boolean) => {
    if (!user) return;
    const supabase = supabaseClient;
    if (isCurrentlyFollowing) {
      const { error } = await supabase
        .from('scout_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetId);
      if (error) {
        alert(error.message || 'Kunde inte uppdatera nätverket');
        return;
      }
    } else {
      const { error } = await supabase
        .from('scout_follows')
        .insert({ follower_id: user.id, following_id: targetId });
      if (error && error.code !== '23505') {
        alert(error.message || 'Kunde inte uppdatera nätverket');
        return;
      }
    }
    await loadNetwork();
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Profile Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-zinc-200 bg-zinc-100 flex items-center justify-center shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profilbild" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-black uppercase cursor-pointer">
                <span>Byt</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                Scoutnamn
              </span>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-2xl md:text-3xl font-black tracking-tight text-zinc-950">
                  @{profile?.username?.replace(/^@/, '')}
                </span>
                <span className="text-xs bg-zinc-100 text-zinc-600 font-bold px-2.5 py-1 rounded-lg border border-zinc-200">
                  LÅST NAMN
                </span>
                <BadgeHandleFlair badges={badges} />
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-1">{user?.email}</p>
              <div className="mt-3 flex max-w-xl flex-col gap-3 sm:flex-row">
                <label className="block min-w-0 flex-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">Ishockeyklubb (SHL)</span>
                  <select
                    aria-label="Ishockeyklubb (SHL)"
                    value={profile?.favorite_hockey_club ?? ''}
                    onChange={(event) => handleClubChange('hockey', event)}
                    className="mt-1 w-full rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-900"
                  >
                    <option value="">Välj klubb</option>
                    {HOCKEY_CLUBS.map((club) => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                </label>
                <label className="block min-w-0 flex-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">Fotbollsklubb (Allsvenskan)</span>
                  <select
                    aria-label="Fotbollsklubb (Allsvenskan)"
                    value={profile?.favorite_football_club ?? ''}
                    onChange={(event) => handleClubChange('football', event)}
                    className="mt-1 w-full rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-900"
                  >
                    <option value="">Välj klubb</option>
                    {FOOTBALL_CLUBS.map((club) => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await supabaseClient.auth.signOut();
                  window.location.href = '/login';
                }}
                className="mt-2 text-xs font-medium text-zinc-400 hover:text-zinc-600"
              >
                Logga ut
              </button>
            </div>
          </div>

          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-zinc-100 pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
            <div>
              <span className="block text-[11px] font-mono font-bold text-zinc-400 uppercase">Karriärpoäng</span>
              <span className="text-3xl font-black font-mono text-blue-600">
                {careerScore == null ? '—' : careerScore.toLocaleString()}
              </span>
              <div className="mt-3">
                <Link
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  href="/shop"
                >
                  🛍️ Handla i Shopen
                </Link>
              </div>
            </div>
            <div>
              <span className="block text-[11px] font-mono font-bold text-zinc-400 uppercase">Avklarade matcher</span>
              <span className="text-3xl font-black font-mono text-zinc-900">
                {fixturesCleared == null ? '—' : fixturesCleared.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <ScoutAccolades badges={badges} />

        <HeadToHeadDuels duels={duels} myUsername={profile?.username || ''} />

        <FindScouts
          currentUserId={user?.id ?? null}
          currentUsername={profile?.username}
          followingIds={followingIds}
          onToggleFollow={handleToggleFollow}
          onChallenge={handleChallenge}
        />

        <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">Mitt Nätverk</h2>
          {network.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs font-medium">
              Du har inte följt några scouter ännu.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {network.map((scout) => (
                <div key={scout.id} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <ScoutHandleLink
                      username={scout.username}
                      className="font-black text-xs text-zinc-900 block truncate hover:underline"
                    />
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                      {(scout.career_score || 0).toLocaleString()} poäng
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFollow(scout.id, true)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-white text-zinc-700 border-zinc-200"
                  >
                    SLUTA FÖLJA
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Match History */}
        <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-6">
            Spaningslogg
          </h2>

          {matches.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs font-medium">
              Inga avklarade matcher ännu. Gå till arenan och deducera.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {matches.map((m) => (
                <div key={m.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-black text-zinc-900 block">
                      {m.challenges?.subject} ({m.challenges?.year})
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400 uppercase">
                      {m.challenges?.category?.replace('_', ' ')} · Avklarad på ledtråd {m.clues_used}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-blue-600">
                      +{m.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}