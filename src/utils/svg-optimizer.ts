/** Thrown when text handed to an SVG tool is not SVG markup. */
export class SvgError extends Error {
  constructor(message = "That does not look like SVG markup.") {
    super(message);
    this.name = "SvgError";
  }
}

const SVG_TAG = /<svg[\s>]/i;
const WIDTH = /<svg\b[^>]*?\bwidth\s*=\s*["']([^"']+)["']/i;
const HEIGHT = /<svg\b[^>]*?\bheight\s*=\s*["']([^"']+)["']/i;
const VIEW_BOX = /<svg\b[^>]*?\bviewBox\s*=\s*["']([^"']+)["']/i;

/** UTF-8 bytes, which is what a file on disk or a response actually costs. */
export function svgByteSize(markup: string): number {
  return new TextEncoder().encode(markup).length;
}

export interface Savings {
  /** Bytes removed. Negative when the result came out bigger. */
  bytes: number;
  /** Share of the original removed, rounded to one decimal place. */
  percent: number;
}

export function savings(before: number, after: number): Savings {
  if (
    !Number.isFinite(before) ||
    !Number.isFinite(after) ||
    before < 0 ||
    after < 0
  ) {
    throw new SvgError("A size has to be a byte count that is not negative.");
  }

  if (before === 0) {
    return { bytes: 0, percent: 0 };
  }

  const bytes = before - after;

  return { bytes, percent: Number(((bytes / before) * 100).toFixed(1)) };
}

export function looksLikeSvg(markup: string): boolean {
  return SVG_TAG.test(markup);
}

export interface SvgDimensions {
  /** `null` when the markup gives no pixel size, such as a width of `100%`. */
  width: number | null;
  height: number | null;
  /** True when the numbers came from the viewBox rather than the attributes. */
  fromViewBox: boolean;
}

function toPixels(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }

  const match = /^\s*(-?[\d.]+)\s*(px)?\s*$/i.exec(value);
  if (!match) {
    return null;
  }

  const size = Number(match[1]);

  return Number.isFinite(size) && size > 0 ? size : null;
}

function viewBoxSize(markup: string): { width: number; height: number } | null {
  const match = VIEW_BOX.exec(markup);
  if (!match) {
    return null;
  }

  const parts = match[1]
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [, , width, height] = parts;

  return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * The size the markup claims, from the width and height attributes when they
 * are pixel values, and from the viewBox when they are not.
 *
 * @throws {SvgError} when there is no `<svg>` element in the markup.
 */
export function svgDimensions(markup: string): SvgDimensions {
  if (!looksLikeSvg(markup)) {
    throw new SvgError("That markup has no <svg> element in it.");
  }

  const width = toPixels(WIDTH.exec(markup)?.[1]);
  const height = toPixels(HEIGHT.exec(markup)?.[1]);

  if (width !== null && height !== null) {
    return { width, height, fromViewBox: false };
  }

  const box = viewBoxSize(markup);
  if (box) {
    return { width: box.width, height: box.height, fromViewBox: true };
  }

  return { width, height, fromViewBox: false };
}
