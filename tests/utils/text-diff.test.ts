import { describe, expect, it } from "vitest";
import { diffLines, diffWords, summarise, toRows } from "~/utils/text-diff";

const shape = (left: string, right: string) =>
  diffLines(left, right).map((line) => `${line.type[0]}:${line.text}`);

describe("diffLines", () => {
  it("should mark every line unchanged when both sides match", () => {
    expect(shape("one\ntwo", "one\ntwo")).toEqual(["u:one", "u:two"]);
  });

  it("should find an inserted line without disturbing the rest", () => {
    expect(shape("one\nthree", "one\ntwo\nthree")).toEqual([
      "u:one",
      "a:two",
      "u:three",
    ]);
  });

  it("should find a removed line", () => {
    expect(shape("one\ntwo\nthree", "one\nthree")).toEqual([
      "u:one",
      "r:two",
      "u:three",
    ]);
  });

  it("should report a changed line as a removal and an addition", () => {
    expect(shape("hello", "goodbye")).toEqual(["r:hello", "a:goodbye"]);
  });

  it("should number lines per side, skipping the side a line is missing from", () => {
    const lines = diffLines("one\ntwo", "one\ntwo\nthree");

    expect(lines[2]).toEqual({ type: "added", text: "three", right: 3 });
    expect(lines[1]).toEqual({
      type: "unchanged",
      text: "two",
      left: 2,
      right: 2,
    });
  });

  it("should handle an empty side", () => {
    expect(shape("", "only")).toEqual(["a:only"]);
    expect(shape("only", "")).toEqual(["r:only"]);
    expect(shape("", "")).toEqual([]);
  });
});

describe("summarise", () => {
  it("should count each kind of line", () => {
    const summary = summarise(diffLines("one\ntwo\nthree", "one\ntwo\nfour"));

    expect(summary).toEqual({ added: 1, removed: 1, unchanged: 2 });
  });
});

describe("diffWords", () => {
  it("should mark only the words that changed", () => {
    expect(diffWords("the quick brown fox", "the slow brown fox")).toEqual([
      { type: "unchanged", text: "the " },
      { type: "removed", text: "quick" },
      { type: "added", text: "slow" },
      { type: "unchanged", text: " brown fox" },
    ]);
  });

  it("should keep the whitespace, so the line can be rebuilt from the parts", () => {
    const left = "one  two\tthree";
    const parts = diffWords(left, left);

    expect(parts.map((part) => part.text).join("")).toBe(left);
  });

  it("should report an addition at the end without touching the rest", () => {
    expect(diffWords("hello", "hello there")).toEqual([
      { type: "unchanged", text: "hello" },
      { type: "added", text: " there" },
    ]);
  });

  it("should return nothing for two empty lines", () => {
    expect(diffWords("", "")).toEqual([]);
  });
});

describe("toRows", () => {
  it("should pair a removal with the addition that replaced it", () => {
    const rows = toRows(diffLines("one\ntwo", "one\ntwo changed"));

    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({ type: "changed", left: 2, right: 2 });
    expect(rows[1].parts).toEqual([
      { type: "unchanged", text: "two" },
      { type: "added", text: " changed" },
    ]);
  });

  it("should leave a pure addition and a pure removal alone", () => {
    const added = toRows(diffLines("one", "one\ntwo"));
    const removed = toRows(diffLines("one\ntwo", "one"));

    expect(added.map((row) => row.type)).toEqual(["unchanged", "added"]);
    expect(removed.map((row) => row.type)).toEqual(["unchanged", "removed"]);
  });

  it("should pair what it can and list the rest", () => {
    const rows = toRows(diffLines("a\nb\nc", "x"));

    expect(rows.map((row) => row.type)).toEqual([
      "changed",
      "removed",
      "removed",
    ]);
  });

  it("should keep line numbers from both sides on an edited line", () => {
    const rows = toRows(diffLines("one\ntwo\nthree", "one\nTWO\nthree"));

    expect(rows[1]).toMatchObject({ type: "changed", left: 2, right: 2 });
    expect(rows[2]).toMatchObject({ type: "unchanged", left: 3, right: 3 });
  });
});
