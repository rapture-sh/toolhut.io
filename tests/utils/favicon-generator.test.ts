import { describe, expect, it } from "vitest";
import {
  FaviconError,
  ICON_SPECS,
  iconFileName,
  isSquareEnough,
  SMALLEST_SOURCE,
  safeAreaArtwork,
  safeAreaInset,
  sourceWarnings,
  specKey,
} from "~/utils/favicon-generator";

describe("iconFileName", () => {
  it("should name the small sizes as favicons", () => {
    expect(iconFileName(32)).toBe("favicon-32x32.png");
  });

  it("should name the big sizes as icons", () => {
    expect(iconFileName(512)).toBe("icon-512x512.png");
  });

  it("should name the 180 pixel icon for Apple", () => {
    expect(iconFileName(180)).toBe("apple-touch-icon.png");
  });

  it("should mark a maskable icon in its name", () => {
    expect(iconFileName(512, true)).toBe("maskable-icon-512x512.png");
  });

  it("should reject a size that is not a whole number of pixels", () => {
    expect(() => iconFileName(16.5)).toThrow(FaviconError);
    expect(() => iconFileName(0)).toThrow(FaviconError);
  });
});

describe("ICON_SPECS", () => {
  it("should give every icon its own file name", () => {
    const names = ICON_SPECS.map(specKey);

    expect(new Set(names).size).toBe(names.length);
  });

  it("should only ask for a background where transparency is not allowed", () => {
    const opaque = ICON_SPECS.filter((spec) => spec.opaque).map(specKey);

    expect(opaque).toEqual([
      "apple-touch-icon.png",
      "maskable-icon-512x512.png",
    ]);
  });
});

describe("safeAreaInset", () => {
  it("should leave the artwork the middle 80 per cent", () => {
    expect(safeAreaInset(512)).toBe(51);
    expect(safeAreaArtwork(512)).toBe(410);
  });

  it("should inset a small icon by whole pixels", () => {
    expect(safeAreaInset(16)).toBe(2);
    expect(safeAreaArtwork(16)).toBe(12);
  });

  it("should keep the artwork inside the icon", () => {
    for (const size of [16, 48, 180, 192, 512]) {
      expect(safeAreaArtwork(size) + safeAreaInset(size) * 2).toBe(size);
    }
  });

  it("should leave at least one pixel of artwork on a tiny icon", () => {
    expect(safeAreaArtwork(1)).toBe(1);
  });

  it("should reject a size that is not a whole number of pixels", () => {
    expect(() => safeAreaInset(-8)).toThrow(FaviconError);
  });
});

describe("isSquareEnough", () => {
  it("should accept a square image", () => {
    expect(isSquareEnough(512, 512)).toBe(true);
  });

  it("should accept an image a pixel or two off square", () => {
    expect(isSquareEnough(512, 507)).toBe(true);
  });

  it("should reject an image past the two per cent threshold", () => {
    expect(isSquareEnough(512, 500)).toBe(false);
    expect(isSquareEnough(1600, 900)).toBe(false);
  });

  it("should reject an image with no size", () => {
    expect(() => isSquareEnough(0, 512)).toThrow(FaviconError);
  });
});

describe("sourceWarnings", () => {
  it("should say nothing about a big square image", () => {
    expect(sourceWarnings(1024, 1024)).toEqual([]);
  });

  it("should warn that a wide image will be stretched", () => {
    const [warning] = sourceWarnings(1600, 900);

    expect(warning).toContain("1600 by 900");
    expect(warning).toContain("not square");
  });

  it("should warn about a source smaller than the biggest icon", () => {
    expect(sourceWarnings(256, 256)).toEqual([
      expect.stringContaining(`smaller than ${SMALLEST_SOURCE} pixels`),
    ]);
  });

  it("should warn twice about a small image that is not square", () => {
    expect(sourceWarnings(300, 100)).toHaveLength(2);
  });
});
