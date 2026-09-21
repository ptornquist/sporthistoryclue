import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      
      {/* Sleek Minimalist Header */}
      <nav className="flex justify-between items-center p-6 border-b border-zinc-100">
        <div className="font-black text-2xl tracking-tighter">
          SHC<span className="text-blue-600">.</span>
        </div>
        <div className="hidden md:flex gap-8 font-semibold text-sm tracking-wide text-zinc-500">
          <Link href="/play" className="hover:text-black transition-colors">Play</Link>
          <Link href="/daily" className="hover:text-black transition-colors">Daily Drop</Link>
          <Link href="/timeline" className="hover:text-black transition-colors">Timelines</Link>
          <Link href="/profile" className="hover:text-black transition-colors">Trophy Cabinet</Link>
        </div>
        <Link href="/login" className="bg-black text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-zinc-800 transition-colors">
          Sign In
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        
        {/* Clean Hero Section */}
        <div className="max-w-3xl mb-20 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Global Leaderboards Active
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            MASTER THE <br />
            <span className="text-blue-600">HISTORY.</span>
          </h1>
          <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-xl">
            The ultimate sports history platform. Challenge friends, unlock rare digital memorabilia, and climb the global ranks.
          </p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Drop */}
          <Link href="/daily" className="group p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-blue-600 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-16 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Daily Drop</h2>
            <p className="text-zinc-500 text-sm mb-6">One match. One chance. Everyone in the world gets the same puzzle.</p>
            <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">Play Today's Match &rarr;</span>
          </Link>

          {/* Timelines */}
          <Link href="/timeline" className="group p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-black hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-zinc-200 text-zinc-700 rounded-full flex items-center justify-center mb-16 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Timelines</h2>
            <p className="text-zinc-500 text-sm mb-6">Unlock the history of the Olympics, World Cups, Basketball, and Ice Hockey.</p>
            <span className="text-sm font-semibold text-black">View Campaigns &rarr;</span>
          </Link>

          {/* Social / Head to Head */}
          <Link href="/friends" className="group p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-black hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-zinc-200 text-zinc-700 rounded-full flex items-center justify-center mb-16 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Friend Leagues</h2>
            <p className="text-zinc-500 text-sm mb-6">Send direct challenges, track win rates, and dominate your friends.</p>
            <span className="text-sm font-semibold text-black">View Leaderboards &rarr;</span>
          </Link>

        </div>
      </div>
    </main>
  );
}