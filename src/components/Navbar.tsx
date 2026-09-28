'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import { cosmeticName } from '@/lib/cosmetics';
import { useCosmeticWallet } from '@/lib/useCosmeticWallet';
import { ScoutAvatar } from '@/components/game/ScoutAvatar';
import { HowToPlayModal, rememberTutorialSeen, requestHowToPlay } from '@/components/HowToPlayModal';
import { StatsModal } from '@/components/game/StatsModal';
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

const DRAWER_BACKDROP = 'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity';

const DRAWER_PANEL =
  'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white border-l-[3px] border-zinc-950 p-6 z-50 shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-y-auto';

const DRAWER_LINKS = [
  { icon: '📅', name: 'Daily Drop Archive', href: '/archive' },
  { icon: '🏆', name: 'Premier League Derby', href: '/derby' },
  { icon: '📜', name: 'Storylines & Eras', href: '/storylines' },
] as const;

export function MobileNavDrawer({
  open,
  onNavigate,
  onOpenDossier,
  onOpenHelp,
  children,
}: {
  open: boolean;
  onNavigate: () => void;
  onOpenDossier?: () => void;
  onOpenHelp?: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;
  const covered = new Set<string>(DRAWER_LINKS.map((link) => link.href));
  return (
    <>
      <button type="button" className={DRAWER_BACKDROP} aria-label="Close menu" onClick={onNavigate} />
      <div className={DRAWER_PANEL}>
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-black uppercase tracking-wider text-zinc-950">Menu</p>
            <button
              type="button"
              onClick={onNavigate}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-zinc-950 bg-white text-lg font-black"
              aria-label="Close menu"
            >
              X
            </button>
          </div>
          {DRAWER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={onNavigate} className={MOBILE_LINK_CLASS}>
              <span>
                {link.icon} {link.name}
              </span>
            </Link>
          ))}
          {MOBILE_NAV_LINKS.filter((link) => !covered.has(link.href)).map((link) => (
            <Link key={link.href} href={link.href} onClick={onNavigate} className={MOBILE_LINK_CLASS}>
              <span>
                {link.icon} {link.name}
              </span>
            </Link>
          ))}
          {onOpenDossier && (
            <button type="button" onClick={onOpenDossier} className={MOBILE_LINK_CLASS}>
              <span>📊 Scout Dossier / Stats</span>
            </button>
          )}
          {onOpenHelp && (
            <button type="button" onClick={onOpenHelp} className={MOBILE_LINK_CLASS}>
              <span>❓ How to Play / Rules</span>
            </button>
          )}
        </div>
        {children}
      </div>
    </>
  );
}

export default function Navbar({
  arcade,
}: {
  arcade?: { sport: string; score: string; streak: number };
} = {}) {
  const pathname = usePathname();
  const { wallet } = useCosmeticWallet();
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const [localHandle, setLocalHandle] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);

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
    <header className={arcade ? "shrink-0" : "bg-white border-b border-zinc-200 px-4 py-3.5 sticky top-0 z-30 md:px-6"}>
      {arcade ? (
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] items-center gap-1.5">
          <Link href="/" className="truncate text-[10px] font-black leading-none tracking-tighter text-zinc-950 sm:text-xs">
            SPORTSHISTORYCLUE
          </Link>
          <div className="flex min-w-0 flex-col items-center text-center">
            <span className="max-w-full truncate rounded-full border-2 border-zinc-950 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-zinc-950">
              {arcade.sport}
            </span>
            <span className="mt-0.5 text-[11px] font-black text-zinc-950">{arcade.score}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="whitespace-nowrap text-xs font-black text-zinc-950" title="Streak">
              🔥 {arcade.streak}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-900 bg-white text-lg font-black text-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-y-[1px]"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      ) : (
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
            onClick={() => setDossierOpen(true)}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 bg-white text-zinc-700 hover:bg-zinc-100"
            title="Scout Dossier"
            aria-label="Scout Dossier"
          >
            🏆
          </button>
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
      )}

      <MobileNavDrawer
        open={mobileMenuOpen}
        onNavigate={closeMobileMenu}
        onOpenDossier={() => {
          closeMobileMenu();
          setDossierOpen(true);
        }}
        onOpenHelp={() => {
          closeMobileMenu();
          openHelp();
        }}
      >
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
      <StatsModal open={dossierOpen} onClose={() => setDossierOpen(false)} />
    </header>
  );
}