import { differenceEuclidean } from "culori";
import type { Pixels } from "~/lib/image/canvas";
import type { Color } from "~/utils/color";

/** Thrown when pixel data or a palette size does not add up. */
export class PaletteError extends Error {
  constructor(message = "Those pixels do not match the size given for them.") {
    super(message);
    this.name = "PaletteError";
  }
}

export interface PaletteColor {
  color: Color;
  /** 0 to 1, this colour's share of the pixels that are not transparent. */
  share: number;
}

export interface PaletteOptions {
  /** How many colours to come back with, 1 to 32. Defaults to 6. */
  count?: number;
}

const MAX_COUNT = 32;

/**
 * How close two colours have to be, as a Euclidean distance in OKLab, before
 * the palette treats them as one. Without this a photograph comes back as six
 * shades of the same grey.
 */
const MERGE_DISTANCE = 0.045;

const distance = differenceEuclidean("oklab");

interface Box {
  start: number;
  end: number;
}

function rgb(red: number, green: number, blue: number): Color {
  return { mode: "rgb", r: red / 255, g: green / 255, b: blue / 255 };
}

function channelRange(
  samples: Uint8Array,
  order: Uint32Array,
  box: Box,
  channel: number,
): { low: number; high: number } {
  let low = 255;
  let high = 0;

  for (let at = box.start; at < box.end; at += 1) {
    const value = samples[order[at] * 3 + channel];
    low = Math.min(low, value);
    high = Math.max(high, value);
  }

  return { low, high };
}

function widestChannel(
  samples: Uint8Array,
  order: Uint32Array,
  box: Box,
): { channel: number; spread: number } {
  let channel = 0;
  let spread = -1;

  for (let candidate = 0; candidate < 3; candidate += 1) {
    const { low, high } = channelRange(samples, order, box, candidate);

    if (high - low > spread) {
      channel = candidate;
      spread = high - low;
    }
  }

  return { channel, spread };
}

function splitBox(
  samples: Uint8Array,
  order: Uint32Array,
  box: Box,
  channel: number,
): [Box, Box] {
  const slice = Array.from(order.subarray(box.start, box.end)).sort(
    (left, right) => samples[left * 3 + channel] - samples[right * 3 + channel],
  );
  order.set(slice, box.start);

  const middle = box.start + Math.floor((box.end - box.start) / 2);

  return [
    { start: box.start, end: middle },
    { start: middle, end: box.end },
  ];
}

/** Median cut: keep halving the box that covers the most colour. */
function cut(samples: Uint8Array, order: Uint32Array, boxes: number): Box[] {
  const result: Box[] = [{ start: 0, end: order.length }];

  while (result.length < boxes) {
    let best = -1;
    let bestScore = 0;

    for (let index = 0; index < result.length; index += 1) {
      const box = result[index];

      if (box.end - box.start < 2) {
        continue;
      }

      const score =
        widestChannel(samples, order, box).spread * (box.end - box.start);

      if (score > bestScore) {
        best = index;
        bestScore = score;
      }
    }

    if (best === -1) {
      return result;
    }

    const box = result[best];
    const { channel } = widestChannel(samples, order, box);
    result.splice(best, 1, ...splitBox(samples, order, box, channel));
  }

  return result;
}

function averageOf(
  samples: Uint8Array,
  order: Uint32Array,
  box: Box,
): PaletteColor {
  let red = 0;
  let green = 0;
  let blue = 0;

  for (let at = box.start; at < box.end; at += 1) {
    const sample = order[at] * 3;
    red += samples[sample];
    green += samples[sample + 1];
    blue += samples[sample + 2];
  }

  const size = box.end - box.start;

  return {
    color: rgb(red / size, green / size, blue / size),
    share: size / order.length,
  };
}

function mergeNeighbours(entries: PaletteColor[]): PaletteColor[] {
  const kept: PaletteColor[] = [];

  for (const entry of entries) {
    const near = kept.find(
      (other) => distance(other.color, entry.color) < MERGE_DISTANCE,
    );

    if (!near) {
      kept.push({ ...entry });
      continue;
    }

    const share = near.share + entry.share;
    const weight = entry.share / share;

    near.color = {
      mode: "rgb",
      r: near.color.r + (entry.color.r - near.color.r) * weight,
      g: near.color.g + (entry.color.g - near.color.g) * weight,
      b: near.color.b + (entry.color.b - near.color.b) * weight,
    };
    near.share = share;
  }

  return kept;
}

/**
 * The colours an image is mostly made of, the largest share first. Fully
 * transparent pixels are left out, since they have no colour to show.
 *
 * @throws PaletteError when the data does not match the size, or the count is
 * outside 1 to 32.
 */
export function extractPalette(
  pixels: Pixels,
  options: PaletteOptions = {},
): PaletteColor[] {
  const count = options.count ?? 6;

  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    throw new PaletteError(`Ask for between 1 and ${MAX_COUNT} colours.`);
  }

  if (pixels.data.length !== pixels.width * pixels.height * 4) {
    throw new PaletteError();
  }

  const samples = new Uint8Array(pixels.width * pixels.height * 3);
  let opaque = 0;

  for (let at = 0; at < pixels.data.length; at += 4) {
    if (pixels.data[at + 3] === 0) {
      continue;
    }

    samples[opaque * 3] = pixels.data[at];
    samples[opaque * 3 + 1] = pixels.data[at + 1];
    samples[opaque * 3 + 2] = pixels.data[at + 2];
    opaque += 1;
  }

  if (opaque === 0) {
    return [];
  }

  const order = new Uint32Array(opaque);
  for (let index = 0; index < opaque; index += 1) {
    order[index] = index;
  }

  const boxes = cut(samples, order, Math.min(count * 3, MAX_COUNT * 3));
  const entries = boxes
    .map((box) => averageOf(samples, order, box))
    .sort((left, right) => right.share - left.share);

  return mergeNeighbours(entries)
    .sort((left, right) => right.share - left.share)
    .slice(0, count);
}

/** The colour of one pixel, or null when the point is off the image. */
export function pixelAt(pixels: Pixels, x: number, y: number): Color | null {
  const column = Math.floor(x);
  const row = Math.floor(y);

  if (
    !Number.isFinite(column) ||
    !Number.isFinite(row) ||
    column < 0 ||
    row < 0 ||
    column >= pixels.width ||
    row >= pixels.height
  ) {
    return null;
  }

  const at = (row * pixels.width + column) * 4;
  const color = rgb(pixels.data[at], pixels.data[at + 1], pixels.data[at + 2]);
  const alpha = pixels.data[at + 3] / 255;

  return alpha < 1 ? { ...color, alpha } : color;
}
