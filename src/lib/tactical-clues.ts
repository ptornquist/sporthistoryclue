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
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const stat = item as Record<string, unknown>;
      const label = typeof stat.label === "string" ? stat.label.trim() : "";
      const statValue = typeof stat.value === "string" ? stat.value.trim() : "";
      if (label && statValue) return `${label}: ${statValue}`;
      return label || statValue;
    })
    .filter(Boolean)
    .join(" · ");
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
  if (kind === "quote" || kicker.includes("climax")) return 4;
  if (kind === "image" || ("image" in record && kind !== "text" && kind !== "stats")) return 3;
  if (kind === "stats" || kicker.includes("lineup") || kicker.includes("result")) return 2;
  if (kicker.includes("era")) return 1;
  if (kicker.includes("final")) return 1;
  if (kind === "text" || kicker.includes("field") || kicker.includes("arena") || kicker.includes("venue")) {
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

function assignClue(record: Record<string, unknown>, slots: string[], leftovers: string[]): void {
  const text = textOf(record);
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

function readStructuredSlots(source: unknown): string[] | null {
  const parsed = parseMaybeJson(source);
  if (!parsed || typeof parsed !== "object") return null;

  const slots = ["", "", "", "", ""];
  const leftovers: string[] = [];

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
        assignClue(record, slots, leftovers);
      } else if (hasSlotKey(record)) {
        recognized = true;
        assignKeys(record, slots);
      } else if (looksLikeClue(record)) {
        recognized = true;
        assignClue(record, slots, leftovers);
      } else {
        const text = textOf(record);
        if (text) leftovers.push(text);
      }
    }
    if (!recognized) return null;
    fillEmpty(slots, leftovers);
    return slots;
  }

  const record = parsed as Record<string, unknown>;
  if (isKindClue(record)) {
    assignClue(record, slots, leftovers);
    fillEmpty(slots, leftovers);
    return slots;
  }
  if (hasSlotKey(record)) {
    assignKeys(record, slots);
    fillEmpty(slots, leftovers);
    return slots;
  }
  if (looksLikeClue(record)) {
    assignClue(record, slots, leftovers);
    fillEmpty(slots, leftovers);
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
