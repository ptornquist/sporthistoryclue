'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';

export const NAV_LINKS = [
  { name: 'Daily Drop', href: '/' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'Disciplines', href: '/disciplines' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: '🛍️ SHOP', href: '/shop' },
];

const MOBILE_LINKS = [
  { name: '🎯 Daily Drop', href: '/' },
  { name: '📖 Campaigns', href: '/campaigns' },
  { name: '🏅 Disciplines', href: '/disciplines' },
  { name: '🏆 Leaderboard', href: '/standings' },
  { name: '🛍️ Shop', href: '/shop' },
];

type NavUser = { email?: string | null };

export function MobileNavDrawer({
  onNavigate,
  onLogout,
}: {
  onNavigate: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="bg-white border-b-2 border-zinc-200 shadow-xl py-4 px-6 flex flex-col gap-4 absolute top-full left-0 w-full z-50 animate-in slide-in-from-top-2">
      {MOBILE_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="text-sm font-black text-zinc-900"
        >
          {link.name}
        </Link>
      ))}
      <Link href="/profile" onClick={onNavigate} className="text-sm font-black text-zinc-900">
        👤 Profile
      </Link>
      <button type="button" onClick={onLogout} className="text-left text-sm font-black text-zinc-900">
        🚪 Log Out
      </button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<NavUser | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    if (!isSupabaseConfigured) return;
    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Scout';

  return (
    <header className="relative bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="shrink-0 text-lg md:text-xl font-black tracking-tighter uppercase">
            Sports<span className="text-blue-600">History</span>Clue
          </Link>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
            Beta
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === '/shop'
                    ? 'font-bold text-sm tracking-wide uppercase hover:text-blue-600 transition-colors'
                    : `text-xs font-bold uppercase tracking-wider transition-colors ${
                        isActive ? 'text-blue-600' : 'text-zinc-500 hover:text-black'
                      }`
                }
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-all group"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-white"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden md:inline max-w-24 truncate text-xs font-black text-zinc-800 group-hover:text-blue-600">
                {displayName}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/profile"
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-sm"
                aria-label="Profile"
              >
                👤
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                >
                  Join
                </Link>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <MobileNavDrawer
          onNavigate={() => setMobileMenuOpen(false)}
          onLogout={() => {
            void handleSignOut();
          }}
        />
      ) : null}
    </header>
  );
}
