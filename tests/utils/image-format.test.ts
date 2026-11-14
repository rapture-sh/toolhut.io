import { describe, expect, it } from "vitest";
import {
  extensionFor,
  formatForType,
  IMAGE_FORMAT_LIST,
  isLossy,
  typeFor,
} from "~/utils/image-format";

describe("image formats", () => {
  it("gives JPEG the extension people expect", () => {
    expect(extensionFor("jpeg")).toBe("jpg");
    expect(typeFor("jpeg")).toBe("image/jpeg");
  });

  it("knows which formats throw detail away", () => {
    expect(isLossy("png")).toBe(false);
    expect(isLossy("jpeg")).toBe(true);
    expect(isLossy("webp")).toBe(true);
  });
});

describe("formatForType", () => {
  it("matches a media type whatever its case", () => {
    expect(formatForType("IMAGE/WEBP")).toBe("webp");
  });

  it("treats the older image/jpg spelling as JPEG", () => {
    expect(formatForType("image/jpg")).toBe("jpeg");
  });

  it("returns nothing for a format a browser cannot write", () => {
    expect(formatForType("image/avif")).toBeUndefined();
    expect(formatForType("")).toBeUndefined();
  });

  it("round-trips every format it lists", () => {
    for (const format of IMAGE_FORMAT_LIST) {
      expect(formatForType(typeFor(format))).toBe(format);
    }
  });
});
