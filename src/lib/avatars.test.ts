import { describe, expect, it } from "vitest";
import {
  MAX_AVATAR_BYTES,
  RETRO_AVATARS,
  avatarFileExtension,
  avatarStoragePath,
  avatarTooLarge,
  isPhotoAvatar,
  retroAvatarEmoji,
} from "./avatars";

describe("avatars", () => {
  it("maps retro sports icons to stable ids", () => {
    expect(RETRO_AVATARS).toHaveLength(10);
    expect(retroAvatarEmoji("icon:hockey")).toBe("🏒");
    expect(retroAvatarEmoji("icon:football")).toBe("⚽");
    expect(retroAvatarEmoji("icon:skiing")).toBe("🎿");
    expect(retroAvatarEmoji("🏆")).toBe("🏆");
    expect(retroAvatarEmoji("https://cdn.example/a.png")).toBeNull();
    expect(retroAvatarEmoji(null)).toBeNull();
  });

  it("treats only http urls as photos and rejects files over 3MB", () => {
    expect(isPhotoAvatar("https://cdn.example/avatar.webp")).toBe(true);
    expect(isPhotoAvatar("http://cdn.example/avatar.jpg")).toBe(true);
    expect(isPhotoAvatar("icon:hockey")).toBe(false);
    expect(avatarTooLarge(MAX_AVATAR_BYTES)).toBe(false);
    expect(avatarTooLarge(MAX_AVATAR_BYTES + 1)).toBe(true);
  });

  it("builds the avatars bucket path from the file extension", () => {
    expect(avatarFileExtension({ name: "badge.PNG", type: "" })).toBe("png");
    expect(avatarFileExtension({ name: "badge", type: "image/webp" })).toBe("webp");
    expect(avatarFileExtension({ name: "notes.pdf", type: "application/pdf" })).toBeNull();
    expect(avatarStoragePath("user-1", "jpeg", 1700000000000)).toBe("user-1/avatar-1700000000000.jpeg");
  });
});
