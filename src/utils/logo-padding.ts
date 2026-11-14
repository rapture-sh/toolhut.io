import { downloadName } from "~/utils/filename";
import { extensionFor, type ImageFormat } from "~/utils/image-format";

/** Thrown when the canvas and the padding leave nowhere to put the logo. */
export class LogoPaddingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LogoPaddingError";
  }
}

export interface Size {
  width: number;
  height: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Anchor =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

/** Laid out the way the nine buttons sit on the page. */
export const ANCHOR_ROWS: readonly (readonly Anchor[])[] = [
  ["top-left", "top", "top-right"],
  ["left", "center", "right"],
  ["bottom-left", "bottom", "bottom-right"],
];

type Align = "start" | "center" | "end";

const ALIGNMENT: Record<Anchor, { x: Align; y: Align }> = {
  "top-left": { x: "start", y: "start" },
  top: { x: "center", y: "start" },
  "top-right": { x: "end", y: "start" },
  left: { x: "start", y: "center" },
  center: { x: "center", y: "center" },
  right: { x: "end", y: "center" },
  "bottom-left": { x: "start", y: "end" },
  bottom: { x: "center", y: "end" },
  "bottom-right": { x: "end", y: "end" },
};

export const SQUARE_PRESETS = [256, 512, 1024, 2048] as const;

/** More than this and the logo would be a speck in the middle. */
export const MAX_PADDING_PERCENT = 45;

/** Below this the logo is too small to see what you are placing. */
export const MIN_SIZE_PERCENT = 10;

export interface PlacementOptions {
  /** Share of the shorter canvas side left empty on each edge. */
  paddingPercent: number;
  anchor: Anchor;
  /**
   * How much of the space inside the padding the logo takes up. At 100 it
   * fills that space, which leaves the anchor nothing to do, so anything
   * below 100 is what makes a corner a corner.
   */
  sizePercent: number;
}

/**
 * The space left for the logo once the padding is taken off. A logo this
 * size or bigger fills the canvas, which leaves the anchor nothing to do.
 */
export function innerSize(canvas: Size, paddingPercent: number): Size {
  const padding = Math.round(
    (Math.min(canvas.width, canvas.height) * paddingPercent) / 100,
  );

  return {
    width: canvas.width - padding * 2,
    height: canvas.height - padding * 2,
  };
}

function offset(align: Align, available: number, used: number): number {
  if (align === "start") {
    return 0;
  }

  return align === "center"
    ? Math.round((available - used) / 2)
    : available - used;
}

/** Where the logo lands on the new canvas, in canvas pixels. */
export function placeLogo(
  source: Size,
  canvas: Size,
  { paddingPercent, anchor, sizePercent }: PlacementOptions,
): Box {
  if (source.width < 1 || source.height < 1) {
    throw new LogoPaddingError("That image has no size to place.");
  }

  if (canvas.width < 1 || canvas.height < 1) {
    throw new LogoPaddingError("Give the canvas a width and a height.");
  }

  if (paddingPercent < 0 || paddingPercent > MAX_PADDING_PERCENT) {
    throw new LogoPaddingError(
      `Padding goes from 0 to ${MAX_PADDING_PERCENT} percent.`,
    );
  }

  if (sizePercent < MIN_SIZE_PERCENT || sizePercent > 100) {
    throw new LogoPaddingError(
      `The logo size goes from ${MIN_SIZE_PERCENT} to 100 percent.`,
    );
  }

  const padding = Math.round(
    (Math.min(canvas.width, canvas.height) * paddingPercent) / 100,
  );
  const inner = innerSize(canvas, paddingPercent);

  if (inner.width < 1 || inner.height < 1) {
    throw new LogoPaddingError(
      "That much padding leaves no room for the logo.",
    );
  }

  const room = Math.min(
    inner.width / source.width,
    inner.height / source.height,
  );
  const scale = (room * sizePercent) / 100;
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const { x, y } = ALIGNMENT[anchor];

  return {
    x: padding + offset(x, inner.width, width),
    y: padding + offset(y, inner.height, height),
    width,
    height,
  };
}

/** The smallest square that holds the logo, which is the sensible default. */
export function squareFor(source: Size): number {
  return Math.max(1, Math.max(source.width, source.height));
}

export function paddedName(
  original: string,
  canvas: Size,
  format: ImageFormat,
): string {
  return downloadName(original, {
    suffix: `${canvas.width}x${canvas.height}`,
    extension: extensionFor(format),
  });
}

interface Pixels {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

function hex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * The colour around the edge of a logo, which is almost always the background
 * it was exported on. `null` when the edge is transparent, so the tool can
 * keep transparency instead of guessing.
 */
export function edgeColor({ data, width, height }: Pixels): string | null {
  const counts = new Map<string, number>();

  const sample = (x: number, y: number) => {
    const at = (y * width + x) * 4;
    const alpha = data[at + 3] ?? 0;

    if (alpha < 128) {
      return;
    }

    const value = hex(data[at] ?? 0, data[at + 1] ?? 0, data[at + 2] ?? 0);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  };

  for (let x = 0; x < width; x += 1) {
    sample(x, 0);
    sample(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    sample(0, y);
    sample(width - 1, y);
  }

  let best: string | null = null;
  let seen = 0;

  for (const [value, count] of counts) {
    if (count > seen) {
      best = value;
      seen = count;
    }
  }

  return best;
}
