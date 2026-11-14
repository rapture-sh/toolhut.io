import { describe, expect, it } from "vitest";
import {
  COMPRESS_LEVELS,
  CompressError,
  compressedName,
  levelFor,
  sizeChange,
} from "~/utils/pdf-compress";

describe("levelFor", () => {
  it("should find every setting it offers", () => {
    for (const level of COMPRESS_LEVELS) {
      expect(levelFor(level.value)).toBe(level);
    }
  });

  it("should refuse a setting that does not exist", () => {
    expect(() => levelFor("tiny")).toThrow(CompressError);
  });

  it("should redraw smaller at a lower quality for a smaller file", () => {
    const small = levelFor("small");
    const sharp = levelFor("sharp");

    expect(small.maxSide).toBeLessThan(sharp.maxSide);
    expect(small.quality).toBeLessThan(sharp.quality);
  });
});

describe("compressedName", () => {
  it("should mark the name without losing the original", () => {
    expect(compressedName("quarterly report.pdf")).toBe(
      "quarterly report-smaller.pdf",
    );
  });

  it("should fall back to a usable name", () => {
    expect(compressedName("  ")).toBe("download-smaller.pdf");
  });
});

describe("sizeChange", () => {
  it("should report how much came off", () => {
    expect(sizeChange(1000, 250)).toEqual({
      percent: 75,
      smaller: true,
      label: "75% smaller",
    });
  });

  it("should say so when the result grew instead", () => {
    const change = sizeChange(1000, 1200);

    expect(change.smaller).toBe(false);
    expect(change.label).toBe("20% bigger");
  });

  it("should call a result of the same size what it is", () => {
    expect(sizeChange(1000, 1000).label).toBe("about the same size");
  });

  it("should refuse a file with no size", () => {
    expect(() => sizeChange(0, 10)).toThrow(CompressError);
    expect(() => sizeChange(Number.NaN, 10)).toThrow(CompressError);
  });
});
