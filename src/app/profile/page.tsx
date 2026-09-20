'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }
      
      setUser(session.user);

      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = '/login';
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      // (supabaseClient as any) tvingar TypeScript att godkänna anropet
      const { error: uploadError } = await (supabaseClient as any).storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      const { data } = (supabaseClient as any).storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: data.publicUrl });
    } catch (error) {
      console.error('Fel vid uppladdning:', error);
      alert('Kunde inte ladda upp bilden.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-2xl tracking-widest">Loading Stats...</div>;

  return (
    <main className="min-h-screen bg-zinc-50 text-black font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 gap-4">
          <div>
            <Link href="/" className="inline-block mb-4 text-sm font-black uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full hover:bg-lime-400 hover:text-black transition-colors border-2 border-transparent hover:border-black">
              ← Back to Arena
            </Link>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-1 leading-none">Player Stats</h1>
            <p className="text-zinc-600 font-bold text-sm md:text-base uppercase tracking-widest">Global Ranking • Achievements • Progress</p>
          </div>
          <button onClick={handleSignOut} className="bg-black text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-full hover:bg-red-500 hover:text-black transition-all border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Vänster kolumn: Spelar-ID & Avatar */}
          <div className="col-span-1 bg-lime-400 border-4 border-black rounded-3xl p-8 flex flex-col items-center text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            
            <label className="cursor-pointer relative group flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 border-black mb-6 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profilbild" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">🏆</span>
              )}
              
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-lime-400 font-black uppercase tracking-widest">{uploading ? 'Wait...' : 'Upload'}</span>
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={uploadAvatar} 
                disabled={uploading} 
                className="hidden" 
              />
            </label>

            <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-2 break-all">
              {profile?.username || user?.email?.split('@')[0]}
            </h2>
            <div className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-8">
              Grand Slam Champion
            </div>
            
            <div className="w-full bg-white border-2 border-black rounded-full h-4 mb-2 overflow-hidden shadow-inner">
              <div className="bg-cyan-400 h-full border-r-2 border-black w-1/3"></div>
            </div>
            <span className="text-xs text-black font-black uppercase tracking-widest">Level 34</span>
          </div>

          {/* Höger kolumn: Statistik och Badges */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            
            {/* Stats Block */}
            <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6">Career Numbers</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="bg-zinc-100 border-4 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-5xl md:text-6xl font-black text-lime-500 mb-2" style={{ WebkitTextStroke: '2px black' }}>
                    {profile?.total_score?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs font-black text-black uppercase tracking-widest">Total Score</div>
                </div>
                <div className="bg-zinc-100 border-4 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-5xl md:text-6xl font-black text-cyan-400 mb-2" style={{ WebkitTextStroke: '2px black' }}>
                    0
                  </div>
                  <div className="text-xs font-black text-black uppercase tracking-widest">Matches Played</div>
                </div>
              </div>
            </div>

            {/* Badges Block */}
            <div className="bg-cyan-300 border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-black uppercase tracking-widest">Trophy Cabinet</h3>
                <span className="text-xs text-black font-bold cursor-pointer hover:underline uppercase tracking-wider">View All →</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[
                  { icon: '🥇', name: 'First Blood' },
                  { icon: '🌍', name: 'Global Pro' },
                  { icon: '🔥', name: 'On Fire' },
                  { icon: '🤝', name: 'Team Player' }
                ].map((badge, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-32 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[4px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                    <span className="text-4xl mb-3">{badge.icon}</span>
                    <span className="text-[10px] font-black text-black text-center px-2 uppercase tracking-wider">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}