'use client';

import { useState } from 'react';
import Link from 'next/link';

const MOBILE_LINKS = [
  { name: 'Daily Drop', href: '/' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'Archive', href: '/archive' },
  { name: 'Standings', href: '/standings' },
  { name: 'Shop', href: '/shop' },
] as const;

export function MobileNavDropdown({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="absolute top-full left-0 w-full bg-white border-b border-zinc-200 shadow-2xl py-5 px-6 flex flex-col gap-1 z-50 md:hidden">
      {MOBILE_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="rounded-xl px-3 py-3 text-sm font-black uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 hover:text-blue-600 transition-colors"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative w-full bg-[#fcfbf9] border-b border-zinc-200 py-4 px-3 min-[360px]:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8 min-w-0">
        <Link className="font-black text-sm min-[420px]:text-base md:text-xl tracking-tight text-zinc-950 flex items-center gap-1" href="/">
          <span>SPORTS</span><span className="text-blue-600">HISTORY</span><span>CLUE</span>
          <span className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 ml-1">BETA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-zinc-700">
          <Link className="hover:text-blue-600 transition-colors" href="/">Daily Drop</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/campaigns">Campaigns</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/archive">Archive</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/standings">Standings</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/shop">Shop</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Link className="hidden md:flex px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-zinc-900 text-xs font-black uppercase text-zinc-900 shadow-sm transition-all items-center gap-2" href="/profile">
          👤 Profile
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <Link aria-label="Profile" className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm text-base font-black" href="/profile">
            👤
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm text-lg font-black"
            aria-label="Toggle Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {mobileOpen ? <MobileNavDropdown onNavigate={() => setMobileOpen(false)} /> : null}
    </header>
  );
}
