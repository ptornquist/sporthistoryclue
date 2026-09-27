import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScoutAvatar } from "./ScoutAvatar";
import { AvatarPickerModal, ProfileAvatarButton } from "./AvatarPickerModal";

describe("scout avatar rendering", () => {
  it("shows a photo, a retro icon, or the initial", () => {
    const photo = renderToStaticMarkup(
      createElement(ScoutAvatar, {
        label: "peter",
        avatarUrl: "https://cdn.example/peter.jpg",
        size: "sm",
      }),
    );
    const icon = renderToStaticMarkup(
      createElement(ScoutAvatar, { label: "peter", avatarUrl: "icon:hockey", size: "sm" }),
    );
    const fallback = renderToStaticMarkup(createElement(ScoutAvatar, { label: "peter", size: "sm" }));

    expect(photo).toContain('src="https://cdn.example/peter.jpg"');
    expect(photo).not.toContain(">P<");
    expect(icon).toContain("🏒");
    expect(icon).not.toContain("icon:hockey");
    expect(fallback).toContain(">P<");
  });

  it("renders the profile edit badge and the stadium picker", () => {
    const button = renderToStaticMarkup(
      createElement(ProfileAvatarButton, {
        label: "peter",
        avatarUrl: "https://cdn.example/peter.jpg",
        onClick: () => undefined,
      }),
    );
    const iconButton = renderToStaticMarkup(
      createElement(ProfileAvatarButton, {
        label: "peter",
        avatarUrl: "icon:football",
        onClick: () => undefined,
      }),
    );
    const modal = renderToStaticMarkup(
      createElement(AvatarPickerModal, {
        open: true,
        userId: null,
        currentUrl: "icon:hockey",
        onClose: () => undefined,
        onSaved: () => undefined,
        onToast: () => undefined,
      }),
    );
    const closed = renderToStaticMarkup(
      createElement(AvatarPickerModal, {
        open: false,
        userId: null,
        onClose: () => undefined,
        onSaved: () => undefined,
        onToast: () => undefined,
      }),
    );

    expect(button).toContain("w-24 h-24 rounded-full object-cover border-4 border-white shadow-md");
    expect(button).toContain("bg-zinc-900 text-white p-2 rounded-full shadow hover:bg-blue-600 transition-all cursor-pointer");
    expect(button).toContain("Change avatar");
    expect(iconButton).toContain("⚽");
    expect(modal).toContain("Choose Retro Sports Icon");
    expect(modal).toContain("Ice Hockey");
    expect(modal).toContain("Alpine Skiing");
    expect(modal).toContain("Upload Custom Photo");
    expect(modal).toContain("Upload Photo");
    expect(modal).toContain('accept="image/png, image/jpeg, image/webp"');
    expect(modal).toContain("🏒");
    expect(closed).toBe("");
  });
});