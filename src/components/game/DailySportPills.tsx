'use client';

import { CASE_FILES, categoryMatchesSport } from '@/lib/case-files';

export const DAILY_SPORTS = [
  { id: 'ice_hockey', name: 'Ishockey', icon: '🏒' },
  { id: 'football', name: 'Fotboll', icon: '⚽' },
  { id: 'boxing', name: 'Boxning', icon: '🥊' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'athletics', name: 'Friidrott', icon: '🏃' },
] as const;

export type DailySportId = (typeof DAILY_SPORTS)[number]['id'];

export function sportMatchSlug(sportId: string): string | null {
  return CASE_FILES.find((file) => file.sport === sportId)?.slug ?? null;
}

export function sportIdForCategory(category: string | null | undefined): DailySportId | null {
  return DAILY_SPORTS.find((sport) => categoryMatchesSport(category ?? undefined, sport.id))?.id ?? null;
}

export function DailySportPills({
  selectedSport,
  onSelect,
}: {
  selectedSport: string | null;
  onSelect: (sportId: DailySportId) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-4 w-full">
      {DAILY_SPORTS.map((sport) => (
        <button
          key={sport.id}
          type="button"
          onClick={() => onSelect(sport.id)}
          className={`px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 border-2 shrink-0 transition-all ${
            selectedSport === sport.id
              ? 'bg-blue-600 border-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-900'
          }`}
        >
          <span>{sport.icon}</span>
          <span>{sport.name}</span>
        </button>
      ))}
    </div>
  );
}
