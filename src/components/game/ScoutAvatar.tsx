import { frameClassName } from "@/lib/cosmetics";
import { isPhotoAvatar, retroAvatarEmoji } from "@/lib/avatars";

export function ScoutAvatar({
  frameId,
  avatarUrl,
  label,
  size = "md",
}: {
  frameId?: string | null;
  avatarUrl?: string | null;
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "h-24 w-24 text-3xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  const emojiSize = size === "lg" ? "text-4xl" : size === "sm" ? "text-base" : "text-lg";
  const initial = (label.replace(/^@/, "").trim().charAt(0) || "S").toUpperCase();
  const emoji = retroAvatarEmoji(avatarUrl);
  const photo = isPhotoAvatar(avatarUrl);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white ${frameClassName(frameId)} ${dim}`}
    >
      {photo ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : emoji ? (
        <span className={emojiSize} aria-hidden>
          {emoji}
        </span>
      ) : (
        <span className="font-black">{initial}</span>
      )}
    </div>
  );
}
