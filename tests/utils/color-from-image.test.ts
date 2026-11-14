import { describe, expect, it } from "vitest";
import type { Pixels } from "~/lib/image/canvas";
import { formatColor } from "~/utils/color";
import {
  extractPalette,
  PaletteError,
  pixelAt,
} from "~/utils/color-from-image";

type Pixel = [number, number, number, number];

const RED: Pixel = [255, 0, 0, 255];
const BLUE: Pixel = [0, 0, 255, 255];
const CLEAR: Pixel = [0, 0, 0, 0];

function image(width: number, height: number, pixels: Pixel[]): Pixels {
  const data = new Uint8ClampedArray(width * height * 4);

  pixels.forEach((pixel, index) => {
    data.set(pixel, index * 4);
  });

  return { data, width, height };
}

function repeat(pixel: Pixel, times: number): Pixel[] {
  return Array.from({ length: times }, () => pixel);
}

function hexes(pixels: Pixels, count: number): string[] {
  return extractPalette(pixels, { count }).map((entry) =>
    formatColor(entry.color, "hex"),
  );
}

function hexAt(pixels: Pixels, x: number, y: number): string | null {
  const color = pixelAt(pixels, x, y);

  return color ? formatColor(color, "hex") : null;
}

describe("extractPalette", () => {
  it("finds the two colours an image is made of", () => {
    const pixels = image(4, 4, [...repeat(RED, 8), ...repeat(BLUE, 8)]);
    const palette = extractPalette(pixels, { count: 2 });

    expect(
      palette.map((entry) => formatColor(entry.color, "hex")).sort(),
    ).toEqual(["#0000ff", "#ff0000"]);
    expect(palette.map((entry) => entry.share)).toEqual([0.5, 0.5]);
  });

  it("puts the most common colour first", () => {
    const pixels = image(4, 4, [...repeat(BLUE, 4), ...repeat(RED, 12)]);
    const palette = extractPalette(pixels, { count: 2 });

    expect(formatColor(palette[0].color, "hex")).toBe("#ff0000");
    expect(palette[0].share).toBe(0.75);
    expect(palette[1].share).toBe(0.25);
  });

  it("leaves fully transparent pixels out of the shares", () => {
    const pixels = image(4, 4, [...repeat(RED, 8), ...repeat(CLEAR, 8)]);
    const palette = extractPalette(pixels, { count: 4 });

    expect(palette).toHaveLength(1);
    expect(formatColor(palette[0].color, "hex")).toBe("#ff0000");
    expect(palette[0].share).toBe(1);
  });

  it("merges colours too close together to tell apart", () => {
    const greys: Pixel[] = [
      ...repeat([128, 128, 128, 255], 8),
      ...repeat([130, 131, 129, 255], 8),
    ];
    const palette = extractPalette(image(4, 4, greys), { count: 4 });

    expect(palette).toHaveLength(1);
    expect(palette[0].share).toBe(1);
  });

  it("keeps colours that are genuinely different apart", () => {
    const pixels = image(4, 4, [
      ...repeat(RED, 4),
      ...repeat(BLUE, 4),
      ...repeat([0, 255, 0, 255], 4),
      ...repeat([255, 255, 255, 255], 4),
    ]);

    expect(hexes(pixels, 6).sort()).toEqual(
      ["#00ff00", "#0000ff", "#ff0000", "#ffffff"].sort(),
    );
  });

  it("never gives back more colours than it was asked for", () => {
    const many: Pixel[] = Array.from({ length: 16 }, (_, index) => [
      index * 16,
      255 - index * 16,
      (index * 48) % 256,
      255,
    ]);
    const palette = extractPalette(image(4, 4, many), { count: 3 });
    const total = palette.reduce((sum, entry) => sum + entry.share, 0);

    expect(palette).toHaveLength(3);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(1);
  });

  it("has nothing to say about an empty or fully transparent image", () => {
    expect(extractPalette(image(0, 0, []))).toEqual([]);
    expect(extractPalette(image(2, 2, repeat(CLEAR, 4)))).toEqual([]);
  });

  it("rejects a palette size it cannot produce", () => {
    const pixels = image(2, 2, repeat(RED, 4));

    expect(() => extractPalette(pixels, { count: 0 })).toThrow(PaletteError);
    expect(() => extractPalette(pixels, { count: 33 })).toThrow(PaletteError);
    expect(() => extractPalette(pixels, { count: 2.5 })).toThrow(PaletteError);
  });

  it("rejects pixel data that does not match its size", () => {
    const broken: Pixels = {
      data: new Uint8ClampedArray(12),
      width: 4,
      height: 4,
    };

    expect(() => extractPalette(broken)).toThrow(PaletteError);
  });
});

describe("pixelAt", () => {
  const pixels = image(2, 2, [RED, BLUE, CLEAR, [10, 20, 30, 128]]);

  it("reads the colour under a point", () => {
    expect(hexAt(pixels, 0, 0)).toBe("#ff0000");
    expect(hexAt(pixels, 1, 0)).toBe("#0000ff");
  });

  it("rounds a fractional point down to the pixel it sits in", () => {
    expect(pixelAt(pixels, 1.9, 0.4)).toEqual(pixelAt(pixels, 1, 0));
  });

  it("reads the last pixel of the image", () => {
    expect(pixelAt(pixels, 1, 1)?.alpha).toBeCloseTo(128 / 255, 5);
  });

  it("reports alpha for a transparent pixel", () => {
    expect(pixelAt(pixels, 0, 1)?.alpha).toBe(0);
  });

  it("gives nothing for a point off the image", () => {
    expect(pixelAt(pixels, -1, 0)).toBeNull();
    expect(pixelAt(pixels, 2, 0)).toBeNull();
    expect(pixelAt(pixels, 0, 2)).toBeNull();
    expect(pixelAt(pixels, Number.NaN, 0)).toBeNull();
  });
});
