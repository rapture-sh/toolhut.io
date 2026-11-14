import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";
import { generateRsaKeyPair, toPem } from "~/utils/rsa";

const subtle = webcrypto.subtle as unknown as Parameters<
  typeof generateRsaKeyPair
>[1];

describe("toPem", () => {
  it("wraps the body at 64 characters between the labels", () => {
    const der = new Uint8Array(100).fill(0).buffer;
    const pem = toPem("PUBLIC KEY", der);
    const lines = pem.split("\n");

    expect(lines[0]).toBe("-----BEGIN PUBLIC KEY-----");
    expect(lines.at(-1)).toBe("-----END PUBLIC KEY-----");
    expect(lines.slice(1, -1).every((line) => line.length <= 64)).toBe(true);
  });
});

describe("generateRsaKeyPair", () => {
  it("returns a PEM pair that openssl would recognise", async () => {
    const pair = await generateRsaKeyPair(2048, subtle);

    expect(pair.publicKey.startsWith("-----BEGIN PUBLIC KEY-----")).toBe(true);
    expect(pair.publicKey.endsWith("-----END PUBLIC KEY-----")).toBe(true);
    expect(pair.privateKey.startsWith("-----BEGIN PRIVATE KEY-----")).toBe(
      true,
    );
    expect(pair.privateKey.endsWith("-----END PRIVATE KEY-----")).toBe(true);
  }, 30000);

  it("imports back into a usable key, so the export is not malformed", async () => {
    const pair = await generateRsaKeyPair(2048, subtle);
    const body = pair.publicKey
      .replace(/-----[A-Z ]+-----/g, "")
      .replace(/\s/g, "");
    const der = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));

    const imported = await webcrypto.subtle.importKey(
      "spki",
      der,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["verify"],
    );

    expect(imported.type).toBe("public");
    expect(imported.algorithm).toMatchObject({ modulusLength: 2048 });
  }, 30000);

  it("never returns the same private key twice", async () => {
    const [first, second] = await Promise.all([
      generateRsaKeyPair(2048, subtle),
      generateRsaKeyPair(2048, subtle),
    ]);

    expect(first.privateKey).not.toBe(second.privateKey);
  }, 45000);
});
