export type DiffType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffType;
  text: string;
  /** 1-based line number on the left, absent for an added line. */
  left?: number;
  /** 1-based line number on the right, absent for a removed line. */
  right?: number;
}

export interface DiffSummary {
  added: number;
  removed: number;
  unchanged: number;
}

/**
 * A line by line diff built on the longest common subsequence. The table is
 * O(n*m), which is fine for the sizes a person pastes into a text box.
 */
export function diffLines(left: string, right: string): DiffLine[] {
  const a = left === "" ? [] : left.split("\n");
  const b = right === "" ? [] : right.split("\n");

  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );

  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] =
        a[i] === b[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      lines.push({ type: "unchanged", text: a[i], left: i + 1, right: j + 1 });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      lines.push({ type: "removed", text: a[i], left: i + 1 });
      i += 1;
    } else {
      lines.push({ type: "added", text: b[j], right: j + 1 });
      j += 1;
    }
  }

  while (i < a.length) {
    lines.push({ type: "removed", text: a[i], left: i + 1 });
    i += 1;
  }

  while (j < b.length) {
    lines.push({ type: "added", text: b[j], right: j + 1 });
    j += 1;
  }

  return lines;
}

export function summarise(lines: readonly DiffLine[]): DiffSummary {
  return {
    added: lines.filter((line) => line.type === "added").length,
    removed: lines.filter((line) => line.type === "removed").length,
    unchanged: lines.filter((line) => line.type === "unchanged").length,
  };
}
