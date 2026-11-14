/** Thrown when a token cannot be read as three base64url JSON parts. */
export class JwtDecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JwtDecodeError";
  }
}

export type JwtClaims = Record<string, unknown>;

export interface DecodedJwt {
  header: JwtClaims;
  payload: JwtClaims;
  /** The third part, still encoded. Reading it needs the signing key. */
  signature: string;
  /** The token as it was decoded, with whitespace and `Bearer` removed. */
  raw: string;
}

const BASE64URL = /^[A-Za-z0-9_-]+$/;

function decodeSegment(segment: string, name: string): JwtClaims {
  if (segment === "") {
    throw new JwtDecodeError(`The ${name} of this token is empty.`);
  }

  if (!BASE64URL.test(segment)) {
    throw new JwtDecodeError(
      `The ${name} of this token is not base64url text, so it cannot be decoded.`,
    );
  }

  const padding = "=".repeat((4 - (segment.length % 4)) % 4);
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/") + padding;

  let text: string;
  try {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new JwtDecodeError(
      `The ${name} of this token is not base64url text, so it cannot be decoded.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new JwtDecodeError(`The ${name} of this token is not JSON.`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new JwtDecodeError(
      `The ${name} of this token is JSON, but not a JSON object.`,
    );
  }

  return parsed as JwtClaims;
}

/**
 * Splits a token and reads its header and payload. A leading `Bearer` and any
 * whitespace are ignored, since tokens are usually copied out of a header.
 *
 * @throws JwtDecodeError when the token is not three parts, when a part is not
 * base64url, or when a part does not hold a JSON object.
 */
export function decodeJwt(token: string): DecodedJwt {
  const raw = token.replace(/^\s*bearer\s+/i, "").replace(/\s+/g, "");

  if (raw === "") {
    throw new JwtDecodeError("There is no token here. Paste one to decode it.");
  }

  const parts = raw.split(".");

  if (parts.length !== 3) {
    throw new JwtDecodeError(
      `A JSON web token has three parts separated by dots. This one has ${parts.length}.`,
    );
  }

  const [header, payload, signature] = parts;

  if (signature !== "" && !BASE64URL.test(signature)) {
    throw new JwtDecodeError(
      "The signature of this token is not base64url text.",
    );
  }

  return {
    header: decodeSegment(header, "header"),
    payload: decodeSegment(payload, "payload"),
    signature,
    raw,
  };
}

export function formatJson(claims: JwtClaims): string {
  return JSON.stringify(claims, null, 2);
}

/** Epoch seconds from a numeric claim, or null when it is missing or not a number. */
function secondsClaim(claims: JwtClaims, name: string): number | null {
  const value = claims[name];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

const DURATIONS = [
  { ms: 86_400_000, unit: "day" },
  { ms: 3_600_000, unit: "hour" },
  { ms: 60_000, unit: "minute" },
  { ms: 1000, unit: "second" },
] as const;

function formatDuration(milliseconds: number): string {
  const size = Math.abs(milliseconds);

  for (const step of DURATIONS) {
    if (size >= step.ms) {
      const amount = Math.floor(size / step.ms);
      return `${amount} ${step.unit}${amount === 1 ? "" : "s"}`;
    }
  }

  return "less than a second";
}

/** UTC, so a token reads the same wherever it is opened. */
function formatInstant(seconds: number): string {
  const date = new Date(seconds * 1000);

  if (Number.isNaN(date.getTime())) {
    return "not a usable date";
  }

  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

export type JwtValidity = "valid" | "expired" | "early" | "unknown";

/** True from the moment `exp` passes, so `now === exp` already counts. */
export function isExpired(claims: JwtClaims, now = Date.now()): boolean {
  const exp = secondsClaim(claims, "exp");
  return exp !== null && now >= exp * 1000;
}

export function tokenValidity(
  claims: JwtClaims,
  now = Date.now(),
): JwtValidity {
  const exp = secondsClaim(claims, "exp");
  const nbf = secondsClaim(claims, "nbf");

  if (isExpired(claims, now)) {
    return "expired";
  }

  if (nbf !== null && now < nbf * 1000) {
    return "early";
  }

  return exp === null && nbf === null ? "unknown" : "valid";
}

export interface ClaimRow {
  /** The claim name as it appears in the payload. */
  claim: string;
  label: string;
  value: string;
  /** What the claim means right now, such as how long is left. */
  note?: string;
  /** True when the claim is why the token cannot be used. */
  problem: boolean;
}

const TEXT_CLAIMS = [
  { claim: "iss", label: "Issuer" },
  { claim: "sub", label: "Subject" },
  { claim: "aud", label: "Audience" },
] as const;

function textValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  return typeof value === "object" && value !== null
    ? JSON.stringify(value)
    : String(value);
}

function timeRow(
  claims: JwtClaims,
  claim: string,
  label: string,
  now: number,
  note: (difference: number) => { text: string; problem: boolean },
): ClaimRow | null {
  if (!(claim in claims)) {
    return null;
  }

  const seconds = secondsClaim(claims, claim);

  if (seconds === null) {
    return {
      claim,
      label,
      value: textValue(claims[claim]),
      note: "not a number of seconds, so it cannot be read as a time",
      problem: true,
    };
  }

  const described = note(seconds * 1000 - now);

  return {
    claim,
    label,
    value: formatInstant(seconds),
    note: described.text,
    problem: described.problem,
  };
}

/**
 * The claims people actually look for, in the order they are usually read.
 * `now` is epoch milliseconds and comes in so the rows can be tested.
 */
export function describeClaims(
  claims: JwtClaims,
  now = Date.now(),
): ClaimRow[] {
  const rows: ClaimRow[] = [];

  for (const known of TEXT_CLAIMS) {
    if (known.claim in claims) {
      rows.push({
        claim: known.claim,
        label: known.label,
        value: textValue(claims[known.claim]),
        problem: false,
      });
    }
  }

  const issued = timeRow(claims, "iat", "Issued at", now, (difference) => ({
    text:
      difference > 0
        ? `in ${formatDuration(difference)}, which is in the future`
        : `${formatDuration(difference)} ago`,
    problem: false,
  }));

  const notBefore = timeRow(
    claims,
    "nbf",
    "Not valid before",
    now,
    (difference) => ({
      text:
        difference > 0
          ? `not valid for another ${formatDuration(difference)}`
          : `valid since ${formatDuration(difference)} ago`,
      problem: difference > 0,
    }),
  );

  const expires = timeRow(claims, "exp", "Expires", now, (difference) => ({
    text:
      difference > 0
        ? `${formatDuration(difference)} left`
        : `expired ${formatDuration(difference)} ago`,
    problem: difference <= 0,
  }));

  for (const row of [issued, notBefore, expires]) {
    if (row) {
      rows.push(row);
    }
  }

  return rows;
}
