import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProfileAccountBar } from "./ProfileAccountBar";

describe("profile account bar", () => {
  it("offers a photo picker and a logout button", () => {
    const html = renderToStaticMarkup(
      createElement(ProfileAccountBar, {
        changePhotoLabel: "Byt profilbild",
        logoutLabel: "Logga ut",
        busyLabel: "Sparar...",
        uploading: false,
        signingOut: false,
        onChangePhoto: () => {},
        onSignOut: () => {},
      }),
    );
    expect(html).toContain("Byt profilbild");
    expect(html).toContain("Logga ut");
    expect(html).toContain("type=\"button\"");
  });
});
