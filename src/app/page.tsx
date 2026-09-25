import { Suspense } from 'react';
import DailyDropArena from '@/components/game/DailyDropArena';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <DailyDropArena />
    </Suspense>
  );
}
