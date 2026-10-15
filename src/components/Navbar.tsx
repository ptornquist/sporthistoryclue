'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ensureScoutProfile } from '@/lib/ensure-profile';
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabase/client';
import { cosmeticName } from '@/lib/cosmetics';
import { useCosmeticWallet } from '@/lib/useCosmeticWallet';
import { ScoutAvatar } from '@/components/game/ScoutAvatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/use-i18n';

export default function Navbar() {
  const pathname = usePathname();
  const { messages } = useI18n();
  const { wallet } = useCosmeticWallet();
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const [localHandle, setLocalHandle] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const auth = await supabaseClient.auth.getUser();
        const user = auth.data?.user ?? null;
        setUser(user);
        if (!user) return;
        const profile = await ensureScoutProfile(user);
        setProfile({ username: profile.username, avatar_url: profile.avatar_url ?? undefined });
      } catch (error) {
        console.error(error);
      }
    };

    Promise.resolve().then(() => {
      setLocalHandle(window.localStorage.getItem('shc_handle'));
    });

    fetchUserData();

    const listener = isSupabaseConfigured
      ? supabaseClient.auth.onAuthStateChange((_event, session) => {
          const next = session?.user ?? null;
          setUser(next);
          if (!next) {
            setProfile(null);
            return;
          }
          void ensureScoutProfile(next)
            .then((profile) => {
              setProfile({ username: profile.username, avatar_url: profile.avatar_url ?? undefined });
            })
            .catch((error) => console.error(error));
        })
      : null;

    return () => {
      listener?.data.subscription.unsubscribe();
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
    { name: messages.nav.daily, href: '/' },
    { name: messages.nav.calendar, href: '/archive' },
    { name: messages.nav.campaigns, href: '/campaigns' },
    { name: messages.nav.standings, href: '/standings' },
    { name: messages.nav.clubs, href: '/clubs' },
    { name: messages.nav.derby, href: '/derby' },
    { name: messages.nav.disciplines, href: '/disciplines' },
    { name: messages.nav.shop, href: '/shop' },
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
        <nav className="hidden md:flex items-center gap-3 xl:gap-5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-blue-600' : 'text-zinc-500 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Badge / Auth Buttons */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label={messages.nav.account}
                className="group flex max-w-[160px] items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 p-1 pr-2 transition-all hover:bg-zinc-200 sm:max-w-[260px] sm:p-1.5 sm:pr-3"
              >
                <ScoutAvatar
                  frameId={wallet.equippedFrame}
                  avatarUrl={profile?.avatar_url}
                  label={displayName}
                  size="sm"
                />
                <span className="hidden min-w-0 truncate text-xs font-black text-zinc-800 group-hover:text-blue-600 sm:inline">
                  {pillLabel}
                </span>
                <span aria-hidden className="text-[10px] text-zinc-500">▾</span>
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl"
                >
                  <p className="truncate px-3 py-2 text-[11px] font-bold text-zinc-500">@{displayName}</p>
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="block rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider text-zinc-800 hover:bg-zinc-50"
                  >
                    {messages.nav.profile}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setAccountOpen(false); void handleSignOut(); }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-xs font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50"
                  >
                    {messages.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : localHandle ? (
            <Link
              href="/profile"
              className="group flex max-w-[160px] items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 p-1 pr-2 transition-all hover:bg-zinc-200 sm:max-w-[260px] sm:p-1.5 sm:pr-3"
            >
              <ScoutAvatar
                frameId={wallet.equippedFrame}
                avatarUrl={profile?.avatar_url}
                label={displayName}
                size="sm"
              />
              <span className="hidden min-w-0 truncate text-xs font-black text-zinc-800 group-hover:text-blue-600 sm:inline">
                {pillLabel}
              </span>
            </Link>
          ) : null}
          {!user && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
              >
                {messages.nav.login}
              </Link>
              <Link
                href="/login?mode=signup"
                className="whitespace-nowrap px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
              >
                {messages.nav.join}
              </Link>
            </div>
          )}

          {/* Mobilmenyknapp */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700"
            aria-label={messages.nav.openMenu}
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
                {messages.nav.login}
              </Link>
              <Link
                href="/login?mode=signup"
                onClick={() => setMenuOpen(false)}
                className="text-center py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase"
              >
                {messages.nav.join}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-2">
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-zinc-100 py-2 text-center text-xs font-bold uppercase text-zinc-800"
              >
                {messages.nav.profile}
              </Link>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); void handleSignOut(); }}
                className="rounded-lg border border-rose-200 bg-rose-50 py-2 text-center text-xs font-black uppercase text-rose-700 hover:bg-rose-100"
              >
                {messages.nav.logout}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}