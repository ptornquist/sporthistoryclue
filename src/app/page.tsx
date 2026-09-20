import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation - Sportig och minimalistisk */}
      <nav className="flex justify-between items-center p-6 border-b border-slate-800/50 uppercase tracking-widest text-xs font-bold">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-white">SportHistoryClue</span>
        </div>
        <div className="hidden md:flex gap-8 text-slate-400">
          <Link href="/play" className="hover:text-blue-400 transition-colors">Play</Link>
          <Link href="/daily" className="hover:text-blue-400 transition-colors">Daily Fixture</Link>
          <Link href="/tournaments" className="hover:text-blue-400 transition-colors">Tournaments</Link>
          <Link href="/profile" className="hover:text-blue-400 transition-colors">Stats</Link>
        </div>
        <Link href="/login" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors">
          Log In
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        
        {/* Hero Section */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-bold tracking-widest rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Season 2026 Active
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6 leading-[0.9]">
            History leaves <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              its mark.
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl text-lg font-medium">
            Analyze the clues. Deduce the match. Name the legend. Step into the arena and test your sports history knowledge against the clock.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Random Play */}
          <div className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 rounded-2xl p-8 flex flex-col justify-between min-h-[300px] cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <span className="text-9xl font-black">01</span>
            </div>
            <div>
              <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Quick Match</div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Play</h2>
              <p className="text-slate-400 text-sm">Face a random historical sports moment. Unlimited rounds, pure trivia.</p>
            </div>
            <Link href="/play" className="inline-flex items-center gap-2 text-white font-bold uppercase text-sm tracking-wider group-hover:text-blue-400 transition-colors">
              Enter Arena <span className="text-xl">→</span>
            </Link>
          </div>

          {/* Card 2: Daily Brief */}
          <div className="group bg-blue-600 hover:bg-blue-500 transition-all duration-300 rounded-2xl p-8 flex flex-col justify-between min-h-[300px] cursor-pointer shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] relative overflow-hidden md:scale-105 z-10">
            <div>
              <div className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Daily Fixture</span>
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-sm text-[9px]">NEW</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Today's <br/>Matchup</h2>
              <p className="text-blue-100 text-sm">One iconic moment worldwide. Resets at midnight. Compare stats with friends.</p>
            </div>
            <Link href="/daily" className="inline-flex items-center gap-2 text-white font-bold uppercase text-sm tracking-wider">
              Play Today <span className="text-xl">→</span>
            </Link>
          </div>

          {/* Card 3: Expeditions/Tournaments */}
          <div className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all duration-300 rounded-2xl p-8 flex flex-col justify-between min-h-[300px] cursor-pointer relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <span className="text-9xl font-black">03</span>
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Career Mode</div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Tournaments</h2>
              <p className="text-slate-400 text-sm">Play through eras, from the 1994 World Cup to Olympic classics. Unlock badges.</p>
            </div>
            <Link href="/tournaments" className="inline-flex items-center gap-2 text-white font-bold uppercase text-sm tracking-wider group-hover:text-white transition-colors">
              View Bracket <span className="text-xl">→</span>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}