import { describe, expect, it } from "vitest";
import {
  formatBytes,
  toBase64,
  toBase64Url,
  toHex,
  wrapLines,
} from "~/utils/bytes";

const bytes = (...values: number[]) => new Uint8Array(values);

describe("toHex", () => {
  it("should pad every byte to two digits", () => {
    expect(toHex(bytes(0, 15, 16, 255))).toBe("000f10ff");
  });

  it("should return an empty string for no bytes", () => {
    expect(toHex(bytes())).toBe("");
  });
});

describe("toBase64", () => {
  it("should encode bytes, padding included", () => {
    expect(toBase64(new TextEncoder().encode("toolhut"))).toBe("dG9vbGh1dA==");
  });

  it("should handle bytes above 127, which a naive string cast would mangle", () => {
    expect(toBase64(bytes(255, 254, 253))).toBe("//79");
  });
});

describe("toBase64Url", () => {
  it("should swap the two unsafe characters and drop the padding", () => {
    expect(toBase64Url(bytes(255, 254, 253))).toBe("__79");
    expect(toBase64Url(new TextEncoder().encode("toolhut"))).toBe("dG9vbGh1dA");
  });
});

describe("wrapLines", () => {
  it("should break at the given width", () => {
    expect(wrapLines("abcdefgh", 3)).toBe("abc\ndef\ngh");
  });

  it("should leave a short value on one line", () => {
    expect(wrapLines("abc", 64)).toBe("abc");
  });
});

describe("formatBytes", () => {
  it("should leave a small count in plain bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("should switch unit at a kilobyte", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("should drop the decimal once the number is big enough to read", () => {
    expect(formatBytes(1024 * 48)).toBe("48 KB");
  });

  it("should reach megabytes and gigabytes", () => {
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.5 MB");
    expect(formatBytes(1024 ** 3 * 3)).toBe("3 GB");
  });

  it("should answer sensibly for nothing and for nonsense", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-5)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
  });
});
