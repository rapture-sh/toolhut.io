import { downloadName, stripExtension } from "~/utils/filename";
import { extensionFor, type ImageFormat } from "~/utils/image-format";

/** How wide the longest side of a rendered page is, in pixels. */
export const PAGE_SIZES = [
  { value: 800, label: "Screen" },
  { value: 1600, label: "Large" },
  { value: 2400, label: "Print" },
] as const;

export type PageSizeChoice = (typeof PAGE_SIZES)[number]["value"];

/** `report.pdf` page 2 becomes `report-page-2.png`. */
export function pageImageName(
  original: string,
  page: number,
  format: ImageFormat,
): string {
  return downloadName(original, {
    suffix: `page-${page}`,
    extension: extensionFor(format),
  });
}

export function pagesZipName(original: string): string {
  return `${stripExtension(original.trim()).trim() || "pages"}.zip`;
}

/**
 * The pages a document has, as a plain list. Used when nothing was typed in
 * the range box, which means everything.
 */
export function allPages(total: number): number[] {
  return Array.from({ length: Math.max(0, total) }, (_, index) => index + 1);
}
