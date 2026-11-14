import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashBytes, hashText } from "~/utils/hash";

const subtle = webcrypto.subtle;

describe("hashText", () => {
  it('matches the published SHA-256 vector for "abc"', async () => {
    await expect(hashText("abc", "SHA-256", subtle)).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it('matches the published SHA-1 vector for "abc"', async () => {
    await expect(hashText("abc", "SHA-1", subtle)).resolves.toBe(
      "a9993e364706816aba3e25717850c26c9cd0d89d",
    );
  });

  it("should hash the empty string rather than refusing it", async () => {
    await expect(hashText("", "SHA-256", subtle)).resolves.toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("should hash bytes, not code units, so Unicode is stable", async () => {
    const text = "héllo 👋";
    const bytes = new TextEncoder().encode(text);

    await expect(hashText(text, "SHA-256", subtle)).resolves.toBe(
      await hashBytes(bytes, "SHA-256", subtle),
    );
  });

  it("should give each algorithm its own digest length", async () => {
    const lengths = await Promise.all(
      (["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const).map(
        async (algorithm) => (await hashText("abc", algorithm, subtle)).length,
      ),
    );

    expect(lengths).toEqual([40, 64, 96, 128]);
  });
});
