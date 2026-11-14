import { downloadName, stripExtension } from "~/utils/filename";
import { formatPageRange } from "~/utils/page-range";

export type SplitMode = "one" | "each";

export const SPLIT_MODES = [
  { value: "one" as const, label: "One file" },
  { value: "each" as const, label: "A file per page" },
];

export interface SplitPiece {
  /** How the pages read in the file name, such as `1-3` or `7`. */
  label: string;
  pages: number[];
}

/**
 * `report.pdf` with the label `1-3` saves as `report-pages-1-3.pdf`, and a
 * single page reads as `report-page-7.pdf`. Commas become underscores, since
 * a file name holding `1-3, 7` is awkward everywhere.
 */
export function splitName(original: string, label: string): string {
  const clean = label
    .trim()
    .replace(/\s*,\s*/g, "_")
    .replace(/\s+/g, "");

  if (clean === "") {
    return downloadName(original, { suffix: "pages", extension: "pdf" });
  }

  const word = /^\d+$/.test(clean) ? "page" : "pages";

  return downloadName(original, {
    suffix: `${word}-${clean}`,
    extension: "pdf",
  });
}

export function splitZipName(original: string): string {
  const stem = stripExtension(original.trim()).trim();

  return `${stem === "" ? "pages" : `${stem}-pages`}.zip`;
}

/**
 * The files a split writes. `one` keeps the chosen pages together in the
 * order they were asked for, `each` gives every page a file of its own, and
 * a page named twice only gets one file.
 */
export function splitPieces(
  pages: readonly number[],
  mode: SplitMode,
): SplitPiece[] {
  if (pages.length === 0) {
    return [];
  }

  if (mode === "one") {
    return [{ label: formatPageRange(pages), pages: [...pages] }];
  }

  const seen = new Set<number>();
  const pieces: SplitPiece[] = [];

  for (const page of pages) {
    if (seen.has(page)) {
      continue;
    }
    seen.add(page);
    pieces.push({ label: String(page), pages: [page] });
  }

  return pieces;
}
