import { describe, expect, it } from "vitest";
import { diffLines, summarise } from "~/utils/text-diff";

const shape = (left: string, right: string) =>
  diffLines(left, right).map((line) => `${line.type[0]}:${line.text}`);

describe("diffLines", () => {
  it("marks every line unchanged when both sides match", () => {
    expect(shape("one\ntwo", "one\ntwo")).toEqual(["u:one", "u:two"]);
  });

  it("finds an inserted line without disturbing the rest", () => {
    expect(shape("one\nthree", "one\ntwo\nthree")).toEqual([
      "u:one",
      "a:two",
      "u:three",
    ]);
  });

  it("finds a removed line", () => {
    expect(shape("one\ntwo\nthree", "one\nthree")).toEqual([
      "u:one",
      "r:two",
      "u:three",
    ]);
  });

  it("reports a changed line as a removal and an addition", () => {
    expect(shape("hello", "goodbye")).toEqual(["r:hello", "a:goodbye"]);
  });

  it("numbers lines per side, skipping the side a line is missing from", () => {
    const lines = diffLines("one\ntwo", "one\ntwo\nthree");

    expect(lines[2]).toEqual({ type: "added", text: "three", right: 3 });
    expect(lines[1]).toEqual({
      type: "unchanged",
      text: "two",
      left: 2,
      right: 2,
    });
  });

  it("handles an empty side", () => {
    expect(shape("", "only")).toEqual(["a:only"]);
    expect(shape("only", "")).toEqual(["r:only"]);
    expect(shape("", "")).toEqual([]);
  });
});

describe("summarise", () => {
  it("counts each kind of line", () => {
    const summary = summarise(diffLines("one\ntwo\nthree", "one\ntwo\nfour"));

    expect(summary).toEqual({ added: 1, removed: 1, unchanged: 2 });
  });
});
