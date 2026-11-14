import { toBase64, toBase64Url, toHex } from "~/utils/bytes";

export const SECRET_FORMATS = ["hex", "base64", "base64url"] as const;

export type SecretFormat = (typeof SECRET_FORMATS)[number];

/** Injected so tests can pin the bytes. */
export type RandomBytes = (length: number) => Uint8Array;

const platformRandomBytes: RandomBytes = (length) =>
  crypto.getRandomValues(new Uint8Array(length));

export function generateSecret(
  byteLength: number,
  format: SecretFormat,
  randomBytes: RandomBytes = platformRandomBytes,
): string {
  const length = Math.min(Math.max(1, Math.trunc(byteLength)), 512);
  const bytes = randomBytes(length);

  switch (format) {
    case "hex":
      return toHex(bytes);
    case "base64":
      return toBase64(bytes);
    case "base64url":
      return toBase64Url(bytes);
  }
}
