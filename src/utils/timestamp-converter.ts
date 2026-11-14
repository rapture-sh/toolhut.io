/** Thrown when input is not a timestamp, or not a date. */
export class UnixParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnixParseError";
  }
}

export type TimeUnit = "seconds" | "milliseconds";

export interface ConvertOptions {
  unit: TimeUnit;
  /** An IANA zone name, such as `UTC` or `Europe/Berlin`. */
  timeZone?: string;
}

/** The furthest a JavaScript date reaches either side of 1970. */
const MAX_TIME = 8.64e15;

const NUMBER = /^[+-]?\d+(\.\d+)?$/;

const WALL_CLOCK =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

const HAS_OFFSET = /([Zz]|[+-]\d{2}:?\d{2})$/;

export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatters.get(timeZone);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "shortOffset",
  });

  formatters.set(timeZone, formatter);

  return formatter;
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  offsetName: string;
}

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const found = new Map<string, string>();

  for (const part of partsFormatter(timeZone).formatToParts(date)) {
    found.set(part.type, part.value);
  }

  const number = (type: string) => Number(found.get(type) ?? "0");

  return {
    year: number("year"),
    month: number("month"),
    day: number("day"),
    hour: number("hour"),
    minute: number("minute"),
    second: number("second"),
    offsetName: tidyOffset(found.get("timeZoneName") ?? ""),
  };
}

/**
 * Browsers disagree on how to write no offset at all: some say `GMT`, others
 * `GMT+0` or `GMT+00:00`. They all mean the same thing, so they all read the
 * same here.
 */
function tidyOffset(name: string): string {
  return /^GMT[+-]0{1,2}(:00)?$/.test(name) ? "GMT" : name;
}

/**
 * How far the zone is from UTC at that instant, read from the browser's own
 * zone data rather than worked out by hand, so a summer time switch lands
 * where the zone says it does.
 */
function offsetMs(date: Date, timeZone: string): number {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

function fromWallClock(
  wall: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  },
  timeZone: string,
): Date {
  const asUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
    wall.millisecond,
  );

  const first = asUtc - offsetMs(new Date(asUtc), timeZone);
  const second = asUtc - offsetMs(new Date(first), timeZone);

  return new Date(second);
}

export function fromUnix(
  value: string | number,
  { unit }: ConvertOptions,
): Date {
  const text = String(value).trim();

  if (text === "") {
    throw new UnixParseError("Type a Unix timestamp, like 1700000000.");
  }

  if (!NUMBER.test(text)) {
    throw new UnixParseError(
      "A Unix timestamp is a plain number, like 1700000000.",
    );
  }

  const amount = Number(text);
  const milliseconds = unit === "seconds" ? amount * 1000 : amount;

  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > MAX_TIME) {
    throw new UnixParseError("That timestamp is further out than a date goes.");
  }

  return new Date(milliseconds);
}

export function toUnix(
  input: string,
  { unit, timeZone }: ConvertOptions,
): number {
  const date = parseDate(input, timeZone);

  return unit === "seconds"
    ? Math.floor(date.getTime() / 1000)
    : date.getTime();
}

const UNREADABLE =
  "That is not a date I can read. Try 2024-03-01, or 2024-03-01 09:30.";

/**
 * A date written as `2024-03-01`, `2024-03-01 09:30` or full ISO 8601. Without
 * an offset in the text itself, the wall clock is read in `timeZone`.
 */
export function parseDate(
  input: string,
  timeZone: string = localTimeZone(),
): Date {
  const text = input.trim();

  if (text === "") {
    throw new UnixParseError("Type a date, like 2024-03-01 09:30.");
  }

  if (HAS_OFFSET.test(text)) {
    const parsed = new Date(Date.parse(text));

    if (Number.isNaN(parsed.getTime())) {
      throw new UnixParseError(UNREADABLE);
    }

    return parsed;
  }

  const match = WALL_CLOCK.exec(text);

  if (!match) {
    throw new UnixParseError(UNREADABLE);
  }

  const [, year, month, day, hour, minute, second, fraction] = match;

  return fromWallClock(
    {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour ?? "0"),
      minute: Number(minute ?? "0"),
      second: Number(second ?? "0"),
      millisecond: Number((fraction ?? "0").padEnd(3, "0")),
    },
    timeZone,
  );
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["second", 1000],
  ["minute", 60_000],
  ["hour", 3_600_000],
  ["day", 86_400_000],
  ["month", 2_629_800_000],
  ["year", 31_557_600_000],
];

/** A phrase like `3 hours ago`, measured against the `now` the caller passes. */
export function relativePhrase(date: Date, now: Date): string {
  const difference = date.getTime() - now.getTime();
  const size = Math.abs(difference);

  let unit: Intl.RelativeTimeFormatUnit = "second";
  let step = 1000;

  for (const [candidate, length] of STEPS) {
    if (size >= length) {
      unit = candidate;
      step = length;
    }
  }

  return RELATIVE.format(Math.round(difference / step), unit);
}

export interface InstantDescription {
  /** ISO 8601 in UTC, as `toISOString` writes it. */
  iso: string;
  utc: string;
  /** The wall clock in the chosen zone, with that zone's offset. */
  local: string;
  relative: string;
  seconds: number;
  milliseconds: number;
}

export function describeInstant(
  date: Date,
  now: Date,
  timeZone: string = localTimeZone(),
): InstantDescription {
  if (Number.isNaN(date.getTime())) {
    throw new UnixParseError("That is not a date I can describe.");
  }

  const parts = zonedParts(date, timeZone);
  const pad = (value: number, width = 2) => String(value).padStart(width, "0");

  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)} (${parts.offsetName})`,
    relative: relativePhrase(date, now),
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
  };
}
