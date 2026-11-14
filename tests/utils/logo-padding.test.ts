import { describe, expect, it } from "vitest";
import {
  edgeColor,
  LogoPaddingError,
  MIN_SIZE_PERCENT,
  paddedName,
  placeLogo,
  squareFor,
} from "~/utils/logo-padding";

const logo = { width: 100, height: 50 };
const canvas = { width: 200, height: 200 };
const filling = {
  paddingPercent: 0,
  anchor: "center" as const,
  sizePercent: 100,
};

describe("placeLogo", () => {
  it("should fill the space inside the padding at full size", () => {
    expect(placeLogo(logo, canvas, { ...filling, paddingPercent: 10 })).toEqual(
      {
        x: 20,
        y: 60,
        width: 160,
        height: 80,
      },
    );
  });

  it("should keep the proportions of the logo", () => {
    const box = placeLogo({ width: 300, height: 100 }, canvas, filling);

    expect(box).toEqual({ x: 0, y: 67, width: 200, height: 67 });
  });

  it("should shrink the logo without moving its centre", () => {
    expect(placeLogo(logo, canvas, { ...filling, sizePercent: 50 })).toEqual({
      x: 50,
      y: 75,
      width: 100,
      height: 50,
    });
  });

  it("should put a smaller logo in the corner the anchor names", () => {
    const box = placeLogo(logo, canvas, {
      paddingPercent: 10,
      anchor: "top-left",
      sizePercent: 50,
    });

    expect(box).toEqual({ x: 20, y: 20, width: 80, height: 40 });
  });

  it("should measure the far corner from the far padding", () => {
    const box = placeLogo(logo, canvas, {
      paddingPercent: 10,
      anchor: "bottom-right",
      sizePercent: 50,
    });

    expect(box.x + box.width).toBe(180);
    expect(box.y + box.height).toBe(180);
  });

  it("should have nowhere to move a full size logo that matches the canvas shape", () => {
    const square = { width: 100, height: 100 };
    const corner = placeLogo(square, canvas, {
      ...filling,
      anchor: "top-left",
    });

    expect(corner).toEqual(placeLogo(square, canvas, filling));
  });

  it("should refuse padding that leaves no room", () => {
    expect(() =>
      placeLogo(
        logo,
        { width: 2, height: 2 },
        { ...filling, paddingPercent: 45 },
      ),
    ).toThrow(LogoPaddingError);
  });

  it("should refuse a padding percentage outside the range", () => {
    expect(() =>
      placeLogo(logo, canvas, { ...filling, paddingPercent: 60 }),
    ).toThrow(LogoPaddingError);
  });

  it("should refuse a logo size outside the range", () => {
    expect(() =>
      placeLogo(logo, canvas, {
        ...filling,
        sizePercent: MIN_SIZE_PERCENT - 1,
      }),
    ).toThrow(LogoPaddingError);
    expect(() =>
      placeLogo(logo, canvas, { ...filling, sizePercent: 101 }),
    ).toThrow(LogoPaddingError);
  });

  it("should refuse a canvas with no size", () => {
    expect(() => placeLogo(logo, { width: 0, height: 200 }, filling)).toThrow(
      LogoPaddingError,
    );
  });

  it("should never place a logo smaller than a pixel", () => {
    const box = placeLogo(
      { width: 1000, height: 1 },
      { width: 10, height: 10 },
      filling,
    );

    expect(box.height).toBe(1);
  });
});

describe("squareFor", () => {
  it("should take the longer side of the logo", () => {
    expect(squareFor(logo)).toBe(100);
  });
});

describe("paddedName", () => {
  it("should record the canvas size and the format", () => {
    expect(paddedName("mark.svg", { width: 1024, height: 1024 }, "png")).toBe(
      "mark-1024x1024.png",
    );
  });
});

describe("edgeColor", () => {
  const image = (fill: [number, number, number, number], size = 4) => {
    const data = new Uint8ClampedArray(size * size * 4);
    for (let index = 0; index < data.length; index += 4) {
      data[index] = fill[0];
      data[index + 1] = fill[1];
      data[index + 2] = fill[2];
      data[index + 3] = fill[3];
    }
    return { data, width: size, height: size };
  };

  it("should read the colour the logo was exported on", () => {
    expect(edgeColor(image([18, 52, 86, 255]))).toBe("#123456");
  });

  it("should ignore a transparent edge so transparency is kept", () => {
    expect(edgeColor(image([255, 255, 255, 0]))).toBeNull();
  });

  it("should take the edge colour, not a colour only in the middle", () => {
    const picture = image([255, 255, 255, 255]);
    const middle = (1 * picture.width + 1) * 4;
    picture.data[middle] = 0;
    picture.data[middle + 1] = 0;
    picture.data[middle + 2] = 0;

    expect(edgeColor(picture)).toBe("#ffffff");
  });
});
