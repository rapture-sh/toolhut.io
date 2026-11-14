import { downloadName } from "~/utils/filename";
import {
  IMAGE_FORMAT_LIST,
  IMAGE_FORMATS,
  type ImageFormat,
  isLossy,
} from "~/utils/image-format";

/** Thrown when a conversion is asked for that cannot be carried out. */
export class ConversionError extends Error {
  constructor(message = "That conversion cannot be done.") {
    super(message);
    this.name = "ConversionError";
  }
}

const HEX_COLOUR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function convertedName(original: string, format: ImageFormat): string {
  return downloadName(original, {
    extension: IMAGE_FORMATS[format].extension,
  });
}

/** JPEG carries no alpha, so anything transparent needs a colour behind it. */
export function needsBackground(format: ImageFormat): boolean {
  return format === "jpeg";
}

/** Every format worth offering for a source, so the list never repeats itself. */
export function targetFormats(source?: ImageFormat): ImageFormat[] {
  return IMAGE_FORMAT_LIST.filter((format) => format !== source);
}

export function isHexColour(value: string): boolean {
  return HEX_COLOUR.test(value.trim());
}

/** A six digit `#rrggbb`, which is what a canvas fill and a colour input both want. */
export function normaliseHexColour(value: string): string {
  const match = HEX_COLOUR.exec(value.trim());

  if (!match) {
    throw new ConversionError(
      "A background needs to be a hex colour such as #ffffff.",
    );
  }

  const digits = match[1].toLowerCase();

  return digits.length === 3
    ? `#${digits
        .split("")
        .map((digit) => digit + digit)
        .join("")}`
    : `#${digits}`;
}

export interface ConversionRequest {
  /** The name of the picked file, which the result is named after. */
  name: string;
  /** The format the file already is, or undefined when nothing can write it. */
  source?: ImageFormat;
  target: ImageFormat;
  quality?: number;
  /** The image has pixels that are not fully opaque. */
  transparent?: boolean;
  background?: string;
}

export interface ConversionPlan {
  format: ImageFormat;
  name: string;
  /** Undefined for a lossless target, where quality means nothing. */
  quality: number | undefined;
  /** A colour to paint behind the image, or undefined to keep the alpha. */
  background: string | undefined;
}

/** Everything the canvas needs for one conversion, decided in one place. */
export function conversionPlan({
  name,
  source,
  target,
  quality = 0.9,
  transparent = false,
  background = "#ffffff",
}: ConversionRequest): ConversionPlan {
  if (source === target) {
    throw new ConversionError(
      `That image is already a ${IMAGE_FORMATS[target].label}, so pick another format.`,
    );
  }

  if (!Number.isFinite(quality)) {
    throw new ConversionError("Quality has to be a number between 0 and 1.");
  }

  return {
    format: target,
    name: convertedName(name, target),
    quality: isLossy(target)
      ? Math.round(Math.min(1, Math.max(0.1, quality)) * 100) / 100
      : undefined,
    background:
      needsBackground(target) && transparent
        ? normaliseHexColour(background)
        : undefined,
  };
}
