'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import { cosmeticName } from '@/lib/cosmetics';
import { useCosmeticWallet } from '@/lib/useCosmeticWallet';
import { ScoutAvatar } from '@/components/game/ScoutAvatar';
import { HowToPlayModal, rememberTutorialSeen, requestHowToPlay } from '@/components/HowToPlayModal';
import { AVATAR_UPDATED_EVENT } from '@/lib/avatars';

export const MOBILE_NAV_LINKS = [
  { icon: '⚡', name: 'Daily Drop', href: '/' },
  { icon: '📅', name: 'Daily Drop Archive', href: '/archive' },
  { icon: '🏆', name: 'Disciplines / By Sport', href: '/disciplines' },
  { icon: '📖', name: 'Storylines & Eras', href: '/storylines' },
  { icon: '⚽', name: 'Premier League Derby', href: '/derby' },
  { icon: '📊', name: 'Standings & Ranks', href: '/standings' },
  { icon: '👤', name: 'Profile & Sign Out', href: '/profile' },
] as const;

const MOBILE_LINK_CLASS =
  'border-2 border-zinc-200 hover:border-zinc-900 rounded-xl px-4 py-3 font-bold text-zinc-900 flex items-center justify-between transition-all';

export function MobileNavDrawer({
  open,
  onNavigate,
  children,
}: {
  open: boolean;
  onNavigate: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 top-[60px] bg-white border-b-4 border-zinc-900 shadow-2xl z-50 p-5 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150 md:hidden">
      {MOBILE_NAV_LINKS.map((link) => (
        <Link key={link.href} href={link.href} onClick={onNavigate} className={MOBILE_LINK_CLASS}>
          <span>
            {link.icon} {link.name}
          </span>
        </Link>
      ))}
      {children}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { wallet } = useCosmeticWallet();
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const [localHandle, setLocalHandle] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const openHelp = () => {
    setMobileMenuOpen(false);
    if (pathname === '/') {
      requestHowToPlay();
      return;
    }
    setHelpOpen(true);
  };

  const closeHelp = () => {
    rememberTutorialSeen();
    setHelpOpen(false);
  };

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

    const onAvatar = (event: Event) => {
      const url = (event as CustomEvent<string>).detail;
      if (typeof url !== 'string' || !url) return;
      setProfile((current) => ({ ...(current ?? {}), avatar_url: url }));
    };
    window.addEventListener(AVATAR_UPDATED_EVENT, onAvatar);

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener(AVATAR_UPDATED_EVENT, onAvatar);
      listener.subscription.unsubscribe();
    };
  }, []);

  const displayName = profile?.username || localHandle || user?.email?.split('@')[0] || 'Scout';
  const equippedTitle = cosmeticName(wallet.equippedTitle);
  const pillLabel = equippedTitle ? `@${displayName} · ${equippedTitle}` : `@${displayName}`;

  const NAV_LINKS = [
    { name: 'Daily Drop', href: '/' },
    { name: 'Storylines', href: '/storylines' },
    { name: 'Standings', href: '/standings' },
    { name: 'Clubs', href: '/clubs' },
    { name: 'Derby', href: '/derby' },
    { name: 'Disciplines', href: '/disciplines' },
    { name: 'Pro Shop', href: '/shop' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white border-b border-zinc-200 px-4 py-3.5 sticky top-0 z-30 md:px-6">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-3">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="truncate text-lg font-black tracking-tighter uppercase">
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
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openHelp}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 bg-white text-zinc-700 hover:bg-zinc-100"
            title="How to Play"
            aria-label="How to Play"
          >
            ?
          </button>
          {(user || localHandle) && (
            <Link
              href="/profile"
              className="flex shrink-0 items-center gap-2 rounded-full transition-all group sm:border sm:border-zinc-200 sm:bg-zinc-100 sm:p-1.5 sm:pr-3 sm:hover:bg-zinc-200"
            >
              <ScoutAvatar
                frameId={wallet.equippedFrame}
                avatarUrl={profile?.avatar_url}
                label={displayName}
                size="sm"
              />
              <span className="hidden sm:inline max-w-[9rem] truncate text-xs font-black text-zinc-800 group-hover:text-blue-600 md:max-w-[220px]">
                {pillLabel}
              </span>
            </Link>
          )}
          {!user && (
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
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl border-2 border-zinc-900 bg-white flex items-center justify-center text-zinc-900 font-black text-lg shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-y-[1px] shrink-0"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <MobileNavDrawer open={mobileMenuOpen} onNavigate={closeMobileMenu}>
        {!user && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="text-center py-3 bg-zinc-100 rounded-xl text-xs font-bold uppercase text-zinc-800"
            >
              Log In
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={closeMobileMenu}
              className="text-center py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase"
            >
              Join
            </Link>
          </div>
        )}
      </MobileNavDrawer>
      {pathname !== '/' && <HowToPlayModal open={helpOpen} onClose={closeHelp} />}
    </header>
  );
}