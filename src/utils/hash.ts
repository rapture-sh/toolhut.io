import { toHex } from "~/utils/bytes";

export const HASH_ALGORITHMS = [
  "SHA-256",
  "SHA-1",
  "SHA-384",
  "SHA-512",
] as const;

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

/** Injected so the tests can hash with Node's implementation. */
export type Subtle = Pick<SubtleCrypto, "digest">;

const platformSubtle = (): Subtle => crypto.subtle;

export async function hashBytes(
  bytes: Uint8Array,
  algorithm: HashAlgorithm,
  subtle: Subtle = platformSubtle(),
): Promise<string> {
  const digest = await subtle.digest(algorithm, bytes as BufferSource);
  return toHex(new Uint8Array(digest));
}

export async function hashText(
  text: string,
  algorithm: HashAlgorithm,
  subtle: Subtle = platformSubtle(),
): Promise<string> {
  return hashBytes(new TextEncoder().encode(text), algorithm, subtle);
}
