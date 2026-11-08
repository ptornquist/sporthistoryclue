const SLOT_KEYS = [
  ["arena", "the_arena", "arena_stakes", "stadium", "venue"],
  ["era", "era_context", "context", "the_era"],
  ["lineup", "lineup_tactics", "tactics", "roster"],
  ["image_clue", "archive_photo", "photo", "image", "picture"],
  ["climax", "the_climax", "payoff"],
] as const;

const CLUE_KINDS = new Set(["image", "stats", "text", "quote"]);

function parseMaybeJson(source: unknown): unknown {
  if (typeof source !== "string") return source;
  const trimmed = source.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return source;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return source;
  }
}

function slotIndexForKey(key: string): number {
  const normalized = key.toLowerCase().replace(/[\s-]+/g, "_");
  return SLOT_KEYS.findIndex((aliases) => (aliases as readonly string[]).includes(normalized));
}

function hasSlotKey(record: Record<string, unknown>): boolean {
  return Object.keys(record).some((key) => slotIndexForKey(key) >= 0);
}

function statLine(value: unknown): string {
  return splitStats(value).early;
}

/** Names and years marked for clue 5+ stay off the lineup card. */
function splitStats(value: unknown): { early: string; late: string } {
  if (!Array.isArray(value)) return { early: "", late: "" };
  const early: string[] = [];
  const late: string[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const stat = item as Record<string, unknown>;
    const label = typeof stat.label === "string" ? stat.label.trim() : "";
    const statValue = typeof stat.value === "string" ? stat.value.trim() : "";
    const line = label && statValue ? `${label}: ${statValue}` : label || statValue;
    if (!line) continue;
    const reveal = typeof stat.revealedAtClue === "number" ? stat.revealedAtClue : 3;
    if (reveal >= 5) late.push(line);
    else early.push(line);
  }
  return { early: early.join(" · "), late: late.join(" · ") };
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  if (typeof record.body === "string" && record.body.trim()) return record.body.trim();
  if (typeof record.quote === "string" && record.quote.trim()) return record.quote.trim();
  if (typeof record.text === "string" && record.text.trim()) return record.text.trim();
  const stats = statLine(record.stats);
  if (stats) return stats;
  if (typeof record.kicker === "string" && record.kicker.trim()) return record.kicker.trim();
  return "";
}

function looksLikeClue(record: Record<string, unknown>): boolean {
  const kind = typeof record.kind === "string" ? record.kind.toLowerCase() : "";
  return CLUE_KINDS.has(kind) || Boolean(textOf(record)) || "image" in record;
}

function preferredSlot(record: Record<string, unknown>): number | null {
  const kind = typeof record.kind === "string" ? record.kind.toLowerCase() : "";
  const kicker = typeof record.kicker === "string" ? record.kicker.toLowerCase() : "";
  if (kind === "quote" || kicker.includes("climax") || kicker.includes("klimax")) return 4;
  if (kind === "image" || ("image" in record && kind !== "text" && kind !== "stats")) return 3;
  if (kind === "stats" || kicker.includes("lineup") || kicker.includes("result") || kicker.includes("uppställning")) return 2;
  if (kicker.includes("era") || kicker.includes("epok")) return 1;
  if (kicker.includes("final") || kicker.includes("slutbrief")) return 1;
  if (
    kind === "text" ||
    kicker.includes("field") ||
    kicker.includes("fält") ||
    kicker.includes("arena") ||
    kicker.includes("venue")
  ) {
    return 0;
  }
  return null;
}

function assignKeys(record: Record<string, unknown>, slots: string[]): void {
  for (const [key, value] of Object.entries(record)) {
    const index = slotIndexForKey(key);
    const text = textOf(value);
    if (index >= 0 && text && !slots[index]) slots[index] = text;
  }
}

function isKindClue(record: Record<string, unknown>): boolean {
  return typeof record.kind === "string" && CLUE_KINDS.has(record.kind.toLowerCase());
}

function assignClue(record: Record<string, unknown>, slots: string[], leftovers: string[], lateStats: string[]): void {
  const kind = typeof record.kind === "string" ? record.kind.toLowerCase() : "";
  const stats = kind === "stats" || Array.isArray(record.stats) ? splitStats(record.stats) : null;
  const text = stats ? stats.early : textOf(record);
  if (stats?.late) lateStats.push(stats.late);
  if (!text) return;
  const index = preferredSlot(record);
  if (index !== null && !slots[index]) {
    slots[index] = text;
    return;
  }
  leftovers.push(text);
}

function fillEmpty(slots: string[], leftovers: string[]): void {
  for (const extra of leftovers) {
    const empty = slots.findIndex((slot) => !slot);
    if (empty < 0) break;
    slots[empty] = extra;
  }
}

function attachLateStats(slots: string[], lateStats: string[]): void {
  const extra = lateStats.filter(Boolean).join(" · ");
  if (!extra) return;
  slots[4] = slots[4] ? `${slots[4]} · ${extra}` : extra;
}

function readStructuredSlots(source: unknown): string[] | null {
  const parsed = parseMaybeJson(source);
  if (!parsed || typeof parsed !== "object") return null;

  const slots = ["", "", "", "", ""];
  const leftovers: string[] = [];
  const lateStats: string[] = [];

  if (Array.isArray(parsed)) {
    if (parsed.length === 0 || parsed.every((item) => typeof item === "string")) return null;
    let recognized = false;
    for (const item of parsed) {
      if (typeof item === "string") {
        const text = item.trim();
        if (text) leftovers.push(text);
        continue;
      }
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      if (isKindClue(record)) {
        recognized = true;
        assignClue(record, slots, leftovers, lateStats);
      } else if (hasSlotKey(record)) {
        recognized = true;
        assignKeys(record, slots);
      } else if (looksLikeClue(record)) {
        recognized = true;
        assignClue(record, slots, leftovers, lateStats);
      } else {
        const text = textOf(record);
        if (text) leftovers.push(text);
      }
    }
    if (!recognized) return null;
    fillEmpty(slots, leftovers);
    attachLateStats(slots, lateStats);
    return slots;
  }

  const record = parsed as Record<string, unknown>;
  if (isKindClue(record)) {
    assignClue(record, slots, leftovers, lateStats);
    fillEmpty(slots, leftovers);
    attachLateStats(slots, lateStats);
    return slots;
  }
  if (hasSlotKey(record)) {
    assignKeys(record, slots);
    fillEmpty(slots, leftovers);
    return slots;
  }
  if (looksLikeClue(record)) {
    assignClue(record, slots, leftovers, lateStats);
    fillEmpty(slots, leftovers);
    attachLateStats(slots, lateStats);
    return slots;
  }
  return null;
}

/** Five clue strings in arena → era → lineup → image → climax order. */
export function resolveTacticalClueList(source: unknown): string[] {
  const structured = readStructuredSlots(source);
  if (structured) return structured;

  const parsed = parseMaybeJson(source);
  if (typeof parsed === "string") {
    const text = parsed.trim();
    return text ? [text] : [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => (typeof item === "string" ? item.trim() : textOf(item)))
    .filter((item) => item.length > 0);
}

export function getClueContent(source: unknown, tileIndex: number): string {
  if (tileIndex < 0) return "";
  return resolveTacticalClueList(source)[tileIndex] ?? "";
}
