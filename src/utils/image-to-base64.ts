import { downloadName } from "~/utils/filename";

/** Thrown when a data URI cannot be built from what was handed over. */
export class DataUriError extends Error {
  constructor(message = "That is not something a data URI can hold.") {
    super(message);
    this.name = "DataUriError";
  }
}

const IMAGE_TYPE = /^image\/[a-z0-9][a-z0-9.+-]*$/i;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

export type Base64View = "uri" | "css" | "html";

export function dataUri(type: string, base64: string): string {
  const mediaType = type.trim().toLowerCase();

  if (!IMAGE_TYPE.test(mediaType)) {
    throw new DataUriError(
      "That file is not an image, so it cannot become an image data URI.",
    );
  }

  const payload = base64.replace(/\s+/g, "");

  if (payload === "") {
    throw new DataUriError("There is nothing to encode yet.");
  }

  if (!BASE64.test(payload)) {
    throw new DataUriError("That is not valid base64 data.");
  }

  return `data:${mediaType};base64,${payload}`;
}

function requireUri(uri: string): string {
  const trimmed = uri.trim();

  if (!trimmed.startsWith("data:")) {
    throw new DataUriError("A CSS rule needs a data URI to put in it.");
  }

  return trimmed;
}

export function cssBackgroundRule(uri: string): string {
  return [
    ".image {",
    `  background-image: url("${requireUri(uri)}");`,
    "  background-repeat: no-repeat;",
    "  background-size: contain;",
    "}",
  ].join("\n");
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function imgTag(uri: string, alt: string): string {
  return `<img src="${requireUri(uri)}" alt="${escapeAttribute(alt.trim())}" />`;
}

/** How many base64 characters a file of this many bytes turns into. */
export function encodedSize(bytes: number): number {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new DataUriError("That is not a file size.");
  }

  return Math.ceil(bytes / 3) * 4;
}

export function renderBase64(
  view: Base64View,
  uri: string,
  alt: string,
): string {
  if (view === "css") {
    return cssBackgroundRule(uri);
  }

  if (view === "html") {
    return imgTag(uri, alt);
  }

  return requireUri(uri);
}

export function encodedFileName(original: string): string {
  return downloadName(original, { suffix: "base64", extension: "txt" });
}
