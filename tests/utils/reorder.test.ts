import { describe, expect, it } from "vitest";
import { moveItem } from "~/utils/reorder";

const letters = ["a", "b", "c", "d"];

describe("moveItem", () => {
  it("should move an item forward and close the gap behind it", () => {
    expect(moveItem(letters, 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("should move an item backward", () => {
    expect(moveItem(letters, 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("should move an item to the end", () => {
    expect(moveItem(letters, 0, 3)).toEqual(["b", "c", "d", "a"]);
  });

  it("should leave the list alone when the item does not move", () => {
    expect(moveItem(letters, 2, 2)).toEqual(letters);
  });

  it("should leave the list alone for a place that is not in it", () => {
    expect(moveItem(letters, 0, 9)).toEqual(letters);
    expect(moveItem(letters, -1, 2)).toEqual(letters);
    expect(moveItem(letters, 1.5, 2)).toEqual(letters);
  });

  it("should never change the list it was given", () => {
    const original = [...letters];
    moveItem(original, 0, 3);

    expect(original).toEqual(letters);
  });

  it("should handle a list of one and a list of none", () => {
    expect(moveItem(["only"], 0, 0)).toEqual(["only"]);
    expect(moveItem([], 0, 0)).toEqual([]);
  });
});
