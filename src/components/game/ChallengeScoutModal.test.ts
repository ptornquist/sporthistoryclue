import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChallengeScoutModal } from "./ChallengeScoutModal";

describe("ChallengeScoutModal", () => {
  it("offers a copy link and a direct challenge for each scout", () => {
    const html = renderToStaticMarkup(
      createElement(ChallengeScoutModal, {
        fixtureId: "hand-of-god-1986",
        score: 8500,
        source: "following",
        loading: false,
        signedIn: true,
        notice: null,
        onClose: () => undefined,
        onChallenge: () => undefined,
        scouts: [
          { id: "a", username: "ada", career_score: 1200 },
          { id: "b", username: "beau", career_score: 400 },
        ],
      }),
    );
    expect(html).toContain("Kopiera utmaningslänk");
    expect(html).toContain("SMS, WhatsApp");
    expect(html).toContain("Utmana en följare / scout");
    expect(html).toContain("@ada");
    expect(html).toContain("@beau");
    expect(html).toContain("Utmana");
  });
});
