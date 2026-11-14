import { describe, expect, it } from "vitest";
import {
  formatPageRange,
  PageRangeError,
  parsePageRange,
} from "~/utils/page-range";

describe("parsePageRange", () => {
  it("should give every page when nothing was typed", () => {
    expect(parsePageRange("", 4)).toEqual([1, 2, 3, 4]);
    expect(parsePageRange("   ", 2)).toEqual([1, 2]);
  });

  it("should read a single page", () => {
    expect(parsePageRange("3", 10)).toEqual([3]);
  });

  it("should read a range and the pages between", () => {
    expect(parsePageRange("2-5", 10)).toEqual([2, 3, 4, 5]);
  });

  it("should read a list of pages and ranges together", () => {
    expect(parsePageRange("1-3, 7, 9-10", 10)).toEqual([1, 2, 3, 7, 9, 10]);
  });

  it("should read an open range as running to the end", () => {
    expect(parsePageRange("8-", 10)).toEqual([8, 9, 10]);
  });

  it("should read a range with no start as beginning at one", () => {
    expect(parsePageRange("-3", 10)).toEqual([1, 2, 3]);
  });

  it("should keep the order that was typed", () => {
    expect(parsePageRange("3,1", 5)).toEqual([3, 1]);
  });

  it("should give a page twice when it was asked for twice", () => {
    expect(parsePageRange("2,2", 5)).toEqual([2, 2]);
  });

  it("should ignore the spaces around the pieces", () => {
    expect(parsePageRange("  1 - 2 ,  4 ", 5)).toEqual([1, 2, 4]);
  });

  it("should refuse a page the document does not have", () => {
    expect(() => parsePageRange("11", 10)).toThrow(PageRangeError);
    expect(() => parsePageRange("1-11", 10)).toThrow(/no page 11/);
  });

  it("should refuse a range that counts backwards", () => {
    expect(() => parsePageRange("5-2", 10)).toThrow(/backwards/);
  });

  it("should refuse something that is not a page at all", () => {
    expect(() => parsePageRange("first", 10)).toThrow(PageRangeError);
    expect(() => parsePageRange("2..4", 10)).toThrow(PageRangeError);
  });

  it("should refuse a selection that names no page", () => {
    expect(() => parsePageRange(",,", 10)).toThrow(/at least one page/);
  });

  it("should refuse a document with no pages", () => {
    expect(() => parsePageRange("1", 0)).toThrow(/no pages/);
  });
});

describe("formatPageRange", () => {
  it("should join pages that run together", () => {
    expect(formatPageRange([1, 2, 3, 7])).toBe("1-3, 7");
  });

  it("should sort and drop repeats", () => {
    expect(formatPageRange([4, 2, 2, 3])).toBe("2-4");
  });

  it("should write a lone page on its own", () => {
    expect(formatPageRange([5])).toBe("5");
  });

  it("should write nothing for no pages", () => {
    expect(formatPageRange([])).toBe("");
  });

  it("should round-trip what parsePageRange reads", () => {
    expect(formatPageRange(parsePageRange("1-3, 7, 9-10", 12))).toBe(
      "1-3, 7, 9-10",
    );
  });
});
