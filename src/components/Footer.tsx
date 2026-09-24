'use client';

import React from 'react';

const SOCIAL_LINKS = [
  {
    name: 'X (Twitter)',
    href: 'https://x.com/SportsHistoryC',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/sportshistoryclue/',
    icon: (
      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/sportshistoryclue/',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.62 1.62 0 1 0 1.62 1.62A1.62 1.62 0 0 0 7.83 6.2z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61581105073359',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="py-8 border-t border-zinc-200/80 bg-white/70 backdrop-blur-sm mt-12">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Release Info */}
        <div className="text-center sm:text-left">
          <p className="text-xs font-black uppercase tracking-tight text-zinc-900">
            Sports<span className="text-blue-600">History</span>Clue
          </p>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            New mystery fixture drops daily at 00:00 UTC
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-2.5">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-blue-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              {item.icon}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}
