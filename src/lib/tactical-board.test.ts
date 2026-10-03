import { describe, expect, it } from "vitest";
import {
  STARTING_SCORE,
  applyTileCost,
  buildTacticalBoard,
  formatTileCost,
  safeImageUrl,
} from "./tactical-board";

describe("tactical clue board", () => {
  const legacy = [
    "The rink is loud and the favorite is heavy.",
    "A cold-war winter, amateur against a machine.",
    "A college coach and a line that will not sit down.",
    "A flooded sheet of ice under a low roof.",
    "The captain finishes the night.",
    "The final is 4–3.",
  ];

  it("maps an older clues array onto the five tactical tiles", () => {
    const tiles = buildTacticalBoard(legacy);
    expect(tiles.map((tile) => tile.name)).toEqual([
      "Arena & förutsättningar",
      "Epok & sammanhang",
      "Laguppställning & taktik",
      "Arkivfoto",
      "Klimaxet",
    ]);
    expect(tiles.map((tile) => tile.cost)).toEqual([1000, 1500, 2000, 2500, 3500]);
    expect(tiles[0].text).toBe(legacy[0]);
    expect(tiles[1].text).toBe(legacy[1]);
    expect(tiles[2].text).toBe(legacy[2]);
    expect(tiles[3].text).toBe(legacy[3]);
    expect(tiles[3].image).toBe(true);
    expect(tiles[4].text).toContain(legacy[4]);
    expect(tiles[4].text).toContain(legacy[5]);
    expect(formatTileCost(1500)).toBe("-1,500 PTS");
    expect(formatTileCost(3500)).toBe("-3,500 PTS");
  });

  it("keeps a short dossier on the same five-tile grid", () => {
    const tiles = buildTacticalBoard(["Only the building is described."]);
    expect(tiles).toHaveLength(5);
    expect(tiles[0].text).toBe("Only the building is described.");
    expect(tiles[4].text).toBe("");
    expect(applyTileCost(STARTING_SCORE, 1000)).toBe(9000);
    expect(applyTileCost(2000, 3500)).toBe(0);
  });

  it("accepts only https archive photos", () => {
    expect(safeImageUrl("https://cdn.example.com/archive.jpg")).toBe("https://cdn.example.com/archive.jpg");
    expect(safeImageUrl("http://cdn.example.com/archive.jpg")).toBeNull();
    expect(safeImageUrl("not a url")).toBeNull();
  });
});
