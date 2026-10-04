import { describe, expect, it } from "vitest";
import { oauthCallbackUrl } from "./oauth-return";

describe("oauthCallbackUrl", () => {
  it("sends Apple and Google sign-in back through the auth callback", () => {
    expect(oauthCallbackUrl("https://sportshistoryclue.com", "/profile")).toBe(
      "https://sportshistoryclue.com/auth/callback?next=%2Fprofile",
    );
  });

  it("drops off-site return paths", () => {
    expect(oauthCallbackUrl("http://127.0.0.1:3000", "https://evil.example")).toBe(
      "http://127.0.0.1:3000/auth/callback",
    );
  });
});
