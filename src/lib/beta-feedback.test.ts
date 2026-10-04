import { describe, expect, it } from "vitest";
import { prepareBetaFeedback } from "./beta-feedback";

describe("prepareBetaFeedback", () => {
  it("keeps a rated bug report", () => {
    const result = prepareBetaFeedback({
      rating: 2,
      category: "Bugg",
      comment: "  Knappen svarar inte.  ",
      scoutName: "@PuckScout",
      userId: "user-1",
      pagePath: "/",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.row).toMatchObject({
        rating: 2,
        category: "Bugg",
        comment: "Knappen svarar inte.",
        scout_name: "PuckScout",
        user_id: "user-1",
      });
    }
  });

  it("rejects an empty comment and an unknown category", () => {
    expect(prepareBetaFeedback({ rating: 5, category: "Idé", comment: "   " }).ok).toBe(false);
    expect(prepareBetaFeedback({ rating: 5, category: "Annat", comment: "Hej" }).ok).toBe(false);
    expect(prepareBetaFeedback({ rating: 0, category: "Övrigt", comment: "Hej" }).ok).toBe(false);
  });
});
