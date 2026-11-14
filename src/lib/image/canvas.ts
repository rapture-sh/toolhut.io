import { type ImageFormat, isLossy, typeFor } from "~/utils/image-format";

/** Thrown when a file is not an image the browser can decode. */
export class ImageDecodeError extends Error {
  constructor(message = "That file is not an image this browser can read.") {
    super(message);
    this.name = "ImageDecodeError";
  }
}

/** A vector has no pixel size of its own, so it is drawn big enough to stay sharp. */
const VECTOR_SIDE = 1024;

/**
 * Draws a file the fast path refuses through an `<img>` element instead. This
 * is how SVG gets in: Chrome and Safari will not hand `createImageBitmap` a
 * vector, while an image element renders one happily.
 */
async function bitmapFromElement(file: Blob): Promise<ImageBitmap> {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const longest = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longest > 0 ? Math.max(1, VECTOR_SIDE / longest) : 1;
    const width = Math.round((image.naturalWidth || VECTOR_SIDE) * scale);
    const height = Math.round((image.naturalHeight || VECTOR_SIDE) * scale);

    return await createImageBitmap(toCanvas(image, width, height));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function loadImage(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    // Not a format this browser decodes directly. An element may still manage.
  }

  try {
    return await bitmapFromElement(file);
  } catch {
    throw new ImageDecodeError();
  }
}

export function toCanvas(
  source: ImageBitmap | HTMLCanvasElement | HTMLImageElement,
  width = source.width,
  height = source.height,
  background?: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new ImageDecodeError("This browser cannot draw on a canvas.");
  }

  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality = 0.9,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new ImageDecodeError("This browser cannot write that format."));
      },
      typeFor(format),
      isLossy(format) ? quality : undefined,
    );
  });
}

/**
 * Downscales with Lanczos filtering in a worker, which keeps detail that a
 * plain canvas draw turns to mush. Loaded on demand, so only the tools that
 * resize pay for it.
 */
export async function resizeCanvas(
  source: ImageBitmap,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const from = toCanvas(source);
  const to = document.createElement("canvas");
  to.width = Math.max(1, Math.round(width));
  to.height = Math.max(1, Math.round(height));

  try {
    const { default: pica } = await import("pica");
    await pica().resize(from, to);
    return to;
  } catch {
    return toCanvas(source, width, height);
  }
}

export async function toPngBlob(blob: Blob): Promise<Blob> {
  if (blob.type === "image/png") {
    return blob;
  }

  const bitmap = await loadImage(blob);

  try {
    return await canvasToBlob(toCanvas(bitmap), "png");
  } finally {
    bitmap.close();
  }
}

export interface Pixels {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

/**
 * The pixels of an image, shrunk to `maxSide` first so reading a photo stays
 * quick. Colours survive the shrink, which is all a palette needs.
 */
export function readPixels(source: ImageBitmap, maxSide = 256): Pixels {
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const canvas = toCanvas(
    source,
    Math.max(1, Math.round(source.width * scale)),
    Math.max(1, Math.round(source.height * scale)),
  );

  const context = canvas.getContext("2d");
  if (!context) {
    throw new ImageDecodeError("This browser cannot read a canvas back.");
  }

  const { data, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return { data, width, height };
}
