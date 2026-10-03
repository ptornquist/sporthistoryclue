import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DisciplinesPage from "./page";

describe("DisciplinesPage", () => {
  it("tints each sport tile and keeps the selected sport readable", () => {
    const html = renderToStaticMarkup(createElement(DisciplinesPage));

    expect(html).toContain("bg-sky-50/80 text-sky-950");
    expect(html).toContain("✓");
    expect(html).toContain("bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:border-emerald-400");
    expect(html).toContain("bg-rose-50/80 border-rose-200 text-rose-950 hover:border-rose-400");
    expect(html).toContain("bg-amber-50/80 border-amber-200 text-amber-950 hover:border-amber-400");
    expect(html).toContain("bg-indigo-50/80 border-indigo-200 text-indigo-950 hover:border-indigo-400");
    expect(html).toContain("ring-2 ring-zinc-900 border-2 border-zinc-900 shadow-md font-black scale-[1.02]");
    expect(html).toContain("border-2 border-zinc-300 bg-white rounded-3xl p-6 shadow-sm");
    expect(html).toContain("Ishockey");
    expect(html).toContain("DEDUCERA →");
    expect(html).toContain("bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white");
    expect(html).not.toContain("bg-blue-600 border-blue-600 text-white");
  });
});
