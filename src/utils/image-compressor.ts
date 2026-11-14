import { downloadName } from "~/utils/filename";
import { extensionFor, type ImageFormat } from "~/utils/image-format";

/** Thrown when a size or a quality is not a number worth compressing with. */
export class CompressionInputError extends Error {
  constructor(message = "That is not a size this tool can compare.") {
    super(message);
    this.name = "CompressionInputError";
  }
}

/** Quality is the 0 to 1 fraction that `canvas.toBlob` takes. */
export const QUALITY_RANGE = { min: 0.1, max: 1, step: 0.01 } as const;

export interface Savings {
  /** How much of the original is gone, as a whole percentage. Negative when the result grew. */
  percent: number;
  smaller: boolean;
  /** The same number in plain words, such as `32% smaller`. */
  label: string;
}

export function savings(before: number, after: number): Savings {
  if (!Number.isFinite(before) || !Number.isFinite(after)) {
    throw new CompressionInputError();
  }

  if (before <= 0) {
    throw new CompressionInputError(
      "The original file is empty, so there is nothing to compare.",
    );
  }

  if (after < 0) {
    throw new CompressionInputError();
  }

  const percent = Math.round(((before - after) / before) * 100);

  if (percent === 0) {
    return { percent, smaller: after < before, label: "about the same size" };
  }

  return {
    percent,
    smaller: percent > 0,
    label: percent > 0 ? `${percent}% smaller` : `${-percent}% bigger`,
  };
}

export function clampQuality(value: number): number {
  if (!Number.isFinite(value)) {
    throw new CompressionInputError(
      "Quality has to be a number between 0 and 1.",
    );
  }

  const bounded = Math.min(
    QUALITY_RANGE.max,
    Math.max(QUALITY_RANGE.min, value),
  );

  return Math.round(bounded * 100) / 100;
}

/** The whole percentage a slider shows beside the quality it is set to. */
export function qualityPercent(quality: number): number {
  return Math.round(clampQuality(quality) * 100);
}

export function compressedName(original: string, format: ImageFormat): string {
  return downloadName(original, {
    suffix: "compressed",
    extension: extensionFor(format),
  });
}
