import type { PagePick } from "~/lib/pdf/build";
import { downloadName } from "~/utils/filename";

/** Thrown when there is not enough loaded to merge anything. */
export class MergeError extends Error {
  constructor(message = "Add at least two PDFs to join them.") {
    super(message);
    this.name = "MergeError";
  }
}

/** The result takes the first file's name, so `report.pdf` saves as `report-merged.pdf`. */
export function mergedName(names: readonly string[]): string {
  const first = names.find((name) => name.trim() !== "");

  if (!first) {
    return "merged.pdf";
  }

  return downloadName(first, { suffix: "merged", extension: "pdf" });
}

export function totalPages(counts: readonly number[]): number {
  return counts.reduce((sum, count) => sum + Math.max(0, count), 0);
}

/**
 * Every page of every file, in the order the files are in. This is what the
 * merged document is built from.
 *
 * @throws MergeError when there are fewer than two files to join.
 */
export function mergePicks(counts: readonly number[]): PagePick[] {
  if (counts.length < 2) {
    throw new MergeError();
  }

  const picks: PagePick[] = [];

  counts.forEach((count, source) => {
    for (let page = 1; page <= count; page += 1) {
      picks.push({ source, page });
    }
  });

  if (picks.length === 0) {
    throw new MergeError("Those files have no pages to join.");
  }

  return picks;
}
