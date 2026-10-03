import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuessQuestionHeader } from "./GuessQuestionHeader";

describe("GuessQuestionHeader", () => {
  it("asks which historic matchup and how many choices", () => {
    const html = renderToStaticMarkup(createElement(GuessQuestionHeader));
    expect(html).toContain("❓ Vilken klassiker är det här? (Välj 1 av 4)");
    expect(html).toContain("uppercase");
  });
});
