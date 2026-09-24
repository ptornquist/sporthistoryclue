'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
          },
        });

        if (error) throw error;

        if (data.user) {
          if (username) {
            await supabaseClient.from('profiles').upsert({
              id: data.user.id,
              username: username.trim(),
            });
            localStorage.setItem('shc_handle', username.trim());
          }
          setSuccessMsg('Account created! Logging you in...');
          setTimeout(() => router.push('/'), 1200);
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <div className="text-center mb-6">
        <Link href="/" className="text-lg font-black uppercase tracking-tighter">
          Sports<span className="text-blue-600">History</span>Clue
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 mt-3">
          {mode === 'login' ? 'Scout Login' : 'Join the League'}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          {mode === 'login'
            ? 'Access your match history and track daily solve streaks.'
            : 'Compete on daily leaderboards and challenge friends.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => { setMode('login'); setErrorMsg(''); }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            mode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-black'
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setErrorMsg(''); }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            mode === 'signup' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-black'
          }`}
        >
          Join Free
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-zinc-500 mb-1">
              Scout Handle / Name
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. PeterT, PuckScout"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] font-mono uppercase font-bold text-zinc-500 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="scout@sportshistoryclue.com"
            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase font-bold text-zinc-500 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In →' : 'Create Free Account →'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
        <Link href="/" className="text-xs text-zinc-400 hover:text-black font-medium">
          ← Back to Daily Match
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
      <Suspense fallback={<div className="text-xs font-mono text-zinc-400">Loading...</div>}>
        <AuthContent />
      </Suspense>
    </main>
  );
}