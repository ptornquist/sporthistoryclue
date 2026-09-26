import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InstallAppBannerCard } from "./InstallAppBanner";

describe("InstallAppBannerCard", () => {
  it("tells iOS visitors how to add the stadium app", () => {
    const html = renderToStaticMarkup(
      createElement(InstallAppBannerCard, {
        platform: "ios",
        canInstall: false,
        onInstall: () => undefined,
        onDismiss: () => undefined,
      }),
    );
    expect(html).toContain("Install Stadium App");
    expect(html).toContain("Tap Share (⎙ / ⎋) then &#x27;Add to Home Screen&#x27; (+).");
    expect(html).toContain("rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg");
    expect(html).toContain('src="/icon-192x192.png"');
    expect(html).toContain("✕");
    expect(html).not.toContain(">Install<");
  });

  it("offers an Install button for Android and Chrome", () => {
    const html = renderToStaticMarkup(
      createElement(InstallAppBannerCard, {
        platform: "android",
        canInstall: true,
        onInstall: () => undefined,
        onDismiss: () => undefined,
      }),
    );
    expect(html).toContain("Install Stadium App");
    expect(html).toContain(">Install<");
    expect(html).toContain("min-h-[48px]");
    expect(html).toContain("active:scale-[0.98]");
    expect(html).toContain("touch-manipulation");
    expect(html).not.toContain("Add to Home Screen");
  });
});
