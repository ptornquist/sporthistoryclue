'use client';

import React, { useState } from 'react';
import { ScoutHandleLink } from '@/components/game/ScoutHandleLink';
import { followScout, searchScouts, unfollowScout, type ScoutProfile } from '@/lib/supabase/network';

interface FindScoutsProps {
  currentUserId?: string | null;
  currentUsername?: string | null;
  followingIds?: string[];
  onToggleFollow?: (targetId: string) => Promise<void> | void;
  onChallenge?: (username: string) => void;
  framed?: boolean;
}

export function ScoutSearchResults({
  searching,
  query,
  results,
  followingIds,
  currentUsername,
  onToggleFollow,
  onChallenge,
}: {
  searching: boolean;
  query: string;
  results: ScoutProfile[] | null;
  followingIds: string[];
  currentUsername?: string | null;
  onToggleFollow: (scoutId: string) => void;
  onChallenge?: (username: string) => void;
}) {
  return (
    <>
      {searching && (
        <p className="text-xs font-bold text-zinc-400 py-2">Searching scouts...</p>
      )}
      {results && (
        <div className="flex flex-col gap-2 pt-2">
          {results.length === 0 ? (
            <p className="text-xs font-bold text-zinc-400 py-2">
              No scout found matching &apos;@{query}&apos;
            </p>
          ) : (
            results.map((scout) => {
              const handle = scout.username?.replace(/^@/, '') || 'scout';
              const following = followingIds.includes(scout.id);
              const mine = handle.toLowerCase() === (currentUsername || '').replace(/^@/, '').trim().toLowerCase();
              return (
                <div
                  key={scout.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50"
                >
                  <div>
                    <ScoutHandleLink
                      username={scout.username}
                      className="font-black text-sm text-zinc-900 hover:underline"
                    />
                    <span className="ml-2 text-xs font-semibold text-zinc-500">
                      {(scout.career_score || 0).toLocaleString()} PTS · {scout.fixtures_cleared || 0} matches
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!mine && onChallenge && (
                      <button
                        type="button"
                        onClick={() => onChallenge(handle)}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                      >
                        ⚔️ Challenge
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleFollow(scout.id)}
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-black uppercase"
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
}

export default function FindScouts({
  currentUserId = null,
  currentUsername = null,
  followingIds = [],
  onToggleFollow,
  onChallenge,
  framed = true,
}: FindScoutsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScoutProfile[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});

  const followed = [
    ...followingIds.filter((id) => followOverrides[id] !== false),
    ...Object.entries(followOverrides).filter(([, on]) => on).map(([id]) => id),
  ];

  const handleSearchScouts = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanTerm = searchQuery.trim().replace(/^@/, '');
    if (!cleanTerm) return;

    setSubmittedQuery(cleanTerm);
    setSearching(true);
    try {
      setSearchResults(await searchScouts(cleanTerm, currentUserId || undefined));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleToggleFollow = async (scoutId: string) => {
    if (onToggleFollow) {
      await onToggleFollow(scoutId);
      return;
    }
    if (!currentUserId) return;
    const already = followed.includes(scoutId);
    if (already) {
      await unfollowScout(currentUserId, scoutId);
    } else {
      await followScout(currentUserId, scoutId);
    }
    setFollowOverrides((prev) => ({ ...prev, [scoutId]: !already }));
  };

  const form = (
    <>
      {framed && (
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">
            Find Scouts
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Search registered scouts by username.
          </p>
        </div>
      )}

      <form onSubmit={handleSearchScouts} className="flex gap-2">
        <input
          type="text"
          placeholder="Find Scouts by @username"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Find Scouts"
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-zinc-200 focus:border-zinc-900 outline-none font-bold text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
        >
          Search
        </button>
      </form>

      <ScoutSearchResults
        searching={searching}
        query={submittedQuery}
        results={searchResults}
        followingIds={followed}
        currentUsername={currentUsername}
        onToggleFollow={handleToggleFollow}
        onChallenge={onChallenge}
      />
    </>
  );

  if (!framed) return <div className="flex flex-col gap-4">{form}</div>;

  return (
    <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      {form}
    </div>
  );
}
