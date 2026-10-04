'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthModal } from '@/components/auth/AuthModal';
import { BetaFeedbackModal } from '@/components/feedback/BetaFeedbackModal';
import { useCareerStats } from './CareerStatsProvider';
import { HowToPlayModal } from './HowToPlayModal';

const NAV_LINKS = [
  { name: '🎯 Dagens Kluring', href: '/' },
  { name: '📖 Utmaningar', href: '/campaigns' },
  { name: '🏅 Historik', href: '/archive' },
  { name: '🏆 Tabell', href: '/standings' },
  { name: '🛍️ Shop', href: '/shop' },
] as const;

export function MobileNavDropdown({
  onNavigate,
  onJoin,
  onFeedback,
}: {
  onNavigate: () => void;
  onJoin?: () => void;
  onFeedback?: () => void;
}) {
  const { userId } = useCareerStats();
  return (
    <div className="absolute top-full left-0 w-full bg-white border-b border-zinc-200 shadow-2xl py-5 px-6 flex flex-col gap-1 z-50 md:hidden">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="rounded-xl px-3 py-3 text-sm font-black uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 hover:text-blue-600 transition-colors"
        >
          {link.name}
        </Link>
      ))}
      {userId ? null : (
        <button
          type="button"
          onClick={() => {
            onJoin?.();
            onNavigate();
          }}
          className="rounded-xl px-3 py-3 text-left text-sm font-black uppercase tracking-wider text-blue-600 hover:bg-zinc-50"
        >
          Gå med
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          onFeedback?.();
          onNavigate();
        }}
        className="rounded-xl px-3 py-3 text-left text-sm font-black uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 hover:text-blue-600"
      >
        Lämna beta-feedback
      </button>
    </div>
  );
}

function formatCareerStat(value: number | null): string {
  return value == null ? '—' : value.toLocaleString('en-US');
}

export function CareerStatChip() {
  const { careerScore, fixturesCleared } = useCareerStats();
  const points = formatCareerStat(careerScore);
  const matches = formatCareerStat(fixturesCleared);
  return (
    <Link
      href="/profile"
      className="flex items-center gap-1.5 rounded-full border-2 border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-mono font-bold leading-none"
      aria-label={`Karriärpoäng ${points}, avklarade matcher ${matches}`}
    >
      <span className="text-blue-600">{points}</span>
      <span className="text-zinc-300" aria-hidden="true">·</span>
      <span className="text-zinc-700">{matches}</span>
    </Link>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { userId } = useCareerStats();

  return (
    <>
    <header className="relative w-full bg-[#fcfbf9] border-b border-zinc-200 py-4 px-3 min-[360px]:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8 min-w-0">
        <Link className="font-black text-sm min-[420px]:text-base md:text-xl tracking-tight text-zinc-950 flex items-center gap-1" href="/">
          <span>SPORTS</span><span className="text-blue-600">HISTORY</span><span>CLUE</span>
          <span className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 ml-1">BETA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-zinc-700">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} className="hover:text-blue-600 transition-colors" href={link.href}>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <CareerStatChip />
        <button
          type="button"
          onClick={() => setHowToOpen(true)}
          className="hidden md:flex px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-zinc-900 text-xs font-black uppercase text-zinc-900 shadow-sm transition-all items-center gap-2"
        >
          Hur spelar man
        </button>
        {userId ? null : (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="hidden md:flex px-3.5 py-1.5 rounded-full bg-blue-600 border-2 border-blue-600 hover:bg-blue-700 text-xs font-black uppercase text-white shadow-sm transition-all items-center gap-2"
          >
            Gå med
          </button>
        )}
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="hidden lg:flex px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-zinc-900 text-xs font-black uppercase text-zinc-900 shadow-sm transition-all items-center gap-2"
        >
          Lämna beta-feedback
        </button>
        <Link className="hidden md:flex px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-zinc-900 text-xs font-black uppercase text-zinc-900 shadow-sm transition-all items-center gap-2" href="/profile">
          👤 Profil
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setHowToOpen(true)}
            aria-label="Hur spelar man"
            className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm text-base font-black"
          >
            ?
          </button>
          <Link aria-label="Profil" className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm text-base font-black" href="/profile">
            👤
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm text-lg font-black"
            aria-label="Öppna meny"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <MobileNavDropdown
          onNavigate={() => setMobileOpen(false)}
          onJoin={() => setAuthOpen(true)}
          onFeedback={() => setFeedbackOpen(true)}
        />
      ) : null}
    </header>
    <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    <BetaFeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
