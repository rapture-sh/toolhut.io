import { format, type SqlLanguage } from "sql-formatter";

/** The label each dialect carries, against the name sql-formatter knows it by. */
export const SQL_DIALECTS = [
  { value: "sql", label: "Standard SQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "bigquery", label: "BigQuery" },
  { value: "transactsql", label: "T-SQL" },
] as const satisfies readonly { value: SqlLanguage; label: string }[];

export type SqlDialect = (typeof SQL_DIALECTS)[number]["value"];

export const KEYWORD_CASES = ["upper", "preserve"] as const;

export type SqlKeywordCase = (typeof KEYWORD_CASES)[number];

export const TAB_WIDTHS = [2, 4] as const;

export type TabWidth = (typeof TAB_WIDTHS)[number];

export class SqlFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SqlFormatError";
  }
}

export interface FormatSqlOptions {
  dialect: SqlDialect;
  /** `preserve` leaves every keyword as it was typed. */
  keywordCase: SqlKeywordCase;
  /** Spaces per level of indentation. */
  tabWidth: TabWidth;
}

const PARSE_PREFIX = /^Parse error(?: at token)?:\s*/;

function explain(error: unknown): string {
  if (!(error instanceof Error)) {
    return "That query could not be formatted.";
  }

  const first = error.message.split("\n", 1)[0] ?? error.message;
  const detail = first
    .replace(PARSE_PREFIX, "")
    .replace(/^«EOF»\s*/, "the query ends too early, ");

  return `That is not valid SQL for this dialect. ${detail}`;
}

export function formatSql(
  input: string,
  { dialect, keywordCase, tabWidth }: FormatSqlOptions,
): string {
  if (input.trim() === "") {
    return "";
  }

  try {
    return format(input, { language: dialect, keywordCase, tabWidth });
  } catch (error) {
    throw new SqlFormatError(explain(error));
  }
}

const QUOTES = new Set(["'", '"', "`"]);

const NO_SPACE_BEFORE = new Set([",", ";", ")"]);

const NO_SPACE_AFTER = new Set(["("]);

function placeOf(input: string, index: number): string {
  const before = input.slice(0, index);
  const line = before.split("\n").length;
  const column = index - (before.lastIndexOf("\n") + 1) + 1;

  return `line ${line}, column ${column}`;
}

/**
 * Walks the quote to its end, where a doubled quote is an escaped one, as
 * standard SQL has it. Returns the index just past the closing quote.
 */
function endOfString(input: string, start: number): number {
  const quote = input[start];

  for (let at = start + 1; at < input.length; at += 1) {
    if (input[at] !== quote) {
      continue;
    }
    if (input[at + 1] === quote) {
      at += 1;
      continue;
    }
    return at + 1;
  }

  throw new SqlFormatError(
    `A quoted string opens at ${placeOf(input, start)} and is never closed.`,
  );
}

/** One line, with comments dropped and every string literal left untouched. */
export function minifySql(input: string): string {
  let result = "";
  let spaced = false;
  let at = 0;

  const append = (text: string) => {
    if (result === "") {
      result = text;
      spaced = false;
      return;
    }

    const gap =
      spaced &&
      !NO_SPACE_BEFORE.has(text[0] ?? "") &&
      !NO_SPACE_AFTER.has(result[result.length - 1] ?? "");

    result += gap ? ` ${text}` : text;
    spaced = false;
  };

  while (at < input.length) {
    const char = input[at] ?? "";

    if (/\s/.test(char)) {
      spaced = true;
      at += 1;
      continue;
    }

    if (char === "-" && input[at + 1] === "-") {
      const end = input.indexOf("\n", at);
      at = end === -1 ? input.length : end;
      spaced = true;
      continue;
    }

    if (char === "/" && input[at + 1] === "*") {
      const end = input.indexOf("*/", at + 2);
      if (end === -1) {
        throw new SqlFormatError(
          `A comment opens at ${placeOf(input, at)} and is never closed.`,
        );
      }
      at = end + 2;
      spaced = true;
      continue;
    }

    if (QUOTES.has(char)) {
      const end = endOfString(input, at);
      append(input.slice(at, end));
      at = end;
      continue;
    }

    append(char);
    at += 1;
  }

  return result;
}
