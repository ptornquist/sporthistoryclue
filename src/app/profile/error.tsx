"use client";

import { useEffect } from "react";
import { sv } from "@/lib/i18n/sv";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-16 text-zinc-900">
      <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-black uppercase tracking-tight">{sv.profile.loadFailed}</h1>
        <p className="mt-2 text-sm text-zinc-500">{sv.profile.guestReady}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white"
        >
          {sv.profile.retry}
        </button>
      </div>
    </main>
  );
}
