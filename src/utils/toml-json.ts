import {
  parse as parseToml,
  stringify as stringifyToml,
  TomlError,
} from "smol-toml";

export const INDENT_WIDTHS = [2, 4] as const;

export type IndentWidth = (typeof INDENT_WIDTHS)[number];

/** Carries the line and column `smol-toml` reports, both 1-based. */
export class TomlParseError extends Error {
  readonly line?: number;
  readonly column?: number;

  constructor(message: string, line?: number, column?: number) {
    super(message);
    this.name = "TomlParseError";
    this.line = line;
    this.column = column;
  }
}

export interface TomlToJsonOptions {
  /** Spaces per level in the JSON that comes out. */
  indent: IndentWidth;
}

function firstLine(message: string): string {
  return message.split("\n", 1)[0] ?? message;
}

function position(line?: number, column?: number): string {
  return typeof line === "number" && typeof column === "number"
    ? ` (line ${line}, column ${column})`
    : "";
}

/**
 * A date or a time becomes its ISO text, which is the only shape JSON has for
 * it. Everything else TOML holds maps straight onto JSON.
 */
export function tomlToJson(
  input: string,
  { indent }: TomlToJsonOptions,
): string {
  if (input.trim() === "") {
    return "";
  }

  let value: unknown;
  try {
    value = parseToml(input);
  } catch (error) {
    if (error instanceof TomlError) {
      throw new TomlParseError(
        `${firstLine(error.message)}${position(error.line, error.column)}`,
        error.line,
        error.column,
      );
    }
    throw error;
  }

  return JSON.stringify(value, null, indent);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The path of the first null in the value, since TOML has no null at all. */
function findNull(value: unknown, path: string[] = []): string | null {
  if (value === null) {
    return path.join(".") || "the whole document";
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const found = findNull(item, [...path, String(index + 1)]);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      const found = findNull(item, [...path, key]);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function jsonToToml(input: string): string {
  if (input.trim() === "") {
    return "";
  }

  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    throw new TomlParseError(`That is not valid JSON. ${reason}`);
  }

  if (!isRecord(value)) {
    throw new TomlParseError(
      "TOML needs an object at the top level, so a list or a single value cannot be converted.",
    );
  }

  const nullAt = findNull(value);
  if (nullAt) {
    throw new TomlParseError(
      `TOML has no null, so "${nullAt}" cannot be written. Remove it or give it a value.`,
    );
  }

  try {
    return stringifyToml(value);
  } catch (error) {
    const reason = error instanceof Error ? firstLine(error.message) : "";
    throw new TomlParseError(`That JSON cannot be written as TOML. ${reason}`);
  }
}
