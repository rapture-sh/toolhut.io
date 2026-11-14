import { downloadName } from "~/utils/filename";

/** Thrown when a document cannot be redrawn smaller. */
export class CompressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompressError";
  }
}

export interface CompressLevel {
  value: string;
  label: string;
  /** The longest side each page is redrawn at, in pixels. */
  maxSide: number;
  /** What the JPEG keeps, from 0 to 1. */
  quality: number;
}

export const COMPRESS_LEVELS: readonly CompressLevel[] = [
  { value: "small", label: "Smallest", maxSide: 1000, quality: 0.55 },
  { value: "balanced", label: "Balanced", maxSide: 1400, quality: 0.72 },
  { value: "sharp", label: "Sharpest", maxSide: 2000, quality: 0.85 },
];

export function levelFor(value: string): CompressLevel {
  const found = COMPRESS_LEVELS.find((level) => level.value === value);

  if (!found) {
    throw new CompressError("That is not a setting this tool has.");
  }

  return found;
}

export function compressedName(original: string): string {
  return downloadName(original, { suffix: "smaller", extension: "pdf" });
}

export interface SizeChange {
  percent: number;
  smaller: boolean;
  label: string;
}

/**
 * How the new file compares to the old one. Redrawing a document that was
 * already small can make it bigger, and saying so is more use than hiding it.
 */
export function sizeChange(before: number, after: number): SizeChange {
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0) {
    throw new CompressError("That file has no size to compare.");
  }

  const percent = Math.round(((before - after) / before) * 100);

  if (percent === 0) {
    return { percent, smaller: false, label: "about the same size" };
  }

  return {
    percent,
    smaller: percent > 0,
    label: percent > 0 ? `${percent}% smaller` : `${Math.abs(percent)}% bigger`,
  };
}
