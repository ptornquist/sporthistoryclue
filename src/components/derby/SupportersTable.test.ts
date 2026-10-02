import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SupportersTable } from "./SupportersTable";
import { rankClubs } from "@/lib/premier-league";

describe("SupportersTable", () => {
  it("renders twenty clubs and highlights the pledged row", () => {
    const rows = rankClubs(
      [
        { favorite_club: "arsenal", total_score: 4000 },
        { favorite_club: "liverpool", total_score: 9000 },
      ],
      "total",
    );
    const html = renderToStaticMarkup(
      createElement(SupportersTable, { rows, highlightId: "arsenal" }),
    );
    expect(html).toContain("Arsenal FC");
    expect(html).toContain("Liverpool");
    expect(html).toContain("Coventry City");
    expect(html).toContain("Hull City");
    expect(html).toContain("👥 1");
    expect(html).toContain("9,000");
    expect(html).toContain("border-2 border-blue-600 bg-blue-50/80");
    for (let rank = 1; rank <= 20; rank += 1) {
      expect(html).toContain(`>#${rank}<`);
    }
    expect(html).not.toContain("West Ham");
    expect(html).not.toContain("Wolverhampton");
  });
});
