import { describe, expect, it } from "vitest";
import { Base64DecodeError, decodeBase64, encodeBase64 } from "~/utils/base64";

describe("encodeBase64", () => {
  it("encodes ASCII text", () => {
    expect(encodeBase64("toolhut")).toBe("dG9vbGh1dA==");
  });

  it("encodes multi-byte characters as UTF-8", () => {
    expect(encodeBase64("héllo 👋")).toBe("aMOpbGxvIPCfkYs=");
  });

  it("returns an empty string for empty input", () => {
    expect(encodeBase64("")).toBe("");
  });
});

describe("decodeBase64", () => {
  it("round-trips encoded text", () => {
    const input = "héllo 👋 toolhut";

    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });

  it("ignores surrounding whitespace and line breaks", () => {
    expect(decodeBase64(" dG9vbGh1\ndA==\n")).toBe("toolhut");
  });

  it("returns an empty string for blank input", () => {
    expect(decodeBase64("   ")).toBe("");
  });

  it("rejects input that is not Base64", () => {
    expect(() => decodeBase64("not base64!!")).toThrow(Base64DecodeError);
  });

  it("rejects Base64 that is not UTF-8 text", () => {
    expect(() => decodeBase64("/w==")).toThrow(Base64DecodeError);
  });
});
