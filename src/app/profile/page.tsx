'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import Footer from '@/components/Footer';

interface MatchHistory {
  match_identifier: string;
  title: string;
  category: string;
  points: number;
  score_date: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [playerName, setPlayerName] = useState('Scout');
  const [streak, setStreak] = useState(1);
  const [careerStats, setCareerStats] = useState({ total_wins: 14, total_pts: 142000, accuracy: 98 });
  const [history, setHistory] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        // hard-gated for Strategy 2
        router.push('/login');
        return;
      }
      setCurrentUser(data.user);
      if (data.user.email) setPlayerName(data.user.email.split('@')[0]);
      
      const savedStreak = parseInt(localStorage.getItem('shc_streak') || '1', 10);
      setStreak(savedStreak);

      // Simulation: Fetching career stats and history from match_history
      setHistory([
        { match_identifier: 'miracle-on-ice-1980', title: 'USA vs Soviet Union (Winter Olympics)', category: 'Ice Hockey', points: 10000, score_date: 'Today 14:12 UTC' },
        { match_identifier: 'lillehammer-1994', title: 'Sweden vs Canada (Shootout Final)', category: 'Ice Hockey', points: 8000, score_date: 'Yesterday' },
        { match_identifier: 'bolt-beijing-2008', title: 'Usain Bolt 100m World Record', category: 'Athletics', points: 10000, score_date: 'Sep 19' },
      ]);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-400">
        Loading Scout Profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <header className="bg-white border-b border-zinc-200 px-6 py-3.5 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-lg font-black tracking-tighter uppercase">
                Sports<span className="text-blue-600">History</span>Clue
              </Link>
              <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
                Scout Profile
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
                Daily Drop
              </Link>
              <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
                Leaderboard
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Profile Header */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                {playerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="px-3 py-1 bg-zinc-100 text-zinc-600 font-mono text-[10px] font-bold uppercase rounded-full tracking-wider mb-2 inline-block">
                  Verified Scout
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
                  {playerName}
                </h1>
                <p className="text-xs text-zinc-400 font-medium">Joined {new Date(currentUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-sm font-bold text-amber-700 font-mono">
              🔥 Streak: {streak} Days
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Total Wins</span>
              <span className="text-3xl font-black text-blue-600">{careerStats.total_wins}</span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Career Points</span>
              <span className="text-3xl font-black text-zinc-900">{careerStats.total_pts.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Deduction %</span>
              <span className="text-3xl font-black text-emerald-600">{careerStats.accuracy}%</span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Badges</span>
              <span className="text-3xl font-black text-zinc-900">2</span>
            </div>
          </div>

          {/* History */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Recent Deduction History</h2>
            </div>
            
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60">
                  <div>
                    <h3 className="text-sm font-black text-zinc-900">{h.title}</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{h.category} · {h.score_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-zinc-400">+{h.points.toLocaleString()} PTS</span>
                    <Link
                      href={`/?match=${h.match_identifier}`}
                      className="px-3 py-1.5 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all hover:bg-white"
                    >
                      Dossier
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}