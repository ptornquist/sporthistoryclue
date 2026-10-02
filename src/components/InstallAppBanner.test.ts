import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InstallAppBannerCard, isDisplayStandalone, isIosSafari } from "./InstallAppBanner";

const SHEET =
  "fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl";

describe("install platform detection", () => {
  it("treats iPhone, iPad, and iPod as iOS unless MSStream is present", () => {
    expect(isIosSafari("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)", undefined)).toBe(true);
    expect(isIosSafari("Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X)", undefined)).toBe(true);
    expect(isIosSafari("Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)", undefined)).toBe(true);
    expect(isIosSafari("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)", {})).toBe(false);
    expect(isIosSafari("Mozilla/5.0 (Linux; Android 14; Pixel 8)", undefined)).toBe(false);
  });

  it("hides the banner when the app is already standalone", () => {
    expect(isDisplayStandalone(true, undefined)).toBe(true);
    expect(isDisplayStandalone(false, true)).toBe(true);
    expect(isDisplayStandalone(false, false)).toBe(false);
    expect(isDisplayStandalone(false, undefined)).toBe(false);
  });
});

describe("InstallAppBannerCard", () => {
  it("gives iOS Safari numbered share steps and no install button", () => {
    const html = renderToStaticMarkup(
      createElement(InstallAppBannerCard, {
        platform: "ios",
        manualHint: false,
        onInstall: () => undefined,
        onDismiss: () => undefined,
      }),
    );
    expect(html).toContain(SHEET);
    expect(html).toContain("Install SportsHistoryClue");
    expect(html).toContain("To install this app on your iPhone/iPad:");
    expect(html).toContain("1. Tap the Share button in Safari toolbar");
    expect(html).toContain("⎋");
    expect(html).toContain("2. Scroll down and tap &#x27;Add to Home Screen&#x27; (+)");
    expect(html).toContain("✕");
    expect(html).not.toContain("Install App");
  });

  it("offers Install App on Android and explains the browser menu when the prompt is missing", () => {
    const ready = renderToStaticMarkup(
      createElement(InstallAppBannerCard, {
        platform: "android",
        manualHint: false,
        onInstall: () => undefined,
        onDismiss: () => undefined,
      }),
    );
    expect(ready).toContain(">Install App<");
    expect(ready).toContain("bg-blue-600");
    expect(ready).toContain("min-h-[48px]");
    expect(ready).toContain("active:scale-[0.98]");
    expect(ready).toContain("touch-manipulation");
    expect(ready).not.toContain("3 dots menu");

    const blocked = renderToStaticMarkup(
      createElement(InstallAppBannerCard, {
        platform: "android",
        manualHint: true,
        onInstall: () => undefined,
        onDismiss: () => undefined,
      }),
    );
    expect(blocked).toContain(
      "Tap the 3 dots menu in your browser, then tap &#x27;Install app&#x27; or &#x27;Add to Home screen&#x27;",
    );
  });
});
