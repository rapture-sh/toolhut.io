/** Thrown when a pattern or its flags cannot be compiled. */
export class RegexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegexError";
  }
}

export interface RegexGroup {
  /** 1-based, in the order the groups open in the pattern. */
  number: number;
  /** The name from `(?<name>...)`, or null when the group has none. */
  name: string | null;
  /** null when the group took no part in the match. */
  value: string | null;
}

export interface RegexMatch {
  /** Where the match starts, counted in UTF-16 code units. */
  index: number;
  text: string;
  groups: RegexGroup[];
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

export function compileRegex(pattern: string, flags = ""): RegExp {
  if (pattern === "") {
    throw new RegexError("Enter a pattern to match.");
  }

  try {
    return new RegExp(pattern, flags);
  } catch (error) {
    throw new RegexError(
      error instanceof Error
        ? error.message
        : "That is not a valid regular expression.",
    );
  }
}

/**
 * Every match in the text, whether or not the pattern carries `g`, and
 * without moving the `lastIndex` of the regex it was handed.
 *
 * @param limit stops the scan, so a pattern that matches everywhere in a
 * large document cannot lock up the page.
 */
export function findMatches(
  regex: RegExp,
  text: string,
  limit = 500,
): RegexMatch[] {
  if (text === "" || limit <= 0) {
    return [];
  }

  const scan = new RegExp(regex.source, withGlobal(regex.flags));
  const names = groupNames(regex.source);
  const matches: RegexMatch[] = [];

  let result = scan.exec(text);
  while (result !== null && matches.length < limit) {
    matches.push({
      index: result.index,
      text: result[0],
      groups: toGroups(result, names),
    });

    if (result[0] === "") {
      scan.lastIndex += stepFrom(text, scan.lastIndex, scan.unicode);
    }

    if (scan.lastIndex > text.length) {
      break;
    }

    result = scan.exec(text);
  }

  return matches;
}

/** Replaces every match, so the result agrees with what `findMatches` lists. */
export function replaceMatches(
  regex: RegExp,
  text: string,
  replacement: string,
): string {
  return text.replace(
    new RegExp(regex.source, withGlobal(regex.flags)),
    replacement,
  );
}

/**
 * The text cut into matched and unmatched runs, in order, so a caller can
 * draw it with the matches picked out. Zero length matches are left out:
 * there is nothing of them to show.
 */
export function splitByMatches(
  text: string,
  matches: readonly RegexMatch[],
): HighlightPart[] {
  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.text === "" || match.index < cursor) {
      continue;
    }

    if (match.index > cursor) {
      parts.push({ text: text.slice(cursor, match.index), match: false });
    }

    parts.push({ text: match.text, match: true });
    cursor = match.index + match.text.length;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), match: false });
  }

  return parts;
}

function withGlobal(flags: string): string {
  return flags.includes("g") ? flags : `${flags}g`;
}

/** A zero length match would otherwise be found again at the same place. */
function stepFrom(text: string, index: number, unicodeAware: boolean): number {
  if (!unicodeAware) {
    return 1;
  }

  const code = text.codePointAt(index);

  return code !== undefined && code > 0xffff ? 2 : 1;
}

function toGroups(
  result: RegExpExecArray,
  names: readonly (string | null)[],
): RegexGroup[] {
  const groups: RegexGroup[] = [];

  for (let index = 1; index < result.length; index += 1) {
    const value = result[index];
    groups.push({
      number: index,
      name: names[index - 1] ?? null,
      value: value === undefined ? null : value,
    });
  }

  return groups;
}

const NAMED_GROUP = /^\(\?<([A-Za-z_$][\w$]*)>/;

/** The name of each capturing group by position, so a match can be labelled. */
function groupNames(source: string): (string | null)[] {
  const names: (string | null)[] = [];
  let inClass = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === "\\") {
      index += 1;
      continue;
    }

    if (inClass) {
      if (character === "]") {
        inClass = false;
      }
      continue;
    }

    if (character === "[") {
      inClass = true;
      continue;
    }

    if (character !== "(") {
      continue;
    }

    if (source[index + 1] !== "?") {
      names.push(null);
      continue;
    }

    const named = NAMED_GROUP.exec(source.slice(index));
    if (named) {
      names.push(named[1]);
    }
  }

  return names;
}
