import { describe, expect, it } from "vitest";
import {
  CompressionInputError,
  clampQuality,
  compressedName,
  qualityPercent,
  savings,
} from "~/utils/image-compressor";

describe("savings", () => {
  it("reports how much of the original is gone", () => {
    expect(savings(1000, 400)).toEqual({
      percent: 60,
      smaller: true,
      label: "60% smaller",
    });
  });

  it("says so when the result grew instead", () => {
    expect(savings(1000, 1200)).toEqual({
      percent: -20,
      smaller: false,
      label: "20% bigger",
    });
  });

  it("calls a difference under half a percent the same size", () => {
    expect(savings(1000, 998).label).toBe("about the same size");
  });

  it("reports an empty result as entirely saved", () => {
    expect(savings(2048, 0).percent).toBe(100);
  });

  it("rejects an empty original, which has no percentage", () => {
    expect(() => savings(0, 0)).toThrow(CompressionInputError);
  });

  it("rejects sizes that are not numbers", () => {
    expect(() => savings(Number.NaN, 10)).toThrow(CompressionInputError);
    expect(() => savings(10, Number.POSITIVE_INFINITY)).toThrow(
      CompressionInputError,
    );
  });
});

describe("clampQuality", () => {
  it("keeps a quality inside the range a canvas accepts", () => {
    expect(clampQuality(1.4)).toBe(1);
    expect(clampQuality(0)).toBe(0.1);
  });

  it("rounds away floating point dust from a slider", () => {
    expect(clampQuality(0.8200000000000001)).toBe(0.82);
  });

  it("rejects a quality that is not a number", () => {
    expect(() => clampQuality(Number.NaN)).toThrow(CompressionInputError);
  });
});

describe("qualityPercent", () => {
  it("shows a fraction as the whole percentage a slider reads", () => {
    expect(qualityPercent(0.82)).toBe(82);
    expect(qualityPercent(2)).toBe(100);
  });
});

describe("compressedName", () => {
  it("keeps the stem and takes the extension of the new format", () => {
    expect(compressedName("holiday.png", "jpeg")).toBe(
      "holiday-compressed.jpg",
    );
  });

  it("handles a name that carries no extension", () => {
    expect(compressedName("screenshot", "webp")).toBe(
      "screenshot-compressed.webp",
    );
  });

  it("falls back to a usable name when there is none", () => {
    expect(compressedName("   ", "png")).toBe("download-compressed.png");
  });
});
