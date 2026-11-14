import { describe, expect, it } from "vitest";
import {
  fitToHeight,
  fitToWidth,
  MAX_SIDE,
  pixelChange,
  ResizeError,
  resizedName,
  resolveSize,
  scaleBy,
} from "~/utils/image-resizer";

const photo = { width: 1920, height: 1080 };

describe("fitToWidth", () => {
  it("keeps the proportions of the original", () => {
    expect(fitToWidth(photo, 640)).toEqual({ width: 640, height: 360 });
  });

  it("never rounds a side away to nothing", () => {
    expect(fitToWidth({ width: 1000, height: 3 }, 10)).toEqual({
      width: 10,
      height: 1,
    });
  });
});

describe("fitToHeight", () => {
  it("keeps the proportions of the original", () => {
    expect(fitToHeight(photo, 540)).toEqual({ width: 960, height: 540 });
  });
});

describe("scaleBy", () => {
  it("halves both sides at 50 percent", () => {
    expect(scaleBy(photo, 50)).toEqual({ width: 960, height: 540 });
  });

  it("enlarges above 100 percent", () => {
    expect(scaleBy({ width: 100, height: 50 }, 250)).toEqual({
      width: 250,
      height: 125,
    });
  });
});

describe("resolveSize", () => {
  const request = {
    mode: "pixels" as const,
    width: 0,
    height: 0,
    lock: true,
    percent: 100,
  };

  it("derives the height from the width while locked", () => {
    expect(resolveSize(photo, { ...request, width: 800 })).toEqual({
      width: 800,
      height: 450,
    });
  });

  it("derives the width from the height while locked", () => {
    expect(resolveSize(photo, { ...request, height: 270 })).toEqual({
      width: 480,
      height: 270,
    });
  });

  it("takes both sides literally once unlocked", () => {
    expect(
      resolveSize(photo, { ...request, width: 300, height: 300, lock: false }),
    ).toEqual({ width: 300, height: 300 });
  });

  it("falls back to the original side that was left empty", () => {
    expect(
      resolveSize(photo, { ...request, width: 300, height: 0, lock: false }),
    ).toEqual({ width: 300, height: 1080 });
  });

  it("asks for a side when neither was given", () => {
    expect(() => resolveSize(photo, request)).toThrow(ResizeError);
  });

  it("rejects a percentage of zero or less", () => {
    expect(() =>
      resolveSize(photo, { ...request, mode: "percent", percent: 0 }),
    ).toThrow(ResizeError);
  });

  it("rejects a size no browser can draw", () => {
    expect(() =>
      resolveSize(photo, { ...request, width: MAX_SIDE + 1 }),
    ).toThrow(ResizeError);
  });

  it("rejects an image with no size", () => {
    expect(() =>
      resolveSize({ width: 0, height: 0 }, { ...request, width: 100 }),
    ).toThrow(ResizeError);
  });
});

describe("resizedName", () => {
  it("records the new size and format in the name", () => {
    expect(
      resizedName("holiday.JPG", { width: 640, height: 360 }, "webp"),
    ).toBe("holiday-640x360.webp");
  });

  it("falls back to a name when the original had none", () => {
    expect(resizedName("", { width: 10, height: 10 }, "png")).toBe(
      "download-10x10.png",
    );
  });
});

describe("pixelChange", () => {
  it("reports a quarter of the pixels as a 75 percent drop", () => {
    expect(pixelChange(photo, { width: 960, height: 540 })).toBe(-75);
  });

  it("reports growth as a positive number", () => {
    expect(
      pixelChange({ width: 10, height: 10 }, { width: 20, height: 20 }),
    ).toBe(300);
  });
});
