import { describe, expect, it } from "vitest";
import { Base64DecodeError, decodeBase64, encodeBase64 } from "~/utils/base64";

describe("encodeBase64", () => {
  it("should encode ASCII text", () => {
    expect(encodeBase64("toolhut")).toBe("dG9vbGh1dA==");
  });

  it("should encode multi-byte characters as UTF-8", () => {
    expect(encodeBase64("héllo 👋")).toBe("aMOpbGxvIPCfkYs=");
  });

  it("should return an empty string for empty input", () => {
    expect(encodeBase64("")).toBe("");
  });
});

describe("decodeBase64", () => {
  it("should round-trip encoded text", () => {
    const input = "héllo 👋 toolhut";

    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });

  it("should ignore surrounding whitespace and line breaks", () => {
    expect(decodeBase64(" dG9vbGh1\ndA==\n")).toBe("toolhut");
  });

  it("should return an empty string for blank input", () => {
    expect(decodeBase64("   ")).toBe("");
  });

  it("should reject input that is not Base64", () => {
    expect(() => decodeBase64("not base64!!")).toThrow(Base64DecodeError);
  });

  it("should reject Base64 that is not UTF-8 text", () => {
    expect(() => decodeBase64("/w==")).toThrow(Base64DecodeError);
  });
});
