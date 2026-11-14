import { describe, expect, it } from "vitest";
import { toBase64, toBase64Url, toHex, wrapLines } from "~/utils/bytes";

const bytes = (...values: number[]) => new Uint8Array(values);

describe("toHex", () => {
  it("pads every byte to two digits", () => {
    expect(toHex(bytes(0, 15, 16, 255))).toBe("000f10ff");
  });

  it("returns an empty string for no bytes", () => {
    expect(toHex(bytes())).toBe("");
  });
});

describe("toBase64", () => {
  it("encodes bytes, padding included", () => {
    expect(toBase64(new TextEncoder().encode("toolhut"))).toBe("dG9vbGh1dA==");
  });

  it("handles bytes above 127, which a naive string cast would mangle", () => {
    expect(toBase64(bytes(255, 254, 253))).toBe("//79");
  });
});

describe("toBase64Url", () => {
  it("swaps the two unsafe characters and drops the padding", () => {
    expect(toBase64Url(bytes(255, 254, 253))).toBe("__79");
    expect(toBase64Url(new TextEncoder().encode("toolhut"))).toBe("dG9vbGh1dA");
  });
});

describe("wrapLines", () => {
  it("breaks at the given width", () => {
    expect(wrapLines("abcdefgh", 3)).toBe("abc\ndef\ngh");
  });

  it("leaves a short value on one line", () => {
    expect(wrapLines("abc", 64)).toBe("abc");
  });
});
