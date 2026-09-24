'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Name of the archive feature the guest tried to reach, shown in the copy. */
  featureName?: string;
}

export default function AuthGateModal({
  isOpen,
  onClose,
  featureName = 'the Match Archive',
}: AuthGateModalProps) {
  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative border border-zinc-200 animate-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-zinc-400 hover:text-black text-xl font-bold w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        <span className="text-4xl block mb-2" aria-hidden>
          🔓
        </span>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold uppercase rounded-full tracking-wider mb-2 inline-block">
          Scout Access Required
        </span>

        <h3
          id="auth-gate-title"
          className="text-2xl font-black uppercase tracking-tight text-zinc-900 mt-1"
        >
          Unlock the Archive
        </h3>

        <p className="text-xs text-zinc-600 leading-relaxed mt-2 mb-5">
          The <strong>Daily Drop</strong> is always free — no sign-up needed. But{' '}
          <strong>{featureName}</strong> is part of the Scout archive. Create a free account to
          play unlimited fixtures and keep your career streak across devices.
        </p>

        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 mb-6 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
            A free Scout profile unlocks
          </span>
          <ul className="text-xs text-zinc-600 font-medium space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">✦</span> Storylines
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">✦</span> By Sport
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">✦</span> Play Another Match (unlimited archive)
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <Link
            href="/login?mode=signup"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider block transition-all shadow-sm"
          >
            Create Free Account →
          </Link>
          <Link
            href="/login"
            className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider block transition-all"
          >
            Log In
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-zinc-400 hover:text-zinc-600 text-xs font-medium transition-colors"
          >
            Maybe later · Back to today&apos;s drop
          </button>
        </div>
      </div>
    </div>
  );
}
