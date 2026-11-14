import { downloadName } from "~/utils/filename";

/** Thrown when a pile of images cannot be laid out as pages. */
export class ImagesToPdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImagesToPdfError";
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

/**
 * The page sizes a PDF can be built on, in points at 72 to the inch, which
 * is the unit a PDF measures in. `points` is null for the page that takes
 * the shape of whichever image lands on it.
 */
export const PAGE_SIZES = {
  a4: { label: "A4", points: { width: 595, height: 842 } },
  letter: { label: "Letter", points: { width: 612, height: 792 } },
  fit: { label: "Fit the image", points: null },
} as const;

export type PageSize = keyof typeof PAGE_SIZES;

export const PAGE_SIZE_LIST = Object.keys(PAGE_SIZES) as PageSize[];

export type Orientation = "portrait" | "landscape";

export const ORIENTATIONS = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
] as const satisfies readonly { value: Orientation; label: string }[];

/** The widest margin the slider offers, past which the image is a stamp. */
export const MAX_MARGIN_PERCENT = 25;

export interface PageLayout {
  page: Size;
  image: Box;
}

export interface LayoutOptions {
  size: PageSize;
  orientation: Orientation;
  /** Taken off each edge, as a share of the shorter side. */
  marginPercent: number;
}

/**
 * Where one image sits on its page, with both measured in points from the
 * top left corner. The image shrinks to fit inside the margin and is
 * centred there, and it is never scaled up past its own pixel size, because
 * enlarging spends bytes on blur. A size of `fit` ignores the orientation
 * and gives the page the shape of the image, with the margin grown around
 * it.
 *
 * @throws ImagesToPdfError when the image has no size, or the margin leaves
 * no room for it.
 */
export function pageBox(
  image: Size,
  size: PageSize,
  orientation: Orientation,
  marginPercent: number,
): PageLayout {
  if (
    !Number.isFinite(image.width) ||
    !Number.isFinite(image.height) ||
    image.width < 1 ||
    image.height < 1
  ) {
    throw new ImagesToPdfError("That image has no size to put on a page.");
  }

  if (!Number.isFinite(marginPercent) || marginPercent < 0) {
    throw new ImagesToPdfError("The margin cannot be less than nothing.");
  }

  const { points } = PAGE_SIZES[size];

  if (!points) {
    return fitPage(image, marginPercent);
  }

  const page =
    orientation === "landscape"
      ? { width: points.height, height: points.width }
      : { width: points.width, height: points.height };

  const margin = Math.round(
    (Math.min(page.width, page.height) * marginPercent) / 100,
  );
  const room = {
    width: page.width - margin * 2,
    height: page.height - margin * 2,
  };

  if (room.width < 1 || room.height < 1) {
    throw new ImagesToPdfError(
      "That much margin leaves no room for the image.",
    );
  }

  const scale = Math.min(
    1,
    room.width / image.width,
    room.height / image.height,
  );
  const width = Math.min(
    room.width,
    Math.max(1, Math.round(image.width * scale)),
  );
  const height = Math.min(
    room.height,
    Math.max(1, Math.round(image.height * scale)),
  );

  return {
    page,
    image: {
      x: margin + Math.round((room.width - width) / 2),
      y: margin + Math.round((room.height - height) / 2),
      width,
      height,
    },
  };
}

function fitPage(image: Size, marginPercent: number): PageLayout {
  const width = Math.max(1, Math.round(image.width));
  const height = Math.max(1, Math.round(image.height));
  const margin = Math.round((Math.min(width, height) * marginPercent) / 100);

  return {
    page: { width: width + margin * 2, height: height + margin * 2 },
    image: { x: margin, y: margin, width, height },
  };
}

/**
 * Every image laid out in the order given, which is the order the pages come
 * out in.
 *
 * @throws ImagesToPdfError when there is nothing to lay out, or one image
 * cannot be placed.
 */
export function planPages(
  images: readonly Size[],
  { size, orientation, marginPercent }: LayoutOptions,
): PageLayout[] {
  if (images.length === 0) {
    throw new ImagesToPdfError("Add at least one image.");
  }

  return images.map((image) =>
    pageBox(image, size, orientation, marginPercent),
  );
}

/**
 * What the built PDF is called. `count` is how many images went into it, so
 * five of them starting with `holiday.jpg` gives `holiday-and-4-more.pdf`.
 *
 * @throws ImagesToPdfError when there are no images to name it after.
 */
export function pdfName(firstImageName: string, count: number): string {
  if (!Number.isInteger(count) || count < 1) {
    throw new ImagesToPdfError("Add at least one image.");
  }

  const others = count - 1;

  return downloadName(firstImageName, {
    suffix: others > 0 ? `and-${others}-more` : undefined,
    extension: "pdf",
  });
}
