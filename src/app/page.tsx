import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-black font-sans">
      
      {/* App Header */}
      <nav className="flex justify-between items-center p-4 sm:p-6 border-b-4 border-black bg-white">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter uppercase">
          <span className="text-3xl">⚡️</span> SHC
        </div>
        <div className="hidden md:flex gap-8 font-black uppercase tracking-widest text-sm">
          <Link href="/play" className="hover:text-lime-500 transition-colors hover:-translate-y-1 transform">Play</Link>
          <Link href="/daily" className="hover:text-lime-500 transition-colors hover:-translate-y-1 transform">Daily Drop</Link>
          <Link href="/tournaments" className="hover:text-lime-500 transition-colors hover:-translate-y-1 transform">Seasons</Link>
          <Link href="/profile" className="hover:text-lime-500 transition-colors hover:-translate-y-1 transform">Profile</Link>
        </div>
        <Link href="/login" className="bg-black text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-full hover:bg-lime-400 hover:text-black transition-all border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
          Log In
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-24">
        
        {/* Hero Section */}
        <div className="mb-20 text-center md:text-left flex flex-col md:items-start items-center">
          <div className="inline-block bg-lime-400 border-2 border-black font-black uppercase tracking-widest text-xs px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 transform -rotate-2">
            🔥 Season 2026 is LIVE
          </div>
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-6">
            Know <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-cyan-500" style={{ WebkitTextStroke: '3px black' }}>
              Your Stats.
            </span>
          </h1>
          <p className="text-zinc-600 max-w-xl text-lg md:text-xl font-bold">
            Drop into the arena. Guess the historical match. Flex your sports knowledge on the global leaderboard.
          </p>
        </div>

        {/* Action Grid (Neo-Brutalism) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Random Play */}
          <Link href="/play" className="block group bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex justify-between items-start mb-12">
              <span className="text-5xl">🎯</span>
              <span className="font-black text-4xl text-zinc-200 group-hover:text-black transition-colors">01</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Quick<br/>Match</h2>
            <p className="text-zinc-500 font-bold text-sm mb-6">Endless mode. Pure trivia. Swipe through history.</p>
            <div className="font-black uppercase tracking-wider text-sm flex items-center gap-2 group-hover:text-lime-500 transition-colors">
              Enter Arena &rarr;
            </div>
          </Link>

          {/* Card 2: Daily Drop */}
          <Link href="/daily" className="block group bg-lime-400 border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex justify-between items-start mb-12">
              <span className="text-5xl">🌍</span>
              <span className="bg-black text-lime-400 font-black uppercase text-[10px] px-3 py-1 rounded-full animate-pulse border-2 border-black">New</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Daily<br/>Drop</h2>
            <p className="text-black font-bold text-sm mb-6">One match a day. Everyone gets the same clue. Share your streak.</p>
            <div className="font-black uppercase tracking-wider text-sm flex items-center gap-2 text-black">
              Play Today &rarr;
            </div>
          </Link>

          {/* Card 3: Tournaments */}
          <Link href="/tournaments" className="block group bg-cyan-300 border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex justify-between items-start mb-12">
              <span className="text-5xl">🏆</span>
              <span className="font-black text-4xl text-black/10 group-hover:text-black transition-colors">03</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Career<br/>Mode</h2>
            <p className="text-black font-bold text-sm mb-6">Unlock badges from the '94 World Cup to Olympic classics.</p>
            <div className="font-black uppercase tracking-wider text-sm flex items-center gap-2 text-black">
              View Bracket &rarr;
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}