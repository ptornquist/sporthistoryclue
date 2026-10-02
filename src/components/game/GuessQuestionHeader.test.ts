import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuessQuestionHeader } from "./GuessQuestionHeader";

describe("GuessQuestionHeader", () => {
  it("renders the question directly above the guess grid", () => {
    const html = renderToStaticMarkup(createElement(GuessQuestionHeader));
    expect(html).toContain("flex items-center justify-between px-1 mb-1.5");
    expect(html).toContain("text-xs font-black uppercase tracking-wider text-zinc-500");
    expect(html).toContain("❓ Which historic matchup is this?");
    expect(html).toContain("text-[11px] font-bold text-zinc-400");
    expect(html).toContain("Select 1 of 4");
  });
});