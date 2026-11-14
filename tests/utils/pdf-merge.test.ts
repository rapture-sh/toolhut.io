import { describe, expect, it } from "vitest";
import {
  MergeError,
  mergedName,
  mergePicks,
  totalPages,
} from "~/utils/pdf-merge";

describe("mergedName", () => {
  it("should name the result after the first file", () => {
    expect(mergedName(["report.pdf", "appendix.pdf"])).toBe(
      "report-merged.pdf",
    );
  });

  it("should still name a single file the same way", () => {
    expect(mergedName(["report.pdf"])).toBe("report-merged.pdf");
  });

  it("should fall back to a plain name when there are no files", () => {
    expect(mergedName([])).toBe("merged.pdf");
  });

  it("should skip a blank name and use the first real one", () => {
    expect(mergedName(["  ", "notes.pdf"])).toBe("notes-merged.pdf");
  });
});

describe("totalPages", () => {
  it("should add the page counts together", () => {
    expect(totalPages([3, 1, 8])).toBe(12);
  });

  it("should count nothing when no file is loaded", () => {
    expect(totalPages([])).toBe(0);
  });
});

describe("mergePicks", () => {
  it("should take every page of every file in the order the files are in", () => {
    expect(mergePicks([2, 1])).toEqual([
      { source: 0, page: 1 },
      { source: 0, page: 2 },
      { source: 1, page: 1 },
    ]);
  });

  it("should reject a single file, since there is nothing to join it to", () => {
    expect(() => mergePicks([4])).toThrow(MergeError);
  });

  it("should reject files that hold no pages between them", () => {
    expect(() => mergePicks([0, 0])).toThrow(MergeError);
  });
});
