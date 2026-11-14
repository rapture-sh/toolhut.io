export type JsonIndent = 2 | 4 | "tab";

export interface FormatJsonOptions {
  indent?: JsonIndent;
  sortKeys?: boolean;
}

/**
 * Thrown when input is not JSON. `line` and `column` are 1-based and point at
 * the character the parser gave up on, so the message can name the place.
 */
export class JsonParseError extends Error {
  readonly line: number;
  readonly column: number;

  constructor(reason: string, line: number, column: number) {
    super(`Line ${line}, column ${column}: ${reason}`);
    this.name = "JsonParseError";
    this.line = line;
    this.column = column;
  }
}

export function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const { line, column } = locate(error.message, input);
      throw new JsonParseError(reasonFrom(error.message), line, column);
    }

    throw error;
  }
}

export function formatJson(
  input: string,
  { indent = 2, sortKeys = false }: FormatJsonOptions = {},
): string {
  if (input.trim() === "") {
    return "";
  }

  const value = parseJson(input);

  return JSON.stringify(
    sortKeys ? withSortedKeys(value) : value,
    null,
    indent === "tab" ? "\t" : indent,
  );
}

export function minifyJson(input: string): string {
  if (input.trim() === "") {
    return "";
  }

  return JSON.stringify(parseJson(input));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withSortedKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(withSortedKeys);
  }

  if (isRecord(value)) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = withSortedKeys(value[key]);
    }
    return sorted;
  }

  return value;
}

function placeAt(
  input: string,
  offset: number,
): { line: number; column: number } {
  const clamped = Math.min(Math.max(offset, 0), input.length);
  const before = input.slice(0, clamped);
  const lastBreak = before.lastIndexOf("\n");

  return {
    line: before.split("\n").length,
    column: clamped - lastBreak,
  };
}

function locate(
  message: string,
  input: string,
): { line: number; column: number } {
  const offset = /position (\d+)/.exec(message);
  if (offset) {
    return placeAt(input, Number(offset[1]));
  }

  const place = /line (\d+) column (\d+)/.exec(message);
  if (place) {
    return { line: Number(place[1]), column: Number(place[2]) };
  }

  return placeAt(input, offsetOfToken(message, input));
}

/**
 * Some engines report the offending token with a snippet of the document
 * instead of a position, so the token is looked for inside that snippet.
 */
function offsetOfToken(message: string, input: string): number {
  const token = /Unexpected token '(.)'/.exec(message);
  if (!token) {
    return input.length;
  }

  const snippet = /"([\s\S]*)" is not valid JSON/.exec(message);
  const window = snippet
    ? snippet[1].replace(/^\.{3}/, "").replace(/\.{3}$/, "")
    : "";
  const start = window === "" ? -1 : input.indexOf(window);
  const found = input.indexOf(token[1], Math.max(start, 0));

  return found === -1 ? input.length : found;
}

function reasonFrom(message: string): string {
  const cleaned = message
    .replace(/^JSON\.parse:\s*/, "")
    .replace(/\s*in JSON at position \d+[\s\S]*$/, "")
    .replace(/\s*at line \d+ column \d+ of the JSON data\.?$/, "")
    .replace(/,\s*(?:\.{3})?"[\s\S]*" is not valid JSON\.?$/, "")
    .replace(/^"[\s\S]*" is not valid JSON\.?$/, "")
    .replace(/\.$/, "")
    .trim();

  if (cleaned === "") {
    return "that is not valid JSON";
  }

  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}
