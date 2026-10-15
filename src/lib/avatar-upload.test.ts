import { describe, expect, it } from "vitest";
import { avatarUploadIssue } from "./avatar-upload";

describe("avatar upload", () => {
  it("accepts a jpeg, png, or webp under 2 MB", () => {
    expect(avatarUploadIssue({ type: "image/jpeg", size: 1200 })).toBeNull();
    expect(avatarUploadIssue({ type: "image/png", size: 1200 })).toBeNull();
    expect(avatarUploadIssue({ type: "image/webp", size: 1200 })).toBeNull();
  });

  it("rejects other types and oversized files", () => {
    expect(avatarUploadIssue({ type: "image/gif", size: 1200 })).toBe("type");
    expect(avatarUploadIssue({ type: "image/jpeg", size: 0 })).toBe("size");
    expect(avatarUploadIssue({ type: "image/jpeg", size: 2 * 1024 * 1024 + 1 })).toBe("size");
  });
});
