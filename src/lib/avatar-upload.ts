import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import { saveProfilePatch } from "@/lib/ensure-profile";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadProfileAvatar(userId: string, file: File): Promise<string | null> {
  if (!userId || !isSupabaseConfigured) return null;
  if (!TYPES.has(file.type) || file.size <= 0 || file.size > MAX_BYTES) return null;
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/avatar.${extension}`;
  const uploaded = await supabaseClient.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });
  if (uploaded.error) {
    console.error("Avatar upload error:", uploaded.error);
    return null;
  }
  const { data } = supabaseClient.storage.from("avatars").getPublicUrl(path);
  const publicUrl = data.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : "";
  if (!publicUrl) return null;
  const saved = await saveProfilePatch(userId, { avatar_url: publicUrl });
  if (!saved) console.error("Avatar profile update failed");
  return publicUrl;
}
