/** Thrown when a page range cannot be read, or asks for pages that are not there. */
export class PageRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PageRangeError";
  }
}

const PART = /^(\d+)?\s*(-)?\s*(\d+)?$/;

/**
 * Reads what somebody typed into a list of page numbers, counting from 1.
 * `1-3, 7, 12-` means pages one to three, seven, and twelve to the end. The
 * order is kept as typed, so `3,1` really does put page three first, and a
 * page asked for twice is given twice.
 *
 * @throws PageRangeError when the text cannot be read, or names a page the
 * document does not have.
 */
export function parsePageRange(input: string, total: number): number[] {
  if (total < 1) {
    throw new PageRangeError("That document has no pages.");
  }

  const text = input.trim();

  if (text === "") {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: number[] = [];

  for (const piece of text.split(",")) {
    const part = piece.trim();

    if (part === "") {
      continue;
    }

    const found = PART.exec(part);

    if (!found || (!found[1] && !found[3])) {
      throw new PageRangeError(
        `"${part}" is not a page or a range, such as 2 or 4-7.`,
      );
    }

    const dash = found[2] === "-";
    const first = found[1] ? Number(found[1]) : 1;
    const last = dash ? (found[3] ? Number(found[3]) : total) : first;

    if (!dash && found[3]) {
      throw new PageRangeError(`"${part}" is not a page or a range.`);
    }

    check(first, total, part);
    check(last, total, part);

    if (last < first) {
      throw new PageRangeError(`"${part}" counts backwards.`);
    }

    for (let page = first; page <= last; page += 1) {
      pages.push(page);
    }
  }

  if (pages.length === 0) {
    throw new PageRangeError("Name at least one page.");
  }

  return pages;
}

function check(page: number, total: number, part: string): void {
  if (!Number.isInteger(page) || page < 1) {
    throw new PageRangeError(`"${part}" is not a page number.`);
  }

  if (page > total) {
    const pages = total === 1 ? "1 page" : `${total} pages`;
    throw new PageRangeError(
      `There is no page ${page}, the file has ${pages}.`,
    );
  }
}

/** The shortest way to write a list of pages, so `1,2,3,7` reads as `1-3, 7`. */
export function formatPageRange(pages: readonly number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);

  if (sorted.length === 0) {
    return "";
  }

  const parts: string[] = [];
  let start = sorted[0] as number;
  let previous = start;

  for (const page of sorted.slice(1)) {
    if (page === previous + 1) {
      previous = page;
      continue;
    }

    parts.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = page;
    previous = page;
  }

  parts.push(start === previous ? `${start}` : `${start}-${previous}`);

  return parts.join(", ");
}
