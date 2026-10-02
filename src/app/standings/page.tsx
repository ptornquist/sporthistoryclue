'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCareerStandings, type CareerStanding } from '@/lib/career-standings';

export default function StandingsPage() {
  const [rows, setRows] = useState<CareerStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCareerStandings()
      .then((standings) => {
        if (active) setRows(standings);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-10 text-zinc-900">
      <div className="mx-auto mb-8 flex max-w-lg items-center justify-between">
        <Link href="/" className="text-xs font-black uppercase tracking-wider text-zinc-500">
          ← Daily Drop
        </Link>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Standings</span>
      </div>
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black uppercase tracking-tight">Career Standings</h1>
        <p className="mt-1 text-sm text-zinc-500">Scores refresh from the latest profile rows.</p>
        {loading ? (
          <p className="mt-8 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">Loading standings…</p>
        ) : rows.length === 0 ? (
          <p className="mt-8 text-center text-xs font-medium text-zinc-400">No career scores yet.</p>
        ) : (
          <ol className="mt-6 divide-y divide-zinc-100">
            {rows.map((row, index) => (
              <li key={row.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-black text-zinc-900">
                    {index + 1}. @{row.username || 'scout'}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                    {row.fixtures_cleared || 0} fixtures cleared
                  </p>
                </div>
                <p className="font-mono text-sm font-black text-blue-600">
                  {(row.career_score || 0).toLocaleString()} PTS
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
