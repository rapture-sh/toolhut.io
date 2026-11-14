import { describe, expect, it } from "vitest";
import {
  applyRatio,
  CropError,
  clampBox,
  cropName,
  defaultBox,
  moveBox,
  ratioFor,
  resizeBox,
  scaleBox,
} from "~/utils/image-cropper";

const BOUNDS = { width: 800, height: 600 };

describe("clampBox", () => {
  it("leaves a box that already fits", () => {
    expect(clampBox({ x: 10, y: 20, width: 100, height: 50 }, BOUNDS)).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
  });

  it("pulls a box dragged past the bottom right corner back inside", () => {
    expect(
      clampBox({ x: 780, y: 590, width: 100, height: 50 }, BOUNDS),
    ).toEqual({ x: 700, y: 550, width: 100, height: 50 });
  });

  it("pulls a box dragged past the top left corner back inside", () => {
    expect(
      clampBox({ x: -40, y: -10, width: 100, height: 50 }, BOUNDS),
    ).toEqual({ x: 0, y: 0, width: 100, height: 50 });
  });

  it("shrinks a box bigger than the image to the whole image", () => {
    expect(
      clampBox({ x: -50, y: -50, width: 2000, height: 2000 }, BOUNDS),
    ).toEqual({ x: 0, y: 0, width: 800, height: 600 });
  });

  it("keeps a one pixel box at one pixel", () => {
    expect(clampBox({ x: 799, y: 599, width: 1, height: 1 }, BOUNDS)).toEqual({
      x: 799,
      y: 599,
      width: 1,
      height: 1,
    });
  });

  it("rounds a box to whole source pixels", () => {
    expect(
      clampBox({ x: 10.4, y: 10.6, width: 99.5, height: 50.2 }, BOUNDS),
    ).toEqual({ x: 10, y: 11, width: 100, height: 50 });
  });

  it("never returns a box smaller than one pixel", () => {
    expect(clampBox({ x: 5, y: 5, width: 0, height: -3 }, BOUNDS)).toEqual({
      x: 5,
      y: 5,
      width: 1,
      height: 1,
    });
  });

  it("rejects an image with no size", () => {
    expect(() =>
      clampBox({ x: 0, y: 0, width: 10, height: 10 }, { width: 0, height: 10 }),
    ).toThrow(CropError);
  });

  it("rejects a box with a value that is not a number", () => {
    expect(() =>
      clampBox({ x: Number.NaN, y: 0, width: 10, height: 10 }, BOUNDS),
    ).toThrow(CropError);
  });
});

describe("applyRatio", () => {
  it("only clamps a free crop", () => {
    expect(
      applyRatio({ x: 0, y: 0, width: 300, height: 100 }, null, BOUNDS),
    ).toEqual({ x: 0, y: 0, width: 300, height: 100 });
  });

  it("makes a square box from a wide one, around the same middle", () => {
    const box = applyRatio(
      { x: 100, y: 200, width: 300, height: 100 },
      1,
      BOUNDS,
    );

    expect(box).toEqual({ x: 100, y: 100, width: 300, height: 300 });
  });

  it("fits a ratio taller than the image inside it", () => {
    const box = applyRatio({ x: 0, y: 0, width: 700, height: 700 }, 9 / 16, {
      width: 800,
      height: 400,
    });

    expect(box.height).toBe(400);
    expect(box.width).toBe(225);
    expect(box.y).toBe(0);
  });

  it("fits a ratio wider than the image inside it", () => {
    const box = applyRatio({ x: 0, y: 0, width: 400, height: 400 }, 16 / 9, {
      width: 300,
      height: 400,
    });

    expect(box.width).toBe(300);
    expect(box.height).toBe(169);
  });

  it("keeps the box inside the image when the middle is on an edge", () => {
    const box = applyRatio({ x: 790, y: 0, width: 20, height: 20 }, 1, BOUNDS);

    expect(box.x + box.width).toBeLessThanOrEqual(BOUNDS.width);
    expect(box.y + box.height).toBeLessThanOrEqual(BOUNDS.height);
  });

  it("rejects a ratio that is not a positive number", () => {
    expect(() =>
      applyRatio({ x: 0, y: 0, width: 10, height: 10 }, 0, BOUNDS),
    ).toThrow(CropError);
  });
});

describe("scaleBox", () => {
  it("scales display pixels up to source pixels", () => {
    expect(scaleBox({ x: 10, y: 20, width: 100, height: 50 }, 2)).toEqual({
      x: 20,
      y: 40,
      width: 200,
      height: 100,
    });
  });

  it("round-trips a box through a scale and back", () => {
    const box = { x: 40, y: 80, width: 200, height: 160 };

    expect(scaleBox(scaleBox(box, 1 / 4), 4)).toEqual(box);
  });

  it("keeps a tiny box at one pixel rather than nothing", () => {
    expect(scaleBox({ x: 0, y: 0, width: 2, height: 2 }, 0.1)).toEqual({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });
  });

  it("rejects a factor that is not positive", () => {
    expect(() => scaleBox({ x: 0, y: 0, width: 4, height: 4 }, 0)).toThrow(
      CropError,
    );
  });
});

describe("moveBox", () => {
  it("moves the box by the delta", () => {
    expect(
      moveBox({ x: 10, y: 10, width: 100, height: 100 }, 25, -5, BOUNDS),
    ).toEqual({ x: 35, y: 5, width: 100, height: 100 });
  });

  it("stops at the edge instead of leaving the image", () => {
    expect(
      moveBox({ x: 700, y: 10, width: 100, height: 100 }, 400, -400, BOUNDS),
    ).toEqual({ x: 700, y: 0, width: 100, height: 100 });
  });
});

describe("resizeBox", () => {
  const box = { x: 100, y: 100, width: 200, height: 200 };

  it("moves only the edges the handle touches", () => {
    expect(resizeBox(box, "se", 50, 20, BOUNDS)).toEqual({
      x: 100,
      y: 100,
      width: 250,
      height: 220,
    });
  });

  it("keeps the far corner still when dragging the top left", () => {
    expect(resizeBox(box, "nw", -50, -50, BOUNDS)).toEqual({
      x: 50,
      y: 50,
      width: 250,
      height: 250,
    });
  });

  it("changes only the width on a side handle", () => {
    expect(resizeBox(box, "e", -40, 999, BOUNDS)).toEqual({
      x: 100,
      y: 100,
      width: 160,
      height: 200,
    });
  });

  it("clamps a handle dragged outside the image", () => {
    const resized = resizeBox(box, "se", 10_000, 10_000, BOUNDS);

    expect(resized.x + resized.width).toBe(BOUNDS.width);
    expect(resized.y + resized.height).toBe(BOUNDS.height);
  });

  it("never collapses the box past one pixel", () => {
    expect(resizeBox(box, "se", -500, -500, BOUNDS)).toEqual({
      x: 100,
      y: 100,
      width: 1,
      height: 1,
    });
  });

  it("holds a ratio while a corner is dragged", () => {
    const resized = resizeBox(box, "se", 100, 10, BOUNDS, 1);

    expect(resized.width).toBe(resized.height);
    expect(resized.x).toBe(100);
    expect(resized.y).toBe(100);
  });

  it("holds a ratio against the far edge when dragging the top left", () => {
    const resized = resizeBox(box, "nw", -90, -10, BOUNDS, 1);

    expect(resized.width).toBe(resized.height);
    expect(resized.x + resized.width).toBe(300);
    expect(resized.y + resized.height).toBe(300);
  });
});

describe("defaultBox", () => {
  it("covers eight tenths of the image, centred", () => {
    expect(defaultBox(BOUNDS)).toEqual({
      x: 80,
      y: 60,
      width: 640,
      height: 480,
    });
  });

  it("starts on the ratio it is given", () => {
    const box = defaultBox(BOUNDS, 1);

    expect(box.width).toBe(box.height);
  });

  it("rejects an image with no size", () => {
    expect(() => defaultBox({ width: 0, height: 0 })).toThrow(CropError);
  });
});

describe("ratioFor", () => {
  it("has no ratio for a free crop", () => {
    expect(ratioFor("free")).toBeNull();
  });

  it("reads a preset as width over height", () => {
    expect(ratioFor("wide")).toBeCloseTo(16 / 9);
  });
});

describe("cropName", () => {
  it("names the crop after the original and its size", () => {
    expect(
      cropName("holiday.jpg", { x: 0, y: 0, width: 800, height: 600 }),
    ).toBe("holiday-crop-800x600.png");
  });

  it("falls back to a name when the original has none", () => {
    expect(cropName("", { x: 0, y: 0, width: 10, height: 10 })).toBe(
      "download-crop-10x10.png",
    );
  });
});
