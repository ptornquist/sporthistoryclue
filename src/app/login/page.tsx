'use client';

import React, { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        alert(`Login failed: ${error.message}`);
      } else if (data?.user) {
        window.location.href = '/';
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err?.message || 'Check console and environment variables'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        alert(`Registration failed: ${error.message}`);
      } else {
        alert('Account created! If email confirmation is disabled, you can now sign in.');
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err?.message || 'Check console'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-6 text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <Link href="/" className="absolute top-6 left-6 font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
        SHC<span className="text-blue-600">.</span>
      </Link>
      
      <div className="w-full max-w-md bg-zinc-50 border border-zinc-200 rounded-3xl p-8 md:p-10 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight mb-2 text-center uppercase">Welcome Back</h1>
        <p className="text-zinc-500 text-xs text-center mb-8 font-medium">
          Log in to track your scores, streaks, and trophy archive.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-zinc-400"
              placeholder="player@example.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-zinc-400"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex gap-3 pt-3">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Entering...' : 'Sign In'}
            </button>
            <button 
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-zinc-200 text-zinc-800 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-zinc-300 transition-colors disabled:opacity-50"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}