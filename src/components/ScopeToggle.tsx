"use client";

import type { BoardScope } from "@/lib/board-scope";

export function ScopeToggle({
  value,
  onChange,
  swedenLabel,
  worldLabel,
  ariaLabel,
}: {
  value: BoardScope;
  onChange: (scope: BoardScope) => void;
  swedenLabel: string;
  worldLabel: string;
  ariaLabel: string;
}) {
  const options: { id: BoardScope; label: string }[] = [
    { id: "se", label: swedenLabel },
    { id: "world", label: worldLabel },
  ];

  return (
    <div className="flex self-start rounded-2xl bg-zinc-100 p-1" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${
              active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
