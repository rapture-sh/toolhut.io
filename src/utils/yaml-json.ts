import {
  parse as parseYaml,
  stringify as stringifyYaml,
  YAMLParseError,
} from "yaml";

export const INDENT_WIDTHS = [2, 4] as const;

export type IndentWidth = (typeof INDENT_WIDTHS)[number];

/** Carries the line and column `yaml` reports, both 1-based. */
export class YamlParseError extends Error {
  readonly line?: number;
  readonly column?: number;

  constructor(message: string, line?: number, column?: number) {
    super(message);
    this.name = "YamlParseError";
    this.line = line;
    this.column = column;
  }
}

export interface YamlToJsonOptions {
  /** Spaces per level in the JSON that comes out. */
  indent: IndentWidth;
}

function firstLine(message: string): string {
  const line = message.split("\n", 1)[0] ?? message;

  return line.replace(/:$/, ".");
}

function fromYamlError(error: YAMLParseError): YamlParseError {
  const position = error.linePos?.[0];

  if (error.code === "MULTIPLE_DOCS") {
    return new YamlParseError(
      "This YAML holds more than one document, and JSON can only hold one.",
      position?.line,
      position?.col,
    );
  }

  return new YamlParseError(
    firstLine(error.message),
    position?.line,
    position?.col,
  );
}

export function yamlToJson(
  input: string,
  { indent }: YamlToJsonOptions,
): string {
  if (input.trim() === "") {
    return "";
  }

  let value: unknown;
  try {
    value = parseYaml(input);
  } catch (error) {
    if (error instanceof YAMLParseError) {
      throw fromYamlError(error);
    }
    throw error;
  }

  return JSON.stringify(value, null, indent);
}

/** Long strings are left on one line, so nothing is reflowed behind your back. */
export function jsonToYaml(input: string): string {
  if (input.trim() === "") {
    return "";
  }

  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    throw new YamlParseError(`That is not valid JSON. ${reason}`);
  }

  return stringifyYaml(value, { lineWidth: 0 });
}
