import { describe, expect, it } from "vitest";
import { parseColor } from "~/utils/color";
import {
  ContrastRangeError,
  contrastRatio,
  formatRatio,
  wcagLevels,
} from "~/utils/contrast-checker";

const ratio = (a: string, b: string) =>
  contrastRatio(parseColor(a), parseColor(b));

describe("contrastRatio", () => {
  it("gives 21 for black against white", () => {
    expect(ratio("#000000", "#ffffff")).toBe(21);
  });

  it("gives 1 for a colour against itself", () => {
    expect(ratio("#3b82f6", "#3b82f6")).toBe(1);
  });

  it("does not care which colour comes first", () => {
    expect(ratio("#767676", "#ffffff")).toBe(ratio("#ffffff", "#767676"));
  });

  it("matches the known ratio of mid grey on white", () => {
    expect(ratio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("ignores alpha, which WCAG has no way to weigh", () => {
    expect(ratio("#00000080", "#ffffff")).toBe(21);
  });
});

describe("wcagLevels", () => {
  it("passes everything at 21 to 1", () => {
    expect(wcagLevels(21)).toEqual({
      aa: { normal: true, large: true },
      aaa: { normal: true, large: true },
    });
  });

  it("fails everything at 1 to 1", () => {
    expect(wcagLevels(1)).toEqual({
      aa: { normal: false, large: false },
      aaa: { normal: false, large: false },
    });
  });

  it("counts a ratio exactly on a threshold as a pass", () => {
    expect(wcagLevels(4.5)).toEqual({
      aa: { normal: true, large: true },
      aaa: { normal: false, large: true },
    });
    expect(wcagLevels(3)).toEqual({
      aa: { normal: false, large: true },
      aaa: { normal: false, large: false },
    });
    expect(wcagLevels(7).aaa.normal).toBe(true);
  });

  it("fails a hair under a threshold", () => {
    expect(wcagLevels(4.49).aa.normal).toBe(false);
    expect(wcagLevels(6.99).aaa.normal).toBe(false);
  });

  it("rejects a ratio no pair of colours could produce", () => {
    expect(() => wcagLevels(0)).toThrow(ContrastRangeError);
    expect(() => wcagLevels(22)).toThrow(ContrastRangeError);
    expect(() => wcagLevels(Number.NaN)).toThrow(ContrastRangeError);
  });
});

describe("formatRatio", () => {
  it("writes a whole ratio without decimals", () => {
    expect(formatRatio(21)).toBe("21:1");
  });

  it("rounds to two decimals", () => {
    expect(formatRatio(4.5367)).toBe("4.54:1");
  });
});
