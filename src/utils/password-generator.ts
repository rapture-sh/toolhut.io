export const PASSWORD_LENGTH_RANGE = { min: 8, max: 128 } as const;

export const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

/** Characters that are easy to confuse once a password is written down. */
const AMBIGUOUS = new Set("iIlLoO01");

/** A ceiling well above the slider, so a pasted number cannot hang the page. */
const MAX_LENGTH = 1024;

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}

/** Thrown when the chosen options cannot produce a password. */
export class PasswordOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordOptionsError";
  }
}

/** Injected so tests can pin the bytes. */
export type RandomBytes = (length: number) => Uint8Array;

const platformRandomBytes: RandomBytes = (length) =>
  crypto.getRandomValues(new Uint8Array(length));

type NextByte = () => number;

function byteReader(randomBytes: RandomBytes, block = 64): NextByte {
  let buffer: Uint8Array = new Uint8Array(0);
  let next = 0;

  return () => {
    if (next >= buffer.length) {
      buffer = randomBytes(block);
      next = 0;
    }
    const byte = buffer[next];
    next += 1;
    return byte;
  };
}

/**
 * A number below `limit`, drawn uniformly. Values in the ragged tail of the
 * byte range are thrown away instead of folded with a modulo, which would
 * make the start of the alphabet more likely than the end.
 */
function randomIndex(limit: number, nextByte: NextByte): number {
  if (limit <= 1) {
    return 0;
  }

  const width = limit <= 256 ? 1 : 2;
  const range = 256 ** width;
  const ceiling = Math.floor(range / limit) * limit;

  for (;;) {
    let value = 0;
    for (let drawn = 0; drawn < width; drawn += 1) {
      value = value * 256 + nextByte();
    }
    if (value < ceiling) {
      return value % limit;
    }
  }
}

function pickCharacter(pool: string, nextByte: NextByte): string {
  return pool.charAt(randomIndex(pool.length, nextByte));
}

function shuffle(characters: string[], nextByte: NextByte): void {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1, nextByte);
    const held = characters[index];
    characters[index] = characters[swap];
    characters[swap] = held;
  }
}

function choosePools(options: PasswordOptions): string[] {
  const wanted = [
    options.lowercase ? LOWERCASE : "",
    options.uppercase ? UPPERCASE : "",
    options.digits ? DIGITS : "",
    options.symbols ? SYMBOLS : "",
  ];

  return wanted
    .map((pool) =>
      options.avoidAmbiguous
        ? [...pool].filter((character) => !AMBIGUOUS.has(character)).join("")
        : pool,
    )
    .filter((pool) => pool !== "");
}

/**
 * A password holding at least one character from every set that is on.
 *
 * @throws PasswordOptionsError when every set is off, or the length is too
 * short to hold one character from each set that is on.
 */
export function generatePassword(
  options: PasswordOptions,
  randomBytes: RandomBytes = platformRandomBytes,
): string {
  const { length } = options;

  if (!Number.isInteger(length) || length < 1) {
    throw new PasswordOptionsError(
      "Choose a length of at least one character.",
    );
  }

  if (length > MAX_LENGTH) {
    throw new PasswordOptionsError(
      `Choose a length of ${MAX_LENGTH} characters or fewer.`,
    );
  }

  const pools = choosePools(options);

  if (pools.length === 0) {
    throw new PasswordOptionsError("Turn on at least one kind of character.");
  }

  if (length < pools.length) {
    const unit = length === 1 ? "character" : "characters";
    throw new PasswordOptionsError(
      `A password of ${length} ${unit} cannot hold one from each of the ${pools.length} sets you chose. Use ${pools.length} characters or more, or turn a set off.`,
    );
  }

  const nextByte = byteReader(randomBytes);
  const alphabet = pools.join("");
  const characters = pools.map((pool) => pickCharacter(pool, nextByte));

  while (characters.length < length) {
    characters.push(pickCharacter(alphabet, nextByte));
  }

  shuffle(characters, nextByte);

  return characters.join("");
}

export const PASSWORD_STRENGTHS = [
  "weak",
  "fair",
  "strong",
  "very strong",
] as const;

export type PasswordStrength = (typeof PASSWORD_STRENGTHS)[number];

export interface PasswordStrengthReport {
  /** How many characters the password could have been drawn from. */
  alphabet: number;
  /** Entropy in bits, assuming every character was drawn at random. */
  bits: number;
  label: PasswordStrength;
}

function strengthLabel(bits: number): PasswordStrength {
  if (bits < 40) {
    return "weak";
  }
  if (bits < 60) {
    return "fair";
  }
  if (bits < 80) {
    return "strong";
  }
  return "very strong";
}

/** Entropy read off the sets the password's own characters belong to. */
export function passwordStrength(password: string): PasswordStrengthReport {
  let alphabet = 0;

  if (/[a-z]/.test(password)) {
    alphabet += LOWERCASE.length;
  }
  if (/[A-Z]/.test(password)) {
    alphabet += UPPERCASE.length;
  }
  if (/[0-9]/.test(password)) {
    alphabet += DIGITS.length;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    alphabet += SYMBOLS.length;
  }

  const bits = alphabet === 0 ? 0 : password.length * Math.log2(alphabet);

  return {
    alphabet,
    bits: Math.round(bits * 10) / 10,
    label: strengthLabel(bits),
  };
}
