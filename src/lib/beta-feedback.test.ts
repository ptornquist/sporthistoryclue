import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { prepareBetaFeedback } from "./beta-feedback";

describe("prepareBetaFeedback", () => {
  it("keeps a rated bug report with only the table columns", () => {
    const result = prepareBetaFeedback({
      rating: 2.2,
      category: "Bugg",
      comment: "  Knappen svarar inte.  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.row).toEqual({
        rating: 2,
        category: "Bugg",
        comment: "Knappen svarar inte.",
      });
      expect(Object.keys(result.row).sort()).toEqual(["category", "comment", "rating"]);
    }
  });

  it("inserts the three columns and logs a thrown or returned error", () => {
    const source = readFileSync(resolve("src/components/feedback/BetaFeedbackModal.tsx"), "utf8");
    expect(source).toContain('supabaseClient.from("beta_feedback").insert({');
    expect(source).toContain("rating: prepared.row.rating");
    expect(source).toContain("category: prepared.row.category");
    expect(source).toContain("comment: prepared.row.comment");
    expect(source).toContain("console.error(error)");
    expect(source).toContain("setSuccess(true)");
    expect(source).toContain("Tack för din feedback!");
    expect(source).not.toContain("user_id");
  });

  it("rejects an empty comment and an unknown category", () => {
    expect(prepareBetaFeedback({ rating: 5, category: "Idé", comment: "   " }).ok).toBe(false);
    expect(prepareBetaFeedback({ rating: 5, category: "Annat", comment: "Hej" }).ok).toBe(false);
    expect(prepareBetaFeedback({ rating: 0, category: "Övrigt", comment: "Hej" }).ok).toBe(false);
  });
});
