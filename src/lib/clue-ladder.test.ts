import { describe, expect, it } from "vitest";
import { arrangeClueLadder } from "./clue-ladder";

describe("arrangeClueLadder", () => {
  it("keeps names and the scoreboard out of the first two clues", () => {
    const clues = arrangeClueLadder(
      [
        "Herb Brooks sends Mike Eruzione over the boards.",
        "The building is already shaking, and the next minute decides more than the night.",
        "Score: 4–3 · Winner: USA · Opponent: USSR",
        "The rink sits in a mountain village built for these Games.",
        "One side has not lost on home ice in this tournament.",
        "Lake Placid is hosting the Olympic medal round.",
      ],
      { category: "Olympic Medal Round" },
    );

    expect(clues).toHaveLength(6);
    expect(clues[0]).not.toMatch(/Herb|Eruzione|4–3|Winner|Lake Placid/);
    expect(clues[1]).not.toMatch(/Herb|Eruzione|4–3|Winner|Lake Placid/);
    expect(`${clues[2]} ${clues[3]}`).toMatch(/rink|Olympic|tournament|stage|village/i);
    expect(`${clues[4]} ${clues[5]}`).toMatch(/Herb/);
    expect(`${clues[4]} ${clues[5]}`).toMatch(/4–3/);
    expect(arrangeClueLadder(clues, { category: "Olympic Medal Round" })).toEqual(clues);
  });

  it("reads the opening clues as atmosphere when the source leads with the score", () => {
    const clues = arrangeClueLadder(
      [
        "Score: 4–3 · Winner: USA · Opponent: USSR",
        "Herb Brooks sends Mike Eruzione over the boards.",
        "A series billed as an exhibition has come down to a single night.",
        "The building is already shaking, and the next minute decides more than the night.",
        "September 1972. The series that opened a door between two hockey worlds.",
        "The rink is in a capital city.",
      ],
      { category: "Summit Series Decider" },
    );

    expect(clues[0]).toMatch(/exhibition|shaking/);
    expect(clues[1]).toMatch(/exhibition|shaking/);
    expect(clues[0]).not.toMatch(/Herb|4–3|1972/);
    expect(clues[1]).not.toMatch(/Herb|4–3|1972/);
    expect(`${clues[2]} ${clues[3]}`).toMatch(/rink|1972|stage|Summit/i);
    expect(`${clues[4]} ${clues[5]}`).toMatch(/Herb/);
    expect(`${clues[4]} ${clues[5]}`).toMatch(/4–3/);
    expect(arrangeClueLadder(clues, { category: "Summit Series Decider" })).toEqual(clues);
  });

  it("drops numbered padding and keeps venue lines distinct", () => {
    const clues = arrangeClueLadder(
      [
        "Clue #1: An iconic championship fixture held in the modern era.",
        "The younger champion is supposed to be unhittable.",
        "Ali bomaye!",
        "Result: KO, round 8 · Winner: Muhammad Ali · Loser: George Foreman",
        "Zaire. Don King. A right hand that drops the unbeaten champion.",
      ],
      { category: "Heavyweight Title Fight" },
    );

    expect(clues[0]).not.toMatch(/Clue #|Muhammad|KO/);
    expect(clues[1]).not.toMatch(/Clue #|Muhammad|KO/);
    expect(clues[2]).not.toBe(clues[3]);
    expect(`${clues[2]} ${clues[3]}`).toMatch(/stage|arena|heavyweight/i);
    expect(`${clues[4]} ${clues[5]}`).toMatch(/Don King|Muhammad/);
    expect(`${clues[4]} ${clues[5]}`).toMatch(/KO/);
    expect(arrangeClueLadder(clues, { category: "Heavyweight Title Fight" })).toEqual(clues);
  });
});
