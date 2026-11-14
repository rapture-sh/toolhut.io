import { describe, expect, it } from "vitest";
import {
  COLOR_FORMATS,
  type Color,
  ColorParseError,
  formatAll,
  formatColor,
  parseColor,
  toPickerHex,
} from "~/utils/color";

function channels(color: Color): [number, number, number] {
  return [color.r, color.g, color.b];
}

function closeEnough(a: Color, b: Color): boolean {
  return channels(a).every(
    (value, index) => Math.abs(value - channels(b)[index]) <= 1 / 255,
  );
}

describe("parseColor", () => {
  it("reads a hex colour", () => {
    expect(formatAll(parseColor("#aabbcc")).rgb).toBe("rgb(170, 187, 204)");
  });

  it("reads a hex colour without the hash", () => {
    expect(parseColor("aabbcc")).toEqual(parseColor("#aabbcc"));
  });

  it("reads the other CSS spellings of the same colour", () => {
    const hex = parseColor("#663399");

    for (const spelling of [
      "rebeccapurple",
      "rgb(102, 51, 153)",
      "hsl(270, 50%, 40%)",
      "oklch(44.03% 0.1603 303.37)",
    ]) {
      expect(closeEnough(parseColor(spelling), hex)).toBe(true);
    }
  });

  it("ignores surrounding whitespace", () => {
    expect(parseColor("  #aabbcc \n")).toEqual(parseColor("#aabbcc"));
  });

  it("keeps alpha when the colour has it", () => {
    expect(parseColor("rgba(0, 0, 0, 0.5)").alpha).toBe(0.5);
  });

  it("brings a colour outside sRGB into range without losing its hue", () => {
    const wide = parseColor("oklch(70% 0.4 30)");
    const clipped = parseColor("oklch(70% 0.2 30)");

    for (const channel of channels(wide)) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(1);
    }
    expect(wide.r).toBeGreaterThan(wide.b);
    expect(closeEnough(wide, clipped)).toBe(true);
  });

  it("rejects empty input", () => {
    expect(() => parseColor("")).toThrow(ColorParseError);
    expect(() => parseColor("   ")).toThrow(ColorParseError);
  });

  it("rejects something that is not a colour", () => {
    expect(() => parseColor("not a colour")).toThrow(ColorParseError);
    expect(() => parseColor("#12345")).toThrow(ColorParseError);
  });
});

describe("formatColor", () => {
  it("writes every format of one colour", () => {
    expect(formatAll(parseColor("#3b82f6"))).toEqual({
      hex: "#3b82f6",
      rgb: "rgb(59, 130, 246)",
      hsl: "hsl(217.22, 91.22%, 59.8%)",
      oklch: "oklch(62.31% 0.188 259.81)",
    });
  });

  it("writes alpha into every format that carries it", () => {
    const half = parseColor("#00000080");

    expect(formatColor(half, "hex")).toBe("#00000080");
    expect(formatColor(half, "rgb")).toBe("rgba(0, 0, 0, 0.5)");
    expect(formatColor(half, "hsl")).toBe("hsla(0, 0%, 0%, 0.5)");
    expect(formatColor(half, "oklch")).toBe("oklch(0% 0 0 / 0.5)");
  });

  it("round trips a colour through every format", () => {
    const original = parseColor("#09ffa4");

    for (const format of COLOR_FORMATS) {
      const again = parseColor(formatColor(original, format));

      expect(closeEnough(again, original)).toBe(true);
    }
  });

  it("writes pure white and pure black", () => {
    expect(formatColor(parseColor("white"), "hex")).toBe("#ffffff");
    expect(formatColor(parseColor("black"), "oklch")).toBe("oklch(0% 0 0)");
  });
});

describe("toPickerHex", () => {
  it("drops alpha, which a colour picker cannot show", () => {
    expect(toPickerHex(parseColor("#11223344"))).toBe("#112233");
  });
});
