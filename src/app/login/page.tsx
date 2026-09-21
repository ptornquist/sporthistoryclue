'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/profile';
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Account created! You can now log in.');
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-6 text-zinc-900 font-sans">
      <Link href="/" className="absolute top-6 left-6 font-black text-2xl tracking-tighter">
        SHC<span className="text-blue-600">.</span>
      </Link>
      
      <div className="w-full max-w-md bg-zinc-50 border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight mb-2 text-center">Welcome Back</h1>
        <p className="text-zinc-500 text-sm text-center mb-8 font-medium">Log in to save your global leaderboard progress.</p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              placeholder="player@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold text-sm py-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-zinc-200 text-zinc-800 font-bold text-sm py-3 rounded-full hover:bg-zinc-300 transition-colors disabled:opacity-50"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}