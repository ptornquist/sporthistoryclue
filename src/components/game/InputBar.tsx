"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rankEventOptions } from "@/lib/fuzzy";
import { MAX_CLUES, PENALTY_PER_CLUE } from "@/lib/scoring";
import type { EventOption } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InputBarProps {
  events: EventOption[];
  cluesRevealed: number;
  canRevealMore: boolean;
  disabled?: boolean;
  pending?: boolean;
  onGuess: (event: string, year: number) => void;
  onReveal: () => void;
  onGiveUp: () => void;
}

export function InputBar({
  events,
  cluesRevealed,
  canRevealMore,
  disabled,
  pending,
  onGuess,
  onReveal,
  onGiveUp,
}: InputBarProps) {
  const [event, setEvent] = React.useState("");
  const [year, setYear] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listId = React.useId();

  const suggestions = React.useMemo(
    () => rankEventOptions(event, events, 7),
    [event, events],
  );

  function submit() {
    const parsedYear = Number.parseInt(year, 10);
    if (!event.trim() || Number.isNaN(parsedYear)) return;
    onGuess(event.trim(), parsedYear);
  }

  function nudgeYear(delta: number) {
    const current = Number.parseInt(year, 10);
    const next = Number.isNaN(current) ? 1980 : current + delta;
    setYear(String(Math.min(2035, Math.max(1800, next))));
  }

  return (
    <form
      className="rounded-xl border border-gold/25 bg-card/90 p-4 shadow-lg backdrop-blur"
      onSubmit={(eventSubmit) => {
        eventSubmit.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_8.5rem_auto]">
        <div className="relative">
          <Label htmlFor="event-guess">Subject</Label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/60" />
            <Input
              id="event-guess"
              autoComplete="off"
              role="combobox"
              aria-expanded={open && suggestions.length > 0}
              aria-controls={listId}
              placeholder="Miraklet på isen, Fosbury-flopen…"
              value={event}
              disabled={disabled}
              className="pl-9"
              onChange={(change) => {
                setEvent(change.target.value);
                setOpen(true);
                setActiveIndex(0);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 120);
              }}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "ArrowDown") {
                  keyEvent.preventDefault();
                  setActiveIndex((value) => Math.min(value + 1, suggestions.length - 1));
                }
                if (keyEvent.key === "ArrowUp") {
                  keyEvent.preventDefault();
                  setActiveIndex((value) => Math.max(value - 1, 0));
                }
                if (keyEvent.key === "Enter" && open && suggestions[activeIndex]) {
                  keyEvent.preventDefault();
                  setEvent(suggestions[activeIndex].label);
                  setOpen(false);
                }
              }}
            />
          </div>
          {open && suggestions.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gold/25 bg-ink py-1 text-paper shadow-xl"
            >
              {suggestions.map((option, index) => (
                <li key={option.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm",
                      index === activeIndex ? "bg-gold text-ink" : "hover:bg-gold/10",
                    )}
                    onMouseDown={(mouseEvent) => {
                      mouseEvent.preventDefault();
                      setEvent(option.label);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label htmlFor="year-guess">Year</Label>
          <div className="mt-2 flex">
            <Input
              id="year-guess"
              inputMode="numeric"
              pattern="[0-9]{4}"
              placeholder="1980"
              value={year}
              disabled={disabled}
              className="rounded-r-none font-mono text-lg tracking-widest"
              onChange={(change) =>
                setYear(change.target.value.replace(/[^\d]/g, "").slice(0, 4))
              }
            />
            <div className="flex flex-col border border-l-0 border-input">
              <button
                type="button"
                className="flex h-6 w-8 items-center justify-center bg-ink text-gold hover:bg-gold hover:text-ink"
                onClick={() => nudgeYear(1)}
                aria-label="Increase year"
                disabled={disabled}
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                className="flex h-6 w-8 items-center justify-center border-t border-gold/35 bg-ink text-gold hover:bg-gold hover:text-ink"
                onClick={() => nudgeYear(-1)}
                aria-label="Decrease year"
                disabled={disabled}
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" variant="gold" className="flex-1 md:flex-none" disabled={disabled || pending}>
            {pending ? "Checking…" : "Log guess"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">
          Subject + year · clue {cluesRevealed} of {MAX_CLUES}. Autocomplete helps; scoring is exact.
        </p>
        {canRevealMore ? (
          <Button variant="outline" onClick={onReveal} disabled={disabled}>
            Reveal next clue · −{PENALTY_PER_CLUE.toLocaleString("en-US")}
          </Button>
        ) : !disabled ? (
          <Button variant="outline" onClick={onGiveUp}>
            Close the file
          </Button>
        ) : null}
      </div>
    </form>
  );
}
