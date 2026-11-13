/** Thrown when input cannot be read as Base64-encoded UTF-8 text. */
export class Base64DecodeError extends Error {
  constructor(message = "That is not valid Base64 text.") {
    super(message);
    this.name = "Base64DecodeError";
  }
}

export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export function decodeBase64(input: string): string {
  const normalized = input.replace(/\s+/g, "");

  if (normalized === "") {
    return "";
  }

  let binary: string;
  try {
    binary = atob(normalized);
  } catch {
    throw new Base64DecodeError();
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Base64DecodeError(
      "That Base64 decodes to bytes, but not to UTF-8 text.",
    );
  }
}
