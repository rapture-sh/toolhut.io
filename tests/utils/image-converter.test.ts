import { describe, expect, it } from "vitest";
import {
  ConversionError,
  conversionPlan,
  convertedName,
  isHexColour,
  needsBackground,
  normaliseHexColour,
  targetFormats,
} from "~/utils/image-converter";

describe("convertedName", () => {
  it("should swap the extension for the one the new format uses", () => {
    expect(convertedName("diagram.png", "jpeg")).toBe("diagram.jpg");
    expect(convertedName("photo.jpeg", "webp")).toBe("photo.webp");
  });

  it("should fall back to a usable name when there is none", () => {
    expect(convertedName("", "png")).toBe("download.png");
  });
});

describe("needsBackground", () => {
  it("should be true only for the format with no alpha channel", () => {
    expect(needsBackground("jpeg")).toBe(true);
    expect(needsBackground("png")).toBe(false);
    expect(needsBackground("webp")).toBe(false);
  });
});

describe("targetFormats", () => {
  it("should never offer the format the image already is", () => {
    expect(targetFormats("png")).toEqual(["jpeg", "webp"]);
  });

  it("should offer everything when nothing can write the source", () => {
    expect(targetFormats()).toEqual(["png", "jpeg", "webp"]);
  });
});

describe("normaliseHexColour", () => {
  it("should expand a short hex and add the hash", () => {
    expect(normaliseHexColour("#ABC")).toBe("#aabbcc");
    expect(normaliseHexColour("fff")).toBe("#ffffff");
  });

  it("should keep a six digit hex as it is", () => {
    expect(normaliseHexColour("  #1A2b3C ")).toBe("#1a2b3c");
  });

  it("should reject anything that is not a hex colour", () => {
    expect(() => normaliseHexColour("white")).toThrow(ConversionError);
    expect(() => normaliseHexColour("#12345")).toThrow(ConversionError);
  });
});

describe("isHexColour", () => {
  it("should agree with what normaliseHexColour accepts", () => {
    expect(isHexColour("#aabbcc")).toBe(true);
    expect(isHexColour("abc")).toBe(true);
    expect(isHexColour("rgb(0,0,0)")).toBe(false);
  });
});

describe("conversionPlan", () => {
  it("should put a background behind a transparent image going to JPEG", () => {
    expect(
      conversionPlan({
        name: "logo.png",
        source: "png",
        target: "jpeg",
        quality: 0.8,
        transparent: true,
        background: "#f0f",
      }),
    ).toEqual({
      format: "jpeg",
      name: "logo.jpg",
      quality: 0.8,
      background: "#ff00ff",
    });
  });

  it("should leave the background alone when the image is opaque", () => {
    expect(
      conversionPlan({
        name: "photo.webp",
        source: "webp",
        target: "jpeg",
        background: "#000000",
      }).background,
    ).toBeUndefined();
  });

  it("should keep the alpha when the target can hold it", () => {
    expect(
      conversionPlan({
        name: "logo.jpg",
        source: "jpeg",
        target: "png",
        transparent: true,
      }),
    ).toEqual({
      format: "png",
      name: "logo.png",
      quality: undefined,
      background: undefined,
    });
  });

  it("should clamp a quality that is out of range", () => {
    expect(
      conversionPlan({ name: "a.png", target: "webp", quality: 4 }).quality,
    ).toBe(1);
    expect(
      conversionPlan({ name: "a.png", target: "webp", quality: -1 }).quality,
    ).toBe(0.1);
  });

  it("should refuse to convert a format to itself", () => {
    expect(() =>
      conversionPlan({ name: "a.png", source: "png", target: "png" }),
    ).toThrow(ConversionError);
  });

  it("should reject a quality that is not a number", () => {
    expect(() =>
      conversionPlan({ name: "a.png", target: "jpeg", quality: Number.NaN }),
    ).toThrow(ConversionError);
  });

  it("should reject a background that is not a hex colour", () => {
    expect(() =>
      conversionPlan({
        name: "a.png",
        target: "jpeg",
        transparent: true,
        background: "transparent",
      }),
    ).toThrow(ConversionError);
  });
});
