import { describe, expect, it } from "vitest";
import {
  isLikelyScanned,
  joinPages,
  textName,
  wordCount,
} from "~/utils/pdf-to-text";

const pages = ["First page.", "Second page.", "Third page."];

describe("joinPages", () => {
  it("should put an empty line between pages", () => {
    expect(joinPages(pages, { separator: "blank" })).toBe(
      "First page.\n\nSecond page.\n\nThird page.",
    );
  });

  it("should number every page when the pages are marked", () => {
    expect(joinPages(pages, { separator: "marked" })).toBe(
      [
        "--- Page 1 ---\n\nFirst page.",
        "--- Page 2 ---\n\nSecond page.",
        "--- Page 3 ---\n\nThird page.",
      ].join("\n\n"),
    );
  });

  it("should return the page on its own when the document has one page", () => {
    expect(joinPages(["Only this."], { separator: "blank" })).toBe(
      "Only this.",
    );
  });

  it("should return nothing when every page is empty", () => {
    expect(joinPages(["", "   ", "\n"], { separator: "blank" })).toBe("");
  });

  it("should keep the page lines when every page is empty and marked", () => {
    expect(joinPages(["", ""], { separator: "marked" })).toBe(
      "--- Page 1 ---\n\n--- Page 2 ---",
    );
  });

  it("should keep the numbering true when a middle page is empty", () => {
    const joined = joinPages(["Words.", "", "More words."], {
      separator: "marked",
    });

    expect(joined).toContain("--- Page 3 ---\n\nMore words.");
  });

  it("should return nothing when there are no pages", () => {
    expect(joinPages([], { separator: "marked" })).toBe("");
  });

  it("should leave the line breaks inside a page alone", () => {
    expect(joinPages(["One\nTwo  \n"], { separator: "blank" })).toBe(
      "One\nTwo",
    );
  });
});

describe("wordCount", () => {
  it("should count the words across line breaks and runs of spaces", () => {
    expect(wordCount("  one   two\nthree\tfour ")).toBe(4);
  });

  it("should count nothing in text that is only whitespace", () => {
    expect(wordCount(" \n\t ")).toBe(0);
  });

  it("should count nothing in empty text", () => {
    expect(wordCount("")).toBe(0);
  });
});

describe("isLikelyScanned", () => {
  it("should say a document of pages with words is not a scan", () => {
    expect(isLikelyScanned(["a".repeat(400), "b".repeat(400)])).toBe(false);
  });

  it("should say a document of empty pages is a scan", () => {
    expect(isLikelyScanned(["", "", ""])).toBe(true);
  });

  it("should say a document whose pages carry only a number is a scan", () => {
    expect(isLikelyScanned(["1", "2", "3", "4"])).toBe(true);
  });

  it("should not call an empty document a scan", () => {
    expect(isLikelyScanned([])).toBe(false);
  });

  it("should weigh the text against how many pages there are", () => {
    const words = "a".repeat(200);

    expect(isLikelyScanned([words])).toBe(false);
    expect(isLikelyScanned([words, ...Array(40).fill("")])).toBe(true);
  });
});

describe("textName", () => {
  it("should name the download after the PDF", () => {
    expect(textName("report.pdf")).toBe("report.txt");
  });

  it("should keep a name that carries dots", () => {
    expect(textName("2024.q1.report.pdf")).toBe("2024.q1.report.txt");
  });

  it("should fall back to a usable name", () => {
    expect(textName("   ")).toBe("download.txt");
  });
});
