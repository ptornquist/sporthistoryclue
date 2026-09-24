'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState('Scout');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [streak, setStreak] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initProfile = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.username) setUsername(profile.username);
      else if (user.email) setUsername(user.email.split('@')[0]);

      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      const savedStreak = parseInt(localStorage.getItem('shc_streak') || '1', 10);
      setStreak(savedStreak);
      setLoading(false);
    };

    initProfile();
  }, [router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0 || !currentUser) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentUser.id}/avatar.${fileExt}`;

      // Ladda upp till Supabase Storage ('avatars' bucket)
      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // Fallback: om Storage-bucket inte är konfigurerad än kan vi konvertera till data-URL
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Url = reader.result as string;
          setAvatarUrl(base64Url);
          await supabaseClient
            .from('profiles')
            .upsert({ id: currentUser.id, avatar_url: base64Url });
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabaseClient.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;
        setAvatarUrl(publicUrl);

        await supabaseClient
          .from('profiles')
          .upsert({ id: currentUser.id, avatar_url: publicUrl });
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
        Loading Scout Profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Profile Card */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              {/* Klickbar Avatar för bilduppladdning */}
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-20 h-20 rounded-3xl object-cover border-2 border-zinc-200 shadow-md group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white font-black text-3xl flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold uppercase tracking-wider">
                  {uploading ? 'Sparar...' : 'Byt bild'}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div>
                <span className="px-3 py-1 bg-zinc-100 text-zinc-600 font-mono text-[10px] font-bold uppercase rounded-full tracking-wider mb-2 inline-block">
                  Verified Scout
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
                  {username}
                </h1>
                <p className="text-xs text-zinc-400 font-medium">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-bold text-amber-700 font-mono">
                🔥 {streak} Dagar Streak
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-2xl text-xs font-bold uppercase transition-colors"
              >
                Logga ut
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Total Wins</span>
              <span className="text-3xl font-black text-blue-600">14</span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Career Points</span>
              <span className="text-3xl font-black text-zinc-900">142 000</span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Deduction %</span>
              <span className="text-3xl font-black text-emerald-600">98%</span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Badges</span>
              <span className="text-3xl font-black text-zinc-900">2</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}