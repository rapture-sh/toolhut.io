import { downloadName } from "~/utils/filename";

/** Thrown when a crop cannot be made from the numbers given. */
export class CropError extends Error {
  constructor(message = "That crop box does not fit inside the image.") {
    super(message);
    this.name = "CropError";
  }
}

/** A crop in source pixels, measured from the top left of the image. */
export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The size of the image a box has to stay inside, in source pixels. */
export interface CropBounds {
  width: number;
  height: number;
}

export const CROP_HANDLES = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
] as const;

export type CropHandle = (typeof CROP_HANDLES)[number];

export const CROP_RATIOS = [
  { value: "free", label: "Free", ratio: null },
  { value: "square", label: "1:1", ratio: 1 },
  { value: "classic", label: "4:3", ratio: 4 / 3 },
  { value: "wide", label: "16:9", ratio: 16 / 9 },
  { value: "photo", label: "3:2", ratio: 3 / 2 },
] as const;

export type CropRatioName = (typeof CROP_RATIOS)[number]["value"];

/** `null` for a free crop, otherwise width divided by height. */
export function ratioFor(name: CropRatioName): number | null {
  const option = CROP_RATIOS.find((candidate) => candidate.value === name);

  return option ? option.ratio : null;
}

function assertBounds(bounds: CropBounds): void {
  if (
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width < 1 ||
    bounds.height < 1
  ) {
    throw new CropError(
      "An image has to be at least one pixel wide and tall to crop.",
    );
  }
}

function assertBox(box: CropBox): void {
  if (
    !Number.isFinite(box.x) ||
    !Number.isFinite(box.y) ||
    !Number.isFinite(box.width) ||
    !Number.isFinite(box.height)
  ) {
    throw new CropError(
      "A crop box needs a number for x, y, width and height.",
    );
  }
}

function assertRatio(ratio: number): void {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    throw new CropError("A crop ratio has to be a positive number.");
  }
}

function clampSize(value: number, limit: number): number {
  return Math.min(Math.max(1, Math.round(value)), Math.floor(limit));
}

function clampStart(value: number, size: number, limit: number): number {
  return Math.min(Math.max(0, Math.round(value)), Math.floor(limit) - size);
}

/**
 * The same box in whole source pixels, moved and shrunk only as far as it has
 * to be to sit inside the image.
 */
export function clampBox(box: CropBox, bounds: CropBounds): CropBox {
  assertBounds(bounds);
  assertBox(box);

  const width = clampSize(box.width, bounds.width);
  const height = clampSize(box.height, bounds.height);

  return {
    x: clampStart(box.x, width, bounds.width),
    y: clampStart(box.y, height, bounds.height),
    width,
    height,
  };
}

/**
 * The biggest box of this ratio that fits the image, kept on the middle of the
 * box it came from. A free crop is clamped and otherwise left alone.
 */
export function applyRatio(
  box: CropBox,
  ratio: number | null,
  bounds: CropBounds,
): CropBox {
  if (ratio === null) {
    return clampBox(box, bounds);
  }

  assertBounds(bounds);
  assertBox(box);
  assertRatio(ratio);

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  let width = Math.max(1, box.width);
  let height = width / ratio;

  if (height > bounds.height) {
    height = bounds.height;
    width = height * ratio;
  }

  if (width > bounds.width) {
    width = bounds.width;
    height = width / ratio;
  }

  return clampBox(
    { x: centerX - width / 2, y: centerY - height / 2, width, height },
    bounds,
  );
}

/**
 * Converts a box between display pixels and source pixels. The factor is
 * source over display, so `1 / factor` goes the other way.
 */
export function scaleBox(box: CropBox, factor: number): CropBox {
  assertBox(box);

  if (!Number.isFinite(factor) || factor <= 0) {
    throw new CropError("A crop box can only be scaled by a positive number.");
  }

  return {
    x: Math.round(box.x * factor),
    y: Math.round(box.y * factor),
    width: Math.max(1, Math.round(box.width * factor)),
    height: Math.max(1, Math.round(box.height * factor)),
  };
}

export function moveBox(
  box: CropBox,
  dx: number,
  dy: number,
  bounds: CropBounds,
): CropBox {
  assertBox(box);

  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    throw new CropError("A crop box can only be moved by a number of pixels.");
  }

  return clampBox({ ...box, x: box.x + dx, y: box.y + dy }, bounds);
}

function anchorRatio(
  box: CropBox,
  handle: CropHandle,
  ratio: number,
  bounds: CropBounds,
): CropBox {
  const width = Math.min(box.width, box.height * ratio);
  const height = width / ratio;

  const x = handle.includes("w")
    ? box.x + box.width - width
    : handle.includes("e")
      ? box.x
      : box.x + (box.width - width) / 2;

  const y = handle.includes("n")
    ? box.y + box.height - height
    : handle.includes("s")
      ? box.y
      : box.y + (box.height - height) / 2;

  return clampBox({ x, y, width, height }, bounds);
}

/**
 * Drags one handle by a delta in source pixels. The edges the handle does not
 * touch stay where they are, and a ratio keeps the box anchored to them. A
 * dragged edge stops a pixel short of its opposite rather than turning inside
 * out.
 */
export function resizeBox(
  box: CropBox,
  handle: CropHandle,
  dx: number,
  dy: number,
  bounds: CropBounds,
  ratio: number | null = null,
): CropBox {
  assertBox(box);

  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    throw new CropError(
      "A crop box can only be resized by a number of pixels.",
    );
  }

  let left = box.x;
  let right = box.x + box.width;
  let top = box.y;
  let bottom = box.y + box.height;

  if (handle.includes("w")) {
    left = Math.min(left + dx, right - 1);
  }
  if (handle.includes("e")) {
    right = Math.max(right + dx, left + 1);
  }
  if (handle.includes("n")) {
    top = Math.min(top + dy, bottom - 1);
  }
  if (handle.includes("s")) {
    bottom = Math.max(bottom + dy, top + 1);
  }

  const dragged = clampBox(
    { x: left, y: top, width: right - left, height: bottom - top },
    bounds,
  );

  if (ratio === null) {
    return dragged;
  }

  assertRatio(ratio);

  return anchorRatio(dragged, handle, ratio, bounds);
}

/** The box a tool starts with: eight tenths of the image, in the middle. */
export function defaultBox(
  bounds: CropBounds,
  ratio: number | null = null,
): CropBox {
  assertBounds(bounds);

  const width = bounds.width * 0.8;
  const height = bounds.height * 0.8;

  return applyRatio(
    {
      x: (bounds.width - width) / 2,
      y: (bounds.height - height) / 2,
      width,
      height,
    },
    ratio,
    bounds,
  );
}

/** A crop is written as PNG, so the name always ends in `.png`. */
export function cropName(original: string, box: CropBox): string {
  assertBox(box);

  const width = Math.max(1, Math.round(box.width));
  const height = Math.max(1, Math.round(box.height));

  return downloadName(original, {
    suffix: `crop-${width}x${height}`,
    extension: "png",
  });
}
