'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';

interface ScoutHit {
  id: string;
  username: string | null;
  avatar_url?: string | null;
  streak?: number | null;
}

interface FindScoutsProps {
  currentUserId: string | null;
  onConnected?: () => void;
}

export default function FindScouts({ currentUserId, onConnected }: FindScoutsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScoutHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const needle = query.trim().replace(/^@/, '');
    if (!needle) return;

    if (!currentUserId) {
      setMessage('Log in to search registered scouts.');
      setResults([]);
      return;
    }

    setSearching(true);
    setMessage(null);

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id, username, avatar_url, streak')
      .ilike('username', `%${needle}%`)
      .neq('id', currentUserId)
      .limit(6);

    if (error) {
      setMessage('Could not search scouts. Try again in a moment.');
      setResults([]);
    } else if (!data || data.length === 0) {
      setMessage('No scouts match that handle.');
      setResults([]);
    } else {
      setResults(data);
    }

    setSearching(false);
  };

  const handleConnect = async (targetId: string) => {
    if (!currentUserId) return;
    setConnectingId(targetId);
    setMessage(null);

    const { error } = await supabaseClient.from('scout_connections').insert({
      user_id: currentUserId,
      connected_user_id: targetId,
    });

    if (error) {
      setMessage(error.code === '23505' ? 'You are already connected.' : error.message);
    } else {
      setMessage('Scout connected.');
      setResults((prev) => prev.filter((scout) => scout.id !== targetId));
      onConnected?.();
    }

    setConnectingId(null);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find Scouts by @username"
          aria-label="Find Scouts"
          className="min-w-0 flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-600"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 disabled:opacity-60"
        >
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {!currentUserId && (
        <p className="text-[11px] text-zinc-500 font-medium mt-2">
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Log in
          </Link>{' '}
          to search and connect with scouts.
        </p>
      )}

      {message && (
        <p className="text-[11px] font-bold text-zinc-600 mt-3">{message}</p>
      )}

      {results.length > 0 && (
        <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
            Scouts found
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {results.map((scout) => {
              const handle = scout.username || 'scout';
              return (
                <div
                  key={scout.id}
                  className="bg-white p-3 rounded-xl border border-zinc-200 flex justify-between items-center gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {scout.avatar_url ? (
                      <img
                        src={scout.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {handle.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="font-bold text-xs text-zinc-900 truncate">@{handle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConnect(scout.id)}
                    disabled={connectingId === scout.id}
                    className="shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 disabled:opacity-60"
                  >
                    {connectingId === scout.id ? '...' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
