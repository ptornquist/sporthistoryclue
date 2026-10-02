'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';

export const NAV_LINKS = [
  { name: '🎯 Arena', href: '/' },
  { name: '📖 Campaigns', href: '/campaigns' },
  { name: '🏅 Archive', href: '/archive' },
  { name: '🏆 Standings', href: '/standings' },
  { name: '🛍 Shop', href: '/shop' },
  { name: '👤 Profile', href: '/profile' },
];

type NavUser = { email?: string | null };

export function MobileNavDrawer({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="absolute top-full left-0 w-full bg-white border-b-2 border-zinc-200 shadow-2xl py-5 px-6 flex flex-col gap-4 z-50 md:hidden">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="font-black uppercase text-sm text-zinc-900 py-1"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
}

export default function Header() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let unsubscribe = () => {};
    const fetchUserData = async () => {
      try {
        const { data: { user: signedIn } } = await supabaseClient.auth.getUser();
        setUser(signedIn);
        if (signedIn) {
          const { data } = await supabaseClient
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', signedIn.id)
            .maybeSingle();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to load nav user:', error);
      }
    };

    fetchUserData();

    try {
      const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    } catch (error) {
      console.error('Failed to subscribe to auth:', error);
    }

    return () => unsubscribe();
  }, []);

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Scout';

  return (
    <header className="relative bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-3">
        <Link href="/" className="font-black text-lg md:text-xl tracking-tight text-zinc-950 shrink-0">
          SPORTSHISTORYCLUE
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-black uppercase">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-zinc-950 hover:text-blue-600">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-all"
            aria-label="Profile"
          >
            {user && profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
            ) : user ? (
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span className="flex h-7 w-7 items-center justify-center text-sm">👤</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileOpen ? <MobileNavDrawer onNavigate={() => setMobileOpen(false)} /> : null}
    </header>
  );
}
