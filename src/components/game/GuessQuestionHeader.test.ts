import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuessQuestionHeader } from "./GuessQuestionHeader";

describe("GuessQuestionHeader", () => {
  it("asks which historic matchup and how many choices", () => {
    const html = renderToStaticMarkup(createElement(GuessQuestionHeader));
    expect(html).toContain("❓ Which historic matchup is this? (Select 1 of 4)");
    expect(html).toContain("uppercase");
  });
});
