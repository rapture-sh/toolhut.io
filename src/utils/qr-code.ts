import { encode } from "uqr";

/** Thrown when the fields cannot be turned into something a QR code can hold. */
export class QrInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QrInputError";
  }
}

export type QrKind = "text" | "url" | "wifi" | "email";

export type QrLevel = "L" | "M" | "Q" | "H";

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export interface QrFields {
  text: string;
  url: string;
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
  address: string;
  subject: string;
  body: string;
}

export const EMPTY_QR_FIELDS: QrFields = {
  text: "",
  url: "",
  ssid: "",
  password: "",
  security: "WPA",
  hidden: false,
  address: "",
  subject: "",
  body: "",
};

/** Bytes a version 40 symbol holds in byte mode, at each correction level. */
const CAPACITY: Record<QrLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export function qrCapacity(level: QrLevel): number {
  return CAPACITY[level];
}

export function qrByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function isTooLong(text: string, level: QrLevel): boolean {
  return qrByteLength(text) > qrCapacity(level);
}

/**
 * The wifi payload is a semicolon separated list, so a value holding one of
 * its own separators has to be escaped or a phone reads the network name and
 * the password as one field.
 */
export function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function qrFieldsEmpty(kind: QrKind, fields: QrFields): boolean {
  switch (kind) {
    case "text":
      return fields.text.trim() === "";
    case "url":
      return fields.url.trim() === "";
    case "wifi":
      return fields.ssid.trim() === "";
    case "email":
      return fields.address.trim() === "";
  }
}

function withScheme(url: string): string {
  return /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`;
}

function urlPayload(input: string): string {
  const candidate = withScheme(input.trim());

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new QrInputError("That does not look like a web address.");
  }

  if (parsed.protocol === "http:" || parsed.protocol === "https:") {
    if (parsed.hostname === "") {
      throw new QrInputError("That web address has no site in it.");
    }
    if (!parsed.hostname.includes(".")) {
      throw new QrInputError(
        "That web address has no domain in it, so try something like toolhut.io.",
      );
    }
  }

  return parsed.toString();
}

function wifiPayload(fields: QrFields): string {
  const parts = [`T:${fields.security}`, `S:${escapeWifiValue(fields.ssid)}`];

  if (fields.security !== "nopass") {
    if (fields.password === "") {
      throw new QrInputError(
        "A secured network needs a password, or set the security to none.",
      );
    }
    parts.push(`P:${escapeWifiValue(fields.password)}`);
  }

  if (fields.hidden) {
    parts.push("H:true");
  }

  return `WIFI:${parts.join(";")};;`;
}

function emailPayload(fields: QrFields): string {
  const address = fields.address.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new QrInputError(
      "That is not an email address, so try something like hello@toolhut.io.",
    );
  }

  const query = [
    fields.subject.trim() === ""
      ? null
      : `subject=${encodeURIComponent(fields.subject.trim())}`,
    fields.body.trim() === ""
      ? null
      : `body=${encodeURIComponent(fields.body.trim())}`,
  ].filter((part): part is string => part !== null);

  return query.length === 0
    ? `mailto:${address}`
    : `mailto:${address}?${query.join("&")}`;
}

const MISSING: Record<QrKind, string> = {
  text: "Type something to turn into a QR code.",
  url: "Type a link.",
  wifi: "Type the name of the network.",
  email: "Type an email address.",
};

/** The string that actually goes into the symbol, built from one kind's fields. */
export function qrInputFor(kind: QrKind, fields: QrFields): string {
  if (qrFieldsEmpty(kind, fields)) {
    throw new QrInputError(MISSING[kind]);
  }

  switch (kind) {
    case "text":
      return fields.text;
    case "url":
      return urlPayload(fields.url);
    case "wifi":
      return wifiPayload(fields);
    case "email":
      return emailPayload(fields);
  }
}

export interface QrMatrix {
  /** Modules across one side, the quiet border included. */
  size: number;
  /** Row then column, `true` where the module is dark. */
  modules: boolean[][];
}

export interface QrMatrixOptions {
  level: QrLevel;
  /** Quiet modules around the symbol, so a scanner can find its edges. */
  border?: number;
}

export function qrMatrix(
  text: string,
  { level, border = 2 }: QrMatrixOptions,
): QrMatrix {
  if (text === "") {
    throw new QrInputError("Type something to turn into a QR code.");
  }

  if (isTooLong(text, level)) {
    throw new QrInputError(
      `That is ${qrByteLength(text)} bytes, and one QR code holds ${qrCapacity(level)} at level ${level}. Shorten it, or drop to a lower level.`,
    );
  }

  try {
    const result = encode(text, { ecc: level, border });

    return { size: result.size, modules: result.data };
  } catch {
    throw new QrInputError("That is too much data for a single QR code.");
  }
}

/** One path for every dark module, in module units, for a `0 0 size size` box. */
export function qrPath({ modules }: QrMatrix): string {
  const parts: string[] = [];

  modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) {
        parts.push(`M${x},${y}h1v1h-1z`);
      }
    });
  });

  return parts.join("");
}

export interface QrSvgOptions extends QrMatrixOptions {
  /** Width and height in pixels of the file that gets written out. */
  size: number;
}

/**
 * A standalone SVG, black on white because that is the contrast a scanner
 * needs, with a width and a height so a canvas and an editor both know how
 * big it is.
 */
export function qrSvg(text: string, { size, ...rest }: QrSvgOptions): string {
  const matrix = qrMatrix(text, rest);
  const box = matrix.size;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${box} ${box}" shape-rendering="crispEdges">`,
    `<rect width="${box}" height="${box}" fill="white"/>`,
    `<path fill="black" d="${qrPath(matrix)}"/>`,
    "</svg>",
  ].join("");
}
