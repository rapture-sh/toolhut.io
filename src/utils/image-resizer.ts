import { downloadName } from "~/utils/filename";
import { extensionFor, type ImageFormat } from "~/utils/image-format";

/** Thrown when a requested size cannot be drawn. */
export class ResizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResizeError";
  }
}

export interface Size {
  width: number;
  height: number;
}

export type ResizeMode = "pixels" | "percent";

export interface ResizeRequest {
  mode: ResizeMode;
  /** In pixel mode, `0` means "work it out from the other side". */
  width: number;
  height: number;
  /** Keep the proportions of the original. */
  lock: boolean;
  /** In percent mode, where 100 is the original size. */
  percent: number;
}

/** Widths people ask for most, so the common case is one click. */
export const WIDTH_PRESETS = [320, 640, 1024, 1440, 1920] as const;

/** Both Chrome and Safari refuse to draw a canvas past this on a side. */
export const MAX_SIDE = 16384;

function round(value: number): number {
  return Math.max(1, Math.round(value));
}

export function fitToWidth(source: Size, width: number): Size {
  return {
    width: round(width),
    height: round((width / source.width) * source.height),
  };
}

export function fitToHeight(source: Size, height: number): Size {
  return {
    width: round((height / source.height) * source.width),
    height: round(height),
  };
}

export function scaleBy(source: Size, percent: number): Size {
  return {
    width: round((source.width * percent) / 100),
    height: round((source.height * percent) / 100),
  };
}

/**
 * The size an image will actually be written at. Rounding never reaches zero,
 * so a very small percentage still leaves one pixel to draw.
 */
export function resolveSize(source: Size, request: ResizeRequest): Size {
  if (source.width < 1 || source.height < 1) {
    throw new ResizeError("That image has no size to resize.");
  }

  const size = sizeFor(source, request);

  if (size.width > MAX_SIDE || size.height > MAX_SIDE) {
    throw new ResizeError(
      `A browser cannot draw an image wider or taller than ${MAX_SIDE} pixels.`,
    );
  }

  return size;
}

function sizeFor(source: Size, request: ResizeRequest): Size {
  if (request.mode === "percent") {
    if (!Number.isFinite(request.percent) || request.percent <= 0) {
      throw new ResizeError("Enter a percentage above zero.");
    }
    return scaleBy(source, request.percent);
  }

  const width = Number.isFinite(request.width) ? request.width : 0;
  const height = Number.isFinite(request.height) ? request.height : 0;

  if (width <= 0 && height <= 0) {
    throw new ResizeError("Enter a width or a height.");
  }

  if (!request.lock) {
    return {
      width: round(width > 0 ? width : source.width),
      height: round(height > 0 ? height : source.height),
    };
  }

  return width > 0 ? fitToWidth(source, width) : fitToHeight(source, height);
}

export function resizedName(
  original: string,
  size: Size,
  format: ImageFormat,
): string {
  return downloadName(original, {
    suffix: `${size.width}x${size.height}`,
    extension: extensionFor(format),
  });
}

/** How much smaller the new size is, as a percentage of the pixel count. */
export function pixelChange(source: Size, target: Size): number {
  const before = source.width * source.height;
  const after = target.width * target.height;

  if (before === 0) {
    return 0;
  }

  return Math.round(((after - before) / before) * 100);
}
