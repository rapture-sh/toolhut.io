/** Thrown when an icon cannot be described from the numbers given. */
export class FaviconError extends Error {
  constructor(message = "An icon size has to be a whole number of pixels.") {
    super(message);
    this.name = "FaviconError";
  }
}

/** The sizes a site actually asks for, from the browser tab to the home screen. */
export const FAVICON_SIZES = [16, 32, 48, 64, 180, 192, 512] as const;

/** The smallest source that still fills the biggest icon without blurring. */
export const SMALLEST_SOURCE = 512;

/** A maskable icon keeps its artwork inside the middle 80 per cent. */
export const SAFE_AREA = 0.8;

export const ZIP_NAME = "favicons.zip";

export interface IconSpec {
  size: number;
  /** Inset to the safe area, for a home screen icon that gets masked. */
  maskable: boolean;
  /** Cannot be transparent, so it is drawn on the chosen background. */
  opaque: boolean;
  label: string;
}

export const ICON_SPECS: readonly IconSpec[] = [
  { size: 16, maskable: false, opaque: false, label: "Browser tab" },
  { size: 32, maskable: false, opaque: false, label: "Taskbar" },
  { size: 48, maskable: false, opaque: false, label: "Windows site" },
  { size: 64, maskable: false, opaque: false, label: "High density tab" },
  { size: 180, maskable: false, opaque: true, label: "Apple touch icon" },
  { size: 192, maskable: false, opaque: false, label: "Android home screen" },
  { size: 512, maskable: false, opaque: false, label: "Splash screen" },
  { size: 512, maskable: true, opaque: true, label: "Maskable" },
];

function assertSize(size: number): void {
  if (!Number.isInteger(size) || size < 1) {
    throw new FaviconError();
  }
}

/** The name an icon of this size usually carries in a site's head. */
export function iconFileName(size: number, maskable = false): string {
  assertSize(size);

  if (maskable) {
    return `maskable-icon-${size}x${size}.png`;
  }

  if (size === 180) {
    return "apple-touch-icon.png";
  }

  return size <= 64
    ? `favicon-${size}x${size}.png`
    : `icon-${size}x${size}.png`;
}

export function specKey(spec: IconSpec): string {
  return iconFileName(spec.size, spec.maskable);
}

/**
 * The padding on each edge of a maskable icon, in pixels. The artwork is what
 * is left, so it measures `size - inset * 2` across.
 */
export function safeAreaInset(size: number): number {
  assertSize(size);

  return Math.round((size * (1 - SAFE_AREA)) / 2);
}

/** The width the artwork gets inside a maskable icon of this size. */
export function safeAreaArtwork(size: number): number {
  return Math.max(1, size - safeAreaInset(size) * 2);
}

/**
 * Within two per cent of square, which is close enough that stretching the
 * image to a square icon is invisible.
 */
export function isSquareEnough(
  width: number,
  height: number,
  tolerance = 0.02,
): boolean {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1
  ) {
    throw new FaviconError("That image has no width or height to measure.");
  }

  return Math.abs(width - height) / Math.max(width, height) <= tolerance;
}

/** What is wrong with the source image, in the words the page shows. */
export function sourceWarnings(width: number, height: number): string[] {
  const warnings: string[] = [];

  if (!isSquareEnough(width, height)) {
    warnings.push(
      `That image is ${width} by ${height} pixels, so it is not square. Every icon is square, so the picture will be stretched to fit.`,
    );
  }

  if (Math.min(width, height) < SMALLEST_SOURCE) {
    warnings.push(
      `That image is smaller than ${SMALLEST_SOURCE} pixels, so the largest icons will look soft.`,
    );
  }

  return warnings;
}
