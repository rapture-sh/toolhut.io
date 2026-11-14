/** The image formats a browser can both decode and encode on its own. */
export const IMAGE_FORMATS = {
  png: { type: "image/png", label: "PNG", extension: "png", lossy: false },
  jpeg: { type: "image/jpeg", label: "JPEG", extension: "jpg", lossy: true },
  webp: { type: "image/webp", label: "WebP", extension: "webp", lossy: true },
} as const;

export type ImageFormat = keyof typeof IMAGE_FORMATS;

export const IMAGE_FORMAT_LIST = Object.keys(IMAGE_FORMATS) as ImageFormat[];

export function typeFor(format: ImageFormat): string {
  return IMAGE_FORMATS[format].type;
}

export function extensionFor(format: ImageFormat): string {
  return IMAGE_FORMATS[format].extension;
}

export function isLossy(format: ImageFormat): boolean {
  return IMAGE_FORMATS[format].lossy;
}

/** `undefined` for a type this site cannot write back out, such as AVIF. */
export function formatForType(type: string): ImageFormat | undefined {
  const normalized = type.trim().toLowerCase();

  if (normalized === "image/jpg") {
    return "jpeg";
  }

  return IMAGE_FORMAT_LIST.find(
    (format) => IMAGE_FORMATS[format].type === normalized,
  );
}
