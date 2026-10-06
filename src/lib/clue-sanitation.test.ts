import { describe, expect, it } from "vitest";
import { sanitizeClues } from "./clue-sanitation";

describe("clue sanitation", () => {
  it("drops plate captions and photo credits, then pads to six clues", () => {
    const clues = sanitizeClues(
      [
        "Plate 01 — crop",
        "A local amateur is entered almost as an afterthought.",
        "Figure 2 — the marble horseshoe",
        "Host city: Athens · Distance: 40 km",
        "A night photograph by the wire service",
        "Plate 01 — pull back",
      ],
      { title: "The Marble Revival", year: 1896 },
    );

    expect(clues).toHaveLength(6);
    expect(clues[0]).toBe("A local amateur is entered almost as an afterthought.");
    expect(clues[1]).toBe("Host city: Athens · Distance: 40 km");
    expect(clues[2]).toBe("Ledtråd 1: En klassisk mästerskapsmatch från den moderna eran.");
    expect(clues[3]).toBe("Ledtråd 2: Hög insats, en full läktare och ett skifte i matchbilden.");
    expect(clues[4]).toBe("Ledtråd 3: The Marble Revival (1896) minns man lika mycket för scenen som för siffrorna.");
    expect(clues.some((clue) => clue.startsWith("Plate ") || clue.includes("photograph by"))).toBe(false);
  });

  it("keeps six readable clues unchanged", () => {
    const original = ["One", "Two", "Three", "Four", "Five", "Six"];
    expect(sanitizeClues(original)).toEqual(original);
  });
});
