import { type ParseError, parse, unparse } from "papaparse";

export const CSV_DELIMITERS = ["auto", ",", ";", "\t", "|"] as const;

export type CsvDelimiter = (typeof CSV_DELIMITERS)[number];

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

export interface CsvToJsonOptions {
  /** With this off every row comes back as an array of cells, not an object. */
  header: boolean;
  delimiter: CsvDelimiter;
}

export interface JsonToCsvOptions {
  delimiter: CsvDelimiter;
}

type Cell = string | number | boolean | null;

type ObjectRow = Record<string, Cell>;

const JSON_INDENT = 2;

/** A file with a single column has no delimiter to find, and still parses. */
const NO_DELIMITER_FOUND = "UndetectableDelimiter";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCell(value: unknown): value is Cell {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function rowProblem(error: ParseError): string {
  return typeof error.row === "number"
    ? `Row ${error.row + 1}: ${error.message}.`
    : `${error.message}.`;
}

/**
 * Numbers and booleans come back as numbers and booleans, which is what
 * anything reading the JSON expects.
 */
export function csvToJson(
  input: string,
  { header, delimiter }: CsvToJsonOptions,
): string {
  if (input.trim() === "") {
    return "";
  }

  const result = parse<unknown>(input, {
    header,
    delimiter: delimiter === "auto" ? "" : delimiter,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const problem = result.errors.find(
    (error) => error.code !== NO_DELIMITER_FOUND,
  );

  if (problem) {
    throw new CsvParseError(rowProblem(problem));
  }

  return JSON.stringify(result.data, null, JSON_INDENT);
}

function readJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    throw new CsvParseError(`That is not valid JSON. ${reason}`);
  }
}

function cellsOf(row: Record<string, unknown>, position: number): ObjectRow {
  const cells: ObjectRow = {};

  for (const [key, value] of Object.entries(row)) {
    if (!isCell(value)) {
      throw new CsvParseError(
        `Row ${position}, column "${key}" holds ${
          Array.isArray(value) ? "a list" : "an object"
        }, and a cell can only hold one value.`,
      );
    }
    cells[key] = value;
  }

  return cells;
}

function arrayCellsOf(row: unknown[], position: number): Cell[] {
  return row.map((value, index) => {
    if (!isCell(value)) {
      throw new CsvParseError(
        `Row ${position}, column ${index + 1} holds ${
          Array.isArray(value) ? "a list" : "an object"
        }, and a cell can only hold one value.`,
      );
    }
    return value;
  });
}

function fieldsOf(rows: readonly ObjectRow[]): string[] {
  const fields: string[] = [];

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!fields.includes(key)) {
        fields.push(key);
      }
    }
  }

  return fields;
}

/** Keeps every column any row has, so a ragged array of objects loses nothing. */
export function jsonToCsv(
  input: string,
  { delimiter }: JsonToCsvOptions,
): string {
  if (input.trim() === "") {
    return "";
  }

  const parsed = readJson(input);
  const rows: unknown[] = Array.isArray(parsed) ? parsed : [parsed];

  if (rows.length === 0) {
    return "";
  }

  const config = {
    delimiter: delimiter === "auto" ? "," : delimiter,
    newline: "\n",
  };

  if (rows.every((row): row is unknown[] => Array.isArray(row))) {
    return unparse<Cell[]>(
      rows.map((row, index) => arrayCellsOf(row, index + 1)),
      config,
    );
  }

  if (!rows.every(isRecord)) {
    throw new CsvParseError(
      "A CSV needs an array of objects, or an array of arrays. One of these rows is neither.",
    );
  }

  const data = rows.map((row, index) => cellsOf(row, index + 1));

  return unparse<ObjectRow>({ fields: fieldsOf(data), data }, config);
}
