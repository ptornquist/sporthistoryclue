export const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
export const AVATAR_UPDATED_EVENT = "shc-avatar-updated";

export const RETRO_AVATARS = [
  { id: "icon:hockey", emoji: "🏒", label: "Ice Hockey" },
  { id: "icon:football", emoji: "⚽", label: "Classic Football" },
  { id: "icon:boxing", emoji: "🥊", label: "Golden Gloves" },
  { id: "icon:tennis", emoji: "🎾", label: "Wooden Racket" },
  { id: "icon:motorsport", emoji: "🏎️", label: "Vintage Motorsport" },
  { id: "icon:basketball", emoji: "🏀", label: "Retro Basketball" },
  { id: "icon:spikes", emoji: "🏃", label: "Gold Spikes" },
  { id: "icon:trophy", emoji: "🏆", label: "Grand Trophy" },
  { id: "icon:stopwatch", emoji: "⏱️", label: "Stadium Stopwatch" },
  { id: "icon:skiing", emoji: "🎿", label: "Alpine Skiing" },
] as const;

export type RetroAvatarId = (typeof RETRO_AVATARS)[number]["id"];

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

export function isPhotoAvatar(url: string | null | undefined): url is string {
  return Boolean(url && (url.startsWith("http://") || url.startsWith("https://")));
}

export function retroAvatarEmoji(url: string | null | undefined): string | null {
  if (!url) return null;
  const byId = RETRO_AVATARS.find((item) => item.id === url);
  if (byId) return byId.emoji;
  const byEmoji = RETRO_AVATARS.find((item) => item.emoji === url);
  return byEmoji?.emoji ?? null;
}

export function avatarTooLarge(size: number): boolean {
  return size > MAX_AVATAR_BYTES;
}

export function avatarFileExtension(file: { name: string; type: string }): string | null {
  const match = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  const raw = match?.[1]?.toLowerCase();
  if (raw && ALLOWED_EXTENSIONS.has(raw)) return raw;
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpeg";
  if (file.type === "image/webp") return "webp";
  return null;
}

export function avatarStoragePath(userId: string, fileExt: string, now = Date.now()): string {
  return `${userId}/avatar-${now}.${fileExt}`;
}

export function announceAvatar(url: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT, { detail: url }));
}
