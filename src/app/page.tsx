import React from 'react';
import GameContent from '@/components/game/DailyDropArena';

export default function Page() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs uppercase text-zinc-400">
          Loading Drop...
        </div>
      }
    >
      <GameContent />
    </React.Suspense>
  );
}
