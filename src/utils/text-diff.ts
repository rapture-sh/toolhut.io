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

/** One word, or one run of whitespace, with how it changed. */
export interface WordPart {
  type: DiffType;
  text: string;
}

/**
 * A line that was edited rather than purely added or removed, with the words
 * that changed inside it.
 */
export interface DiffRow {
  type: DiffType | "changed";
  left?: number;
  right?: number;
  text?: string;
  parts?: WordPart[];
}

/** The longest common subsequence table, walked back into a list of edits. */
function diffTokens<T>(a: readonly T[], b: readonly T[]) {
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

  const edits: { type: DiffType; value: T }[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      edits.push({ type: "unchanged", value: a[i] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      edits.push({ type: "removed", value: a[i] });
      i += 1;
    } else {
      edits.push({ type: "added", value: b[j] });
      j += 1;
    }
  }

  while (i < a.length) {
    edits.push({ type: "removed", value: a[i] });
    i += 1;
  }

  while (j < b.length) {
    edits.push({ type: "added", value: b[j] });
    j += 1;
  }

  return edits;
}

/**
 * A line by line diff. The table is O(n*m), which is fine for the sizes a
 * person pastes into a text box.
 */
export function diffLines(left: string, right: string): DiffLine[] {
  const a = left === "" ? [] : left.split("\n");
  const b = right === "" ? [] : right.split("\n");

  let leftNumber = 0;
  let rightNumber = 0;

  return diffTokens(a, b).map((edit) => {
    if (edit.type === "unchanged") {
      leftNumber += 1;
      rightNumber += 1;
      return {
        type: edit.type,
        text: edit.value,
        left: leftNumber,
        right: rightNumber,
      };
    }

    if (edit.type === "removed") {
      leftNumber += 1;
      return { type: edit.type, text: edit.value, left: leftNumber };
    }

    rightNumber += 1;
    return { type: edit.type, text: edit.value, right: rightNumber };
  });
}

/** Words and the whitespace between them, so a rebuilt line keeps its spacing. */
export function diffWords(left: string, right: string): WordPart[] {
  const tokenise = (value: string) =>
    value.split(/(\s+)/).filter((part) => part !== "");

  const parts: WordPart[] = [];

  for (const edit of diffTokens(tokenise(left), tokenise(right))) {
    const last = parts.at(-1);
    if (last && last.type === edit.type) {
      last.text += edit.value;
    } else {
      parts.push({ type: edit.type, text: edit.value });
    }
  }

  return parts;
}

/**
 * Turns the line diff into rows for display: a removal followed by an addition
 * is one edited line, which is what the inline view shows the words of.
 */
export function toRows(lines: readonly DiffLine[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.type === "removed") {
      const removed: DiffLine[] = [];
      while (lines[index]?.type === "removed") {
        removed.push(lines[index]);
        index += 1;
      }

      const added: DiffLine[] = [];
      while (lines[index]?.type === "added") {
        added.push(lines[index]);
        index += 1;
      }

      const paired = Math.min(removed.length, added.length);

      for (let step = 0; step < paired; step += 1) {
        rows.push({
          type: "changed",
          left: removed[step].left,
          right: added[step].right,
          text: added[step].text,
          parts: diffWords(removed[step].text, added[step].text),
        });
      }

      for (const extra of removed.slice(paired)) {
        rows.push({ type: "removed", text: extra.text, left: extra.left });
      }

      for (const extra of added.slice(paired)) {
        rows.push({ type: "added", text: extra.text, right: extra.right });
      }

      continue;
    }

    rows.push({
      type: line.type,
      text: line.text,
      left: line.left,
      right: line.right,
    });
    index += 1;
  }

  return rows;
}

export function summarise(lines: readonly DiffLine[]): DiffSummary {
  return {
    added: lines.filter((line) => line.type === "added").length,
    removed: lines.filter((line) => line.type === "removed").length,
    unchanged: lines.filter((line) => line.type === "unchanged").length,
  };
}
