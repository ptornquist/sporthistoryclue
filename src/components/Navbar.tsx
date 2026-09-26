'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import { cosmeticName } from '@/lib/cosmetics';
import { useCosmeticWallet } from '@/lib/useCosmeticWallet';
import { ScoutAvatar } from '@/components/game/ScoutAvatar';

export default function Navbar() {
  const pathname = usePathname();
  const { wallet } = useCosmeticWallet();
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const [localHandle, setLocalHandle] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabaseClient
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        setProfile(data);
      }
    };

    Promise.resolve().then(() => {
      setLocalHandle(window.localStorage.getItem('shc_handle'));
    });

    fetchUserData();

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  const displayName = profile?.username || localHandle || user?.email?.split('@')[0] || 'Scout';
  const equippedTitle = cosmeticName(wallet.equippedTitle);
  const pillLabel = equippedTitle ? `@${displayName} · ${equippedTitle}` : `@${displayName}`;

  const NAV_LINKS = [
    { name: 'Daily Drop', href: '/' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Disciplines', href: '/disciplines' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Pro Shop', href: '/shop' },
  ];

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lg font-black tracking-tighter uppercase">
            Sports<span className="text-blue-600">History</span>Clue
          </Link>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
            Beta
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-blue-600' : 'text-zinc-500 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Badge / Auth Buttons */}
        <div className="flex items-center gap-3">
          {(user || localHandle) && (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-all group"
            >
              <ScoutAvatar
                frameId={wallet.equippedFrame}
                avatarUrl={profile?.avatar_url}
                label={displayName}
                size="sm"
              />
              <span className="text-xs font-black text-zinc-800 max-w-[220px] truncate group-hover:text-blue-600">
                {pillLabel}
              </span>
            </Link>
          )}
          {!user && (
            <div className="hidden sm:flex items-center gap-2">
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
          )}

          {/* Mobilmenyknapp */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Dropdown för mobil */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-100 mt-3 pt-3 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-xs font-black uppercase text-zinc-700 hover:bg-zinc-50 rounded-lg"
            >
              {link.name}
            </Link>
          ))}
          {!user ? (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center py-2 bg-zinc-100 rounded-lg text-xs font-bold uppercase text-zinc-800"
              >
                Log In
              </Link>
              <Link
                href="/login?mode=signup"
                onClick={() => setMenuOpen(false)}
                className="text-center py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase"
              >
                Join
              </Link>
            </div>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); handleSignOut(); }}
              className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              Log Out
            </button>
          )}
        </div>
      )}
    </header>
  );
}