import { describe, expect, it } from "vitest";
import {
  looksLikeSvg,
  SvgError,
  savings,
  svgByteSize,
  svgDimensions,
} from "~/utils/svg-optimizer";

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16"></svg>';

describe("svgByteSize", () => {
  it("counts UTF-8 bytes rather than characters", () => {
    expect(svgByteSize("<svg>é</svg>")).toBe(13);
  });

  it("counts nothing for empty markup", () => {
    expect(svgByteSize("")).toBe(0);
  });
});

describe("savings", () => {
  it("reports the bytes and the share removed", () => {
    expect(savings(1000, 400)).toEqual({ bytes: 600, percent: 60 });
  });

  it("rounds the share to one decimal place", () => {
    expect(savings(3000, 1234)).toEqual({ bytes: 1766, percent: 58.9 });
  });

  it("reports nothing saved when nothing changed", () => {
    expect(savings(512, 512)).toEqual({ bytes: 0, percent: 0 });
  });

  it("reports a negative saving when the result grew", () => {
    expect(savings(100, 150)).toEqual({ bytes: -50, percent: -50 });
  });

  it("reports nothing for an empty original", () => {
    expect(savings(0, 0)).toEqual({ bytes: 0, percent: 0 });
  });

  it("rejects a negative byte count", () => {
    expect(() => savings(-1, 10)).toThrow(SvgError);
  });
});

describe("looksLikeSvg", () => {
  it("finds an svg element", () => {
    expect(looksLikeSvg(SVG)).toBe(true);
  });

  it("finds an svg element after an XML declaration", () => {
    expect(looksLikeSvg(`<?xml version="1.0"?>\n${SVG}`)).toBe(true);
  });

  it("does not take a word for an element", () => {
    expect(looksLikeSvg("this is an svg file, honestly")).toBe(false);
  });

  it("does not take empty text", () => {
    expect(looksLikeSvg("")).toBe(false);
  });
});

describe("svgDimensions", () => {
  it("reads the width and height attributes", () => {
    expect(svgDimensions('<svg width="48" height="24"></svg>')).toEqual({
      width: 48,
      height: 24,
      fromViewBox: false,
    });
  });

  it("reads a width given in pixels", () => {
    expect(svgDimensions('<svg width="48px" height="24px"></svg>')).toEqual({
      width: 48,
      height: 24,
      fromViewBox: false,
    });
  });

  it("falls back to the viewBox when there are no attributes", () => {
    expect(svgDimensions(SVG)).toEqual({
      width: 24,
      height: 16,
      fromViewBox: true,
    });
  });

  it("falls back to the viewBox when the size is a percentage", () => {
    expect(
      svgDimensions(
        '<svg width="100%" height="100%" viewBox="0 0 32 32"></svg>',
      ),
    ).toEqual({ width: 32, height: 32, fromViewBox: true });
  });

  it("reads a viewBox separated by commas", () => {
    expect(svgDimensions('<svg viewBox="0,0,10,20"></svg>').height).toBe(20);
  });

  it("has no size when the markup gives none", () => {
    expect(svgDimensions("<svg></svg>")).toEqual({
      width: null,
      height: null,
      fromViewBox: false,
    });
  });

  it("ignores a width on a child element", () => {
    expect(
      svgDimensions('<svg viewBox="0 0 8 8"><rect width="4" /></svg>').width,
    ).toBe(8);
  });

  it("rejects markup with no svg element", () => {
    expect(() => svgDimensions("<div></div>")).toThrow(SvgError);
  });

  it("rejects empty markup", () => {
    expect(() => svgDimensions("")).toThrow(SvgError);
  });
});
