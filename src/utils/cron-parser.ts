import { CronExpressionParser } from "cron-parser";
import { toString as describeExpression } from "cronstrue";

/** Thrown when an expression is not a schedule either reader can follow. */
export class CronParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CronParseError";
  }
}

/** The five fields of a crontab line, in the order they are written. */
export const CRON_FIELD_LABELS = [
  "Minute",
  "Hour",
  "Day of month",
  "Month",
  "Day of week",
] as const;

export interface CronPreset {
  label: string;
  expression: string;
}

export const CRON_PRESETS: readonly CronPreset[] = [
  { label: "Every minute", expression: "* * * * *" },
  { label: "Every hour", expression: "0 * * * *" },
  { label: "Every night at midnight", expression: "0 0 * * *" },
  { label: "Every Monday at 9", expression: "0 9 * * MON" },
  { label: "First of the month", expression: "0 0 1 * *" },
] as const;

const EMPTY = "Type a cron expression, like 0 9 * * 1.";

const TOO_FEW =
  "A cron expression has five fields: minute, hour, day of month, month and day of week.";

function fields(expression: string): string[] {
  return expression
    .trim()
    .split(/\s+/)
    .filter((field) => field !== "");
}

/** One token per field, padded out with blanks while it is half typed. */
export function cronFields(expression: string): string[] {
  const written = fields(expression);

  return CRON_FIELD_LABELS.map((_, index) => written[index] ?? "");
}

function check(expression: string): string {
  const trimmed = expression.trim();

  if (trimmed === "") {
    throw new CronParseError(EMPTY);
  }

  if (fields(trimmed).length < CRON_FIELD_LABELS.length) {
    throw new CronParseError(TOO_FEW);
  }

  return trimmed;
}

function reason(error: unknown): string {
  return error instanceof Error && error.message !== ""
    ? error.message
    : "It has a field this reader cannot follow.";
}

/** The schedule as a sentence, such as `Every 15 minutes`. */
export function explainCron(expression: string): string {
  const trimmed = check(expression);

  try {
    return describeExpression(trimmed, {
      throwExceptionOnParseError: true,
      verbose: false,
      use24HourTimeFormat: true,
    });
  } catch (error) {
    throw new CronParseError(
      `That cron expression is not valid. ${reason(error)}`,
    );
  }
}

export interface NextRunsOptions {
  /** How many runs to look ahead. */
  count?: number;
  /** Where counting starts, so a caller is never at the mercy of the clock. */
  now: Date;
  /** An IANA zone name. The expression is read in this zone. */
  timeZone?: string;
}

export function nextRuns(
  expression: string,
  { count = 5, now, timeZone }: NextRunsOptions,
): Date[] {
  const trimmed = check(expression);

  try {
    const schedule = CronExpressionParser.parse(trimmed, {
      currentDate: now,
      tz: timeZone,
    });

    return schedule.take(count).map((run) => run.toDate());
  } catch (error) {
    throw new CronParseError(
      `That cron expression is not valid. ${reason(error)}`,
    );
  }
}
