export function formatOptionText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^[0-9]{4}\s+[a-z_]+:\s*/i, "")
    .replace(/^[a-z_]+:\s*/i, "")
    .replace(/_/g, " ")
    .trim();
}

export function optionIdentity(text: string): string {
  return formatOptionText(text)
    .toLowerCase()
    .replace(/\s*\((?:18|19|20)\d{2}\)\s*/g, " ")
    .replace(/^(?:18|19|20)\d{2}\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isNearDuplicate(left: string, right: string): boolean {
  if (left === right) return true;
  if (left.length < 8 || right.length < 8) return false;
  return left.includes(right) || right.includes(left);
}

/** Keeps the first original string for each distinct matchup, capped at four. */
export function distinctOptionValues(options: string[], limit = 4): string[] {
  const kept: string[] = [];
  const keys: string[] = [];
  for (const option of options) {
    const raw = option.trim();
    const label = formatOptionText(raw);
    const key = optionIdentity(raw);
    if (!raw || !label || !key) continue;
    if (keys.some((existing) => isNearDuplicate(existing, key))) continue;
    keys.push(key);
    kept.push(raw);
    if (kept.length >= limit) break;
  }
  return kept;
}
