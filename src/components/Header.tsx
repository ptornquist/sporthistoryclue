import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-[#fcfbf9] border-b border-zinc-200 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link className="font-black text-xl tracking-tight text-zinc-950" href="/">
          SPORTSHISTORYCLUE <span className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 ml-1">BETA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-zinc-700">
          <Link className="hover:text-blue-600 transition-colors" href="/">Daily Drop</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/campaigns">Campaigns</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/archive">Archive</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/standings">Standings</Link>
          <Link className="hover:text-blue-600 transition-colors" href="/shop">Shop</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link className="px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-zinc-900 text-xs font-black uppercase text-zinc-900 shadow-sm transition-all flex items-center gap-2" href="/profile">
          👤 Profile
        </Link>
      </div>
    </header>
  );
}
