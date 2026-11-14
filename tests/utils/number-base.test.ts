import { describe, expect, it } from "vitest";
import {
  BaseConversionError,
  convertBase,
  parseInBase,
  toAllBases,
} from "~/utils/number-base";

describe("parseInBase", () => {
  it("should read a value in its own base", () => {
    expect(parseInBase("ff", 16)).toBe(255n);
    expect(parseInBase("1010", 2)).toBe(10n);
    expect(parseInBase("777", 8)).toBe(511n);
  });

  it("should accept the usual prefixes and grouping characters", () => {
    expect(parseInBase("0xFF", 16)).toBe(255n);
    expect(parseInBase("0b1010_1010", 2)).toBe(170n);
    expect(parseInBase(" 1 000 ", 10)).toBe(1000n);
  });

  it("should keep a minus sign", () => {
    expect(parseInBase("-ff", 16)).toBe(-255n);
  });

  it("should reject a digit that does not exist in the base", () => {
    expect(() => parseInBase("12", 2)).toThrow(BaseConversionError);
    expect(() => parseInBase("zz", 16)).toThrow(BaseConversionError);
  });

  it("should reject empty input", () => {
    expect(() => parseInBase("   ", 10)).toThrow(BaseConversionError);
  });
});

describe("convertBase", () => {
  it("should convert in both directions", () => {
    expect(convertBase("255", 10, 16)).toBe("ff");
    expect(convertBase("ff", 16, 10)).toBe("255");
  });

  it("should keep precision past what a number can hold", () => {
    const huge = "9007199254740993";

    expect(convertBase(convertBase(huge, 10, 16), 16, 10)).toBe(huge);
  });
});

describe("toAllBases", () => {
  it("should return the same value written four ways", () => {
    expect(toAllBases("64", 10)).toEqual({
      2: "1000000",
      8: "100",
      10: "64",
      16: "40",
    });
  });
});
