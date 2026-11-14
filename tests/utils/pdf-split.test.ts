import { describe, expect, it } from "vitest";
import { splitName, splitPieces, splitZipName } from "~/utils/pdf-split";

describe("splitName", () => {
  it("should name a range after the pages it holds", () => {
    expect(splitName("report.pdf", "1-3")).toBe("report-pages-1-3.pdf");
  });

  it("should say page rather than pages for a single page", () => {
    expect(splitName("report.pdf", "7")).toBe("report-page-7.pdf");
  });

  it("should turn a comma into an underscore so the name stays usable", () => {
    expect(splitName("report.pdf", "1-3, 7")).toBe("report-pages-1-3_7.pdf");
  });

  it("should fall back to a usable name when there is nothing to work from", () => {
    expect(splitName("  ", "")).toBe("download-pages.pdf");
  });
});

describe("splitZipName", () => {
  it("should name the zip after the original file", () => {
    expect(splitZipName("report.pdf")).toBe("report-pages.zip");
  });

  it("should fall back to a plain name for a nameless file", () => {
    expect(splitZipName("   ")).toBe("pages.zip");
  });
});

describe("splitPieces", () => {
  it("should keep the chosen pages in one file in the order asked for", () => {
    expect(splitPieces([3, 1, 2], "one")).toEqual([
      { label: "1-3", pages: [3, 1, 2] },
    ]);
  });

  it("should give every page a file of its own", () => {
    expect(splitPieces([2, 5], "each")).toEqual([
      { label: "2", pages: [2] },
      { label: "5", pages: [5] },
    ]);
  });

  it("should write one file for a page named twice", () => {
    expect(splitPieces([4, 4], "each")).toEqual([{ label: "4", pages: [4] }]);
  });

  it("should write a single piece for a single page", () => {
    expect(splitPieces([6], "one")).toEqual([{ label: "6", pages: [6] }]);
  });

  it("should write nothing when no page is chosen", () => {
    expect(splitPieces([], "one")).toEqual([]);
    expect(splitPieces([], "each")).toEqual([]);
  });
});
