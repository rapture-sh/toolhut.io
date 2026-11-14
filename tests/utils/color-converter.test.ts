import { describe, expect, it } from "vitest";
import { ColorParseError, parseColor } from "~/utils/color";
import { convertColor } from "~/utils/color-converter";

describe("convertColor", () => {
  it("should write the colour in all four formats, HEX first", () => {
    const { conversions } = convertColor("#aabbcc");

    expect(conversions.map((row) => [row.label, row.value])).toEqual([
      ["HEX", "#aabbcc"],
      ["RGB", "rgb(170, 187, 204)"],
      ["HSL", "hsl(210, 25%, 73.33%)"],
      ["OKLCH", "oklch(78.44% 0.0307 248.22)"],
    ]);
  });

  it("should give back the colour it parsed", () => {
    expect(convertColor("rebeccapurple").color).toEqual(parseColor("#663399"));
  });

  it("should write every value so that it parses back to the same colour", () => {
    const { color, conversions } = convertColor("hsl(14, 90%, 52%)");

    for (const row of conversions) {
      const again = parseColor(row.value);

      for (const channel of ["r", "g", "b"] as const) {
        expect(Math.abs(again[channel] - color[channel])).toBeLessThanOrEqual(
          1 / 255,
        );
      }
    }
  });

  it("should reject empty input", () => {
    expect(() => convertColor("")).toThrow(ColorParseError);
  });

  it("should reject input that is not a colour", () => {
    expect(() => convertColor("#ggg")).toThrow(ColorParseError);
  });
});
