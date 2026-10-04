import { describe, expect, it } from "vitest";
import { prepareLogin, prepareSignup } from "./auth-account";

describe("prepareSignup", () => {
  it("keeps a trimmed email and scout name", () => {
    const result = prepareSignup({
      email: " Scout@Example.com ",
      username: "@PuckScout",
      password: "hemligt",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.account.email).toBe("scout@example.com");
      expect(result.account.username).toBe("PuckScout");
    }
  });

  it("rejects a missing scout name", () => {
    const result = prepareSignup({ email: "scout@example.com", username: "  ", password: "hemligt" });
    expect(result.ok).toBe(false);
  });
});

describe("prepareLogin", () => {
  it("asks for a password", () => {
    expect(prepareLogin({ email: "scout@example.com", password: "" }).ok).toBe(false);
  });
});
