import { converter, wcagLuminance } from "culori";
import { describe, expect, it } from "vitest";
import { type Color, formatColor, parseColor } from "~/utils/color";
import {
  rampAsCss,
  type Shade,
  ShadePrefixError,
  shadeRamp,
} from "~/utils/color-shades";

const toOklch = converter("oklch");

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function hex(shade: Shade): string {
  return formatColor(shade.color, "hex");
}

/** The step the input was anchored at, which is the one nearest its lightness. */
function anchor(ramp: Shade[], input: Color): Shade {
  const lightness = toOklch(input).l;

  return ramp.reduce((closest, shade) =>
    Math.abs(toOklch(shade.color).l - lightness) <
    Math.abs(toOklch(closest.color).l - lightness)
      ? shade
      : closest,
  );
}

describe("shadeRamp", () => {
  it("should give the eleven theme steps in order", () => {
    expect(shadeRamp(parseColor("#3b82f6")).map((shade) => shade.step)).toEqual(
      STEPS,
    );
  });

  it("should get darker at every step", () => {
    const ramp = shadeRamp(parseColor("#f43f5e"));

    for (let index = 1; index < ramp.length; index += 1) {
      const lighter = ramp[index - 1];
      const darker = ramp[index];

      expect(wcagLuminance(darker.color)).toBeLessThan(
        wcagLuminance(lighter.color),
      );
    }
  });

  it("should keep the hue of the colour it was given", () => {
    const input = parseColor("#3b82f6");
    const hue = toOklch(input).h ?? 0;

    for (const shade of shadeRamp(input)) {
      expect(toOklch(shade.color).h ?? 0).toBeCloseTo(hue, 1);
    }
  });

  it("should leave the input recognisable in the middle of its own ramp", () => {
    for (const value of ["#3b82f6", "#f43f5e", "#15785c"]) {
      const input = parseColor(value);
      const base = toOklch(input);
      const middle = toOklch(anchor(shadeRamp(input), input).color);

      expect(middle.h ?? 0).toBeCloseTo(base.h ?? 0, 1);
      expect(Math.abs(middle.l - base.l)).toBeLessThan(0.03);
      expect(Math.abs(middle.c - base.c) / base.c).toBeLessThan(0.1);
    }
  });

  it("should build a grey ramp from a grey, with no colour creeping in", () => {
    for (const shade of shadeRamp(parseColor("#808080"))) {
      const [, red, green, blue] = /^#(..)(..)(..)$/.exec(hex(shade)) ?? [];

      expect(red).toBe(green);
      expect(green).toBe(blue);
    }
  });

  it("should stay inside sRGB even for a colour a screen cannot show", () => {
    for (const shade of shadeRamp(parseColor("oklch(70% 0.4 30)"))) {
      for (const channel of [shade.color.r, shade.color.g, shade.color.b]) {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(1);
      }
    }
  });

  it("should work at the ends of the lightness range", () => {
    for (const value of ["#ffffff", "#000000"]) {
      const ramp = shadeRamp(parseColor(value));

      expect(ramp).toHaveLength(STEPS.length);
      expect(ramp.every((shade) => /^#[0-9a-f]{6}$/.test(hex(shade)))).toBe(
        true,
      );
    }
  });
});

describe("rampAsCss", () => {
  const ramp = shadeRamp(parseColor("#3b82f6"));

  it("should write one custom property per step inside :root", () => {
    const css = rampAsCss(ramp);

    expect(css.startsWith(":root {\n")).toBe(true);
    expect(css.trimEnd().endsWith("}")).toBe(true);
    expect(css).toContain(`  --color-50: ${hex(ramp[0])};`);
    expect(css).toContain(`  --color-950: ${hex(ramp[10])};`);
    expect(css.match(/--color-/g)).toHaveLength(STEPS.length);
  });

  it("should take a prefix and tidy it into a usable name", () => {
    expect(rampAsCss(ramp, { prefix: " Brand Blue " })).toContain(
      "--brand-blue-500:",
    );
  });

  it("should write the values in the format it is asked for", () => {
    expect(rampAsCss(ramp, { format: "rgb" })).toContain(
      `--color-500: ${formatColor(ramp[5].color, "rgb")};`,
    );
  });

  it("should reject a prefix with nothing usable in it", () => {
    expect(() => rampAsCss(ramp, { prefix: "" })).toThrow(ShadePrefixError);
    expect(() => rampAsCss(ramp, { prefix: "---" })).toThrow(ShadePrefixError);
  });

  it("should write an empty block for an empty ramp", () => {
    expect(rampAsCss([])).toBe(":root {\n\n}\n");
  });
});
