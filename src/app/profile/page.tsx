'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

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

      // Hämta den publika URL:en
      const { data } = (supabaseClient as any).storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Uppdatera profil i databasen
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

  if (loading) return <div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center">Laddar profil...</div>;

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Profile</h1>
            <p className="text-zinc-500 text-sm">Player statistics • Achievements • Progress</p>
          </div>
          <button onClick={handleSignOut} className="text-sm text-zinc-400 hover:text-white transition-colors">
            Logga ut
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vänster kolumn: Spelar-ID & Avatar */}
          <div className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl">
            
            {/* Ny uppladdningsbar Avatar */}
            <label className="cursor-pointer relative group flex items-center justify-center w-24 h-24 rounded-full bg-zinc-800 border-2 border-amber-500/50 mb-4 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profilbild" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🏆</span>
              )}
              
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white font-medium">{uploading ? 'Laddar...' : 'Byt bild'}</span>
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={uploadAvatar} 
                disabled={uploading} 
                className="hidden" 
              />
            </label>

            <h2 className="text-xl font-bold text-white mb-1">{profile?.username || user?.email?.split('@')[0]}</h2>
            <div className="text-amber-400 text-sm font-semibold mb-6 flex items-center gap-1">
              ✨ Grand Slam Champion
            </div>
            
            <div className="w-full bg-zinc-900 rounded-full h-2 mb-2">
              <div className="bg-amber-500 h-2 rounded-full w-1/3"></div>
            </div>
            <span className="text-xs text-zinc-500 font-medium">Level 34</span>
          </div>

          {/* Höger kolumn: Statistik och Badges */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Player Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                  <div className="text-3xl font-bold text-amber-400 mb-1">{profile?.total_score?.toLocaleString() || '0'}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Score</div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                  <div className="text-3xl font-bold text-zinc-200 mb-1">0</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Expeditions Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Featured Badges</h3>
                <span className="text-xs text-amber-500/80 cursor-pointer hover:text-amber-400">View All →</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                  { icon: '🥇', name: 'First Gold' },
                  { icon: '🌍', name: 'World Traveler' },
                  { icon: '🔥', name: '3-Day Streak' },
                  { icon: '🤝', name: 'Friendly Rival' }
                ].map((badge, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                    <span className="text-2xl mb-2">{badge.icon}</span>
                    <span className="text-[10px] text-zinc-400 text-center px-1">{badge.name}</span>
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