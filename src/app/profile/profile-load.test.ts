import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProfileRecovery } from "@/components/profile/ProfileRecovery";
import ProfilePage from "./page";
import ProfileError from "./error";

describe("profile load", () => {
  it("renders language, country, and club when the profile row cannot be shown", () => {
    const html = renderToStaticMarkup(createElement(ProfileRecovery));
    expect(html).toContain("Primärt språk");
    expect(html).toContain("Favoritklubb");
    expect(html.toLowerCase()).not.toContain("profilen kunde inte laddas");
  });

  it("keeps the profile page on a working scout card", () => {
    const html = renderToStaticMarkup(createElement(ProfilePage));
    expect(html).toContain("Primärt språk");
    expect(html.toLowerCase()).not.toContain("profilen kunde inte laddas");
  });

  it("does not use the failure heading in the route error boundary", () => {
    const html = renderToStaticMarkup(
      createElement(ProfileError, { error: new Error("missing row"), reset: () => {} }),
    );
    expect(html).toContain("Försök igen");
    expect(html.toLowerCase()).not.toContain("profilen kunde inte laddas");
  });
});
