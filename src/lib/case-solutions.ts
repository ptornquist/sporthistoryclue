import "server-only";

/** Resolved matchups. Served only after the client already has a solved score. */
const MATCHUPS: Record<string, string> = {
  "miracle-on-ice-1980": "USA vs Soviet Union (1980)",
  "miracle-1980": "USA vs Soviet Union (1980)",
  "summit-series-1972": "Canada vs Soviet Union (1972)",
  "comaneci-1976": "Nadia Comăneci (1976)",
  "dream-team-1992": "USA Dream Team vs Croatia (1992)",
  "bolt-beijing-2008": "Usain Bolt (2008)",
  "bolt-2008": "Usain Bolt (2008)",
  "pele-sweden-1958": "Brazil vs Sweden (1958)",
  "pele-1958": "Brazil vs Sweden (1958)",
  "hand-of-god-1986": "Argentina vs England (1986)",
  "maradona-1986": "Argentina vs England (1986)",
  "rumble-in-the-jungle-1974": "Muhammad Ali vs George Foreman (1974)",
  "ali-1974": "Muhammad Ali vs George Foreman (1974)",
  "wimbledon-epic-1980": "Björn Borg vs John McEnroe (1980)",
};

export function solvedMatchup(id: string): string | null {
  return MATCHUPS[id] ?? null;
}
