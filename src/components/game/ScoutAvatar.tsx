import { frameClassName } from "@/lib/cosmetics";

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
  const initial = (label.replace(/^@/, "").trim().charAt(0) || "S").toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-amber-100 ${frameClassName(frameId)} ${dim}`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="font-black">{initial}</span>
      )}
    </div>
  );
}
