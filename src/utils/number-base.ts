export const BASES = [2, 8, 10, 16] as const;

export type Base = (typeof BASES)[number];

export class BaseConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BaseConversionError";
  }
}

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

const PREFIXES: Record<number, string> = { 2: "0b", 8: "0o", 16: "0x" };

/** Accepts an optional 0b/0o/0x prefix, underscores and spaces as grouping. */
export function parseInBase(value: string, base: number): bigint {
  const prefix = PREFIXES[base];
  let cleaned = value.trim().toLowerCase().replace(/[_\s]/g, "");

  const negative = cleaned.startsWith("-");
  if (negative) {
    cleaned = cleaned.slice(1);
  }

  if (prefix && cleaned.startsWith(prefix)) {
    cleaned = cleaned.slice(prefix.length);
  }

  if (cleaned === "") {
    throw new BaseConversionError("Enter a number first.");
  }

  const allowed = DIGITS.slice(0, base);
  let result = 0n;

  for (const char of cleaned) {
    const digit = allowed.indexOf(char);
    if (digit === -1) {
      throw new BaseConversionError(
        `"${char}" is not a digit in base ${base}.`,
      );
    }
    result = result * BigInt(base) + BigInt(digit);
  }

  return negative ? -result : result;
}

export function formatInBase(value: bigint, base: number): string {
  return value.toString(base);
}

export function convertBase(value: string, from: number, to: number): string {
  return formatInBase(parseInBase(value, from), to);
}

/** Every base at once, which is how the tool shows its result. */
export function toAllBases(value: string, from: number): Record<Base, string> {
  const parsed = parseInBase(value, from);

  return {
    2: formatInBase(parsed, 2),
    8: formatInBase(parsed, 8),
    10: formatInBase(parsed, 10),
    16: formatInBase(parsed, 16),
  };
}
