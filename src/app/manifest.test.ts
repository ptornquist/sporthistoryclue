import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("manifest", () => {
  it("describes an installable portrait stadium app", () => {
    const webManifest = manifest();
    expect(webManifest.name).toBe("SportsHistoryClue");
    expect(webManifest.short_name).toBe("SportsClue");
    expect(webManifest.description).toBe("Daily iconic sports deduction trivia game.");
    expect(webManifest.start_url).toBe("/");
    expect(webManifest.display).toBe("standalone");
    expect(webManifest.background_color).toBe("#fafafa");
    expect(webManifest.theme_color).toBe("#2563eb");
    expect(webManifest.orientation).toBe("portrait");
    expect(webManifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icon-192x192.png", sizes: "192x192", type: "image/png" }),
        expect.objectContaining({ src: "/icon-512x512.png", sizes: "512x512", type: "image/png" }),
      ]),
    );
  });
});
