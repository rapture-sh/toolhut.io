import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";

export const INDENT_WIDTHS = [2, 4] as const;

export type IndentWidth = (typeof INDENT_WIDTHS)[number];

/** Carries the line and column the XML validator reports, both 1-based. */
export class XmlParseError extends Error {
  readonly line?: number;
  readonly column?: number;

  constructor(message: string, line?: number, column?: number) {
    super(message);
    this.name = "XmlParseError";
    this.line = line;
    this.column = column;
  }
}

export interface XmlToJsonOptions {
  /** Spaces per level in the JSON that comes out. */
  indent: IndentWidth;
}

/** An attribute keeps its name behind an `@`, so `id="1"` becomes `"@id": "1"`. */
export const ATTRIBUTE_PREFIX = "@";

const TEXT_KEY = "#text";

const SHARED = {
  ignoreAttributes: false,
  attributeNamePrefix: ATTRIBUTE_PREFIX,
  textNodeName: TEXT_KEY,
};

/** Values stay text, because XML has no types and a zip code is not a number. */
const parser = new XMLParser({
  ...SHARED,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
});

const builder = new XMLBuilder({
  ...SHARED,
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function xmlToJson(input: string, { indent }: XmlToJsonOptions): string {
  if (input.trim() === "") {
    return "";
  }

  const checked = XMLValidator.validate(input, {
    allowBooleanAttributes: true,
  });

  if (checked !== true) {
    const { msg, line, col } = checked.err;
    const where =
      typeof col === "number"
        ? ` (line ${line}, column ${col})`
        : ` (line ${line})`;

    throw new XmlParseError(`${msg}${where}`, line, col);
  }

  const parsed: unknown = parser.parse(input);

  return JSON.stringify(parsed, null, indent);
}

export function jsonToXml(input: string): string {
  if (input.trim() === "") {
    return "";
  }

  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    throw new XmlParseError(`That is not valid JSON. ${reason}`);
  }

  if (!isRecord(value)) {
    throw new XmlParseError(
      "XML needs one object at the top level, so a list or a single value cannot be converted.",
    );
  }

  const built: unknown = builder.build(value);

  return typeof built === "string" ? built.trimEnd() : "";
}
