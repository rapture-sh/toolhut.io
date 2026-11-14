import { describe, expect, it } from "vitest";
import {
  ImagesToPdfError,
  pageBox,
  pdfName,
  planPages,
} from "~/utils/images-to-pdf";

const portrait = { width: 1000, height: 2000 };
const square = { width: 2000, height: 2000 };

describe("pageBox", () => {
  it("should centre a portrait image on a landscape page", () => {
    expect(pageBox(portrait, "a4", "landscape", 0)).toEqual({
      page: { width: 842, height: 595 },
      image: { x: 272, y: 0, width: 298, height: 595 },
    });
  });

  it("should centre a square image on A4 inside the margin", () => {
    expect(pageBox(square, "a4", "portrait", 10)).toEqual({
      page: { width: 595, height: 842 },
      image: { x: 60, y: 184, width: 475, height: 475 },
    });
  });

  it("should fill the page edge to edge when the margin is zero", () => {
    expect(pageBox(square, "a4", "portrait", 0)).toEqual({
      page: { width: 595, height: 842 },
      image: { x: 0, y: 124, width: 595, height: 595 },
    });
  });

  it("should keep the proportions of the image", () => {
    const { image } = pageBox(
      { width: 1224, height: 1584 },
      "letter",
      "portrait",
      0,
    );

    expect(image).toEqual({ x: 0, y: 0, width: 612, height: 792 });
  });

  it("should leave an image smaller than the page at its own pixel size", () => {
    expect(pageBox({ width: 100, height: 50 }, "a4", "portrait", 0)).toEqual({
      page: { width: 595, height: 842 },
      image: { x: 248, y: 396, width: 100, height: 50 },
    });
  });

  it("should give the page the shape of the image when the size is fit", () => {
    expect(pageBox({ width: 800, height: 600 }, "fit", "portrait", 0)).toEqual({
      page: { width: 800, height: 600 },
      image: { x: 0, y: 0, width: 800, height: 600 },
    });
  });

  it("should grow a fitted page around the margin rather than shrink the image", () => {
    expect(pageBox({ width: 800, height: 600 }, "fit", "portrait", 10)).toEqual(
      {
        page: { width: 920, height: 720 },
        image: { x: 60, y: 60, width: 800, height: 600 },
      },
    );
  });

  it("should ignore the orientation when the size is fit", () => {
    expect(pageBox(portrait, "fit", "landscape", 5)).toEqual(
      pageBox(portrait, "fit", "portrait", 5),
    );
  });

  it("should reject a margin that leaves no room for the image", () => {
    expect(() => pageBox(portrait, "a4", "portrait", 50)).toThrow(
      ImagesToPdfError,
    );
  });

  it("should reject a margin below zero", () => {
    expect(() => pageBox(portrait, "a4", "portrait", -1)).toThrow(
      ImagesToPdfError,
    );
  });

  it("should reject an image with no size", () => {
    expect(() => pageBox({ width: 0, height: 0 }, "a4", "portrait", 0)).toThrow(
      ImagesToPdfError,
    );
  });
});

describe("planPages", () => {
  it("should lay out every image in the order given", () => {
    const pages = planPages(
      [
        { width: 100, height: 50 },
        { width: 50, height: 100 },
      ],
      {
        size: "fit",
        orientation: "portrait",
        marginPercent: 0,
      },
    );

    expect(pages.map((layout) => layout.page)).toEqual([
      { width: 100, height: 50 },
      { width: 50, height: 100 },
    ]);
  });

  it("should reject an empty pile of images", () => {
    expect(() =>
      planPages([], { size: "a4", orientation: "portrait", marginPercent: 5 }),
    ).toThrow(ImagesToPdfError);
  });
});

describe("pdfName", () => {
  it("should keep the name of a single image", () => {
    expect(pdfName("holiday.jpg", 1)).toBe("holiday.pdf");
  });

  it("should count the images that joined the first one", () => {
    expect(pdfName("holiday.jpg", 5)).toBe("holiday-and-4-more.pdf");
  });

  it("should fall back to a plain name when the image has none", () => {
    expect(pdfName("  ", 1)).toBe("download.pdf");
  });

  it("should reject a count of no images", () => {
    expect(() => pdfName("holiday.jpg", 0)).toThrow(ImagesToPdfError);
  });
});
