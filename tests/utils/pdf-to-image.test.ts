import { describe, expect, it } from "vitest";
import {
  allPages,
  PAGE_SIZES,
  pageImageName,
  pagesZipName,
} from "~/utils/pdf-to-image";

describe("pageImageName", () => {
  it("should name a page after the document it came from", () => {
    expect(pageImageName("report.pdf", 2, "png")).toBe("report-page-2.png");
  });

  it("should use the extension people expect for JPEG", () => {
    expect(pageImageName("report.pdf", 1, "jpeg")).toBe("report-page-1.jpg");
  });

  it("should fall back to a usable name", () => {
    expect(pageImageName("   ", 3, "png")).toBe("download-page-3.png");
  });
});

describe("pagesZipName", () => {
  it("should take the name of the document", () => {
    expect(pagesZipName("quarterly report.pdf")).toBe("quarterly report.zip");
  });

  it("should fall back when there is no name to take", () => {
    expect(pagesZipName("")).toBe("pages.zip");
  });
});

describe("allPages", () => {
  it("should count from one to the last page", () => {
    expect(allPages(3)).toEqual([1, 2, 3]);
  });

  it("should give nothing for a document with no pages", () => {
    expect(allPages(0)).toEqual([]);
    expect(allPages(-2)).toEqual([]);
  });
});

describe("PAGE_SIZES", () => {
  it("should offer sizes that climb", () => {
    const sides = PAGE_SIZES.map((size) => size.value);

    expect([...sides].sort((a, b) => a - b)).toEqual([...sides]);
  });
});
