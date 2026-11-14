import { describe, expect, it } from "vitest";
import { generateSecret } from "~/utils/random-secret";

/** Counts up, so the output is predictable without being all one byte. */
const counting = (length: number) =>
  new Uint8Array(Array.from({ length }, (_, index) => index));

describe("generateSecret", () => {
  it("writes the same bytes in each format", () => {
    expect(generateSecret(4, "hex", counting)).toBe("00010203");
    expect(generateSecret(4, "base64", counting)).toBe("AAECAw==");
    expect(generateSecret(4, "base64url", counting)).toBe("AAECAw");
  });

  it("asks for exactly the number of bytes requested", () => {
    let asked = 0;
    generateSecret(32, "hex", (length) => {
      asked = length;
      return counting(length);
    });

    expect(asked).toBe(32);
  });

  it("produces two hex characters per byte", () => {
    expect(generateSecret(32, "hex", counting)).toHaveLength(64);
  });

  it("clamps the length, so a pasted number cannot hang the page", () => {
    expect(generateSecret(100000, "hex", counting)).toHaveLength(1024);
    expect(generateSecret(0, "hex", counting)).toHaveLength(2);
  });

  it("uses the platform generator by default, with changing output", () => {
    expect(generateSecret(16, "hex")).not.toBe(generateSecret(16, "hex"));
  });
});
