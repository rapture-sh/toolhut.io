import { downloadName } from "~/utils/filename";

export const PAGE_SEPARATORS = [
  { value: "blank", label: "Blank line" },
  { value: "marked", label: "Page markers" },
] as const;

export type PageSeparator = (typeof PAGE_SEPARATORS)[number]["value"];

interface JoinOptions {
  separator: PageSeparator;
}

/** A page of real text carries far more characters than this. */
const SCANNED_BELOW = 24;

function marker(page: number): string {
  return `--- Page ${page} ---`;
}

/**
 * The pages of a document as one piece of text. `blank` leaves an empty line
 * between pages and drops the ones holding nothing, `marked` writes a page
 * line before every page, so the numbering still reads true where a page came
 * out empty.
 */
export function joinPages(
  pages: readonly string[],
  { separator }: JoinOptions,
): string {
  const trimmed = pages.map((page) => page.replace(/[ \t]+$/gm, "").trim());

  if (separator === "marked") {
    return trimmed
      .map((text, index) =>
        text === "" ? marker(index + 1) : `${marker(index + 1)}\n\n${text}`,
      )
      .join("\n\n");
  }

  return trimmed.filter((text) => text !== "").join("\n\n");
}

export function wordCount(text: string): number {
  const trimmed = text.trim();

  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Whether a document has pages but next to no text in them, which is what a
 * scan looks like: the words are pixels, so no extractor can reach them.
 */
export function isLikelyScanned(pages: readonly string[]): boolean {
  if (pages.length === 0) {
    return false;
  }

  const characters = pages.reduce(
    (total, page) => total + page.replace(/\s+/g, "").length,
    0,
  );

  return characters < pages.length * SCANNED_BELOW;
}

/** `report.pdf` becomes `report.txt`. */
export function textName(original: string): string {
  return downloadName(original, { extension: "txt" });
}
