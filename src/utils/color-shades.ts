import {
  type Color,
  type ColorFormat,
  formatColor,
  fromOklch,
  toOklchColor,
} from "~/utils/color";

/** Thrown when a prefix would not make a usable custom property name. */
export class ShadePrefixError extends Error {
  constructor(
    message = "A custom property prefix needs at least one letter or number.",
  ) {
    super(message);
    this.name = "ShadePrefixError";
  }
}

export interface Shade {
  /** 50 to 950, the steps a theme scale is usually written in. */
  step: number;
  color: Color;
}

interface Rung {
  step: number;
  lightness: number;
  /** Share of the ramp's chroma this step carries. */
  chroma: number;
}

/**
 * Lightness falls evenly while chroma rises into the middle and eases off at
 * both ends, which is what keeps a ramp from looking washed out at the top and
 * muddy at the bottom. The numbers are read off ramps that are known to look
 * right rather than derived.
 */
const LADDER: readonly Rung[] = [
  { step: 50, lightness: 0.971, chroma: 0.07 },
  { step: 100, lightness: 0.936, chroma: 0.15 },
  { step: 200, lightness: 0.887, chroma: 0.28 },
  { step: 300, lightness: 0.81, chroma: 0.5 },
  { step: 400, lightness: 0.716, chroma: 0.77 },
  { step: 500, lightness: 0.634, chroma: 1 },
  { step: 600, lightness: 0.566, chroma: 1.08 },
  { step: 700, lightness: 0.501, chroma: 1.03 },
  { step: 800, lightness: 0.44, chroma: 0.88 },
  { step: 900, lightness: 0.395, chroma: 0.72 },
  { step: 950, lightness: 0.277, chroma: 0.47 },
];

function nearestRung(lightness: number): Rung {
  return LADDER.reduce((closest, rung) =>
    Math.abs(rung.lightness - lightness) <
    Math.abs(closest.lightness - lightness)
      ? rung
      : closest,
  );
}

/**
 * The eleven steps of a theme scale, built in OKLCH so the hue never drifts.
 * The colour is anchored at the rung closest to its own lightness, which is
 * what keeps the input recognisable in the middle of its own ramp.
 */
export function shadeRamp(color: Color): Shade[] {
  const base = toOklchColor(color);
  const hue = base.h ?? 0;
  const chroma = base.c / nearestRung(base.l).chroma;

  return LADDER.map((rung) => ({
    step: rung.step,
    color: fromOklch({
      mode: "oklch",
      l: rung.lightness,
      c: chroma * rung.chroma,
      h: hue,
    }),
  }));
}

export interface RampCssOptions {
  /** Each property is written `--<prefix>-<step>`. Defaults to `color`. */
  prefix?: string;
  format?: ColorFormat;
}

function cleanPrefix(prefix: string): string {
  const cleaned = prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleaned === "") {
    throw new ShadePrefixError();
  }

  return cleaned;
}

/**
 * The ramp as custom properties on `:root`, so the output is a stylesheet that
 * can be saved and imported as it is.
 *
 * @throws ShadePrefixError when the prefix has nothing usable in it.
 */
export function rampAsCss(
  ramp: readonly Shade[],
  options: RampCssOptions = {},
): string {
  const prefix = cleanPrefix(options.prefix ?? "color");
  const format = options.format ?? "hex";

  const lines = ramp.map(
    (shade) =>
      `  --${prefix}-${shade.step}: ${formatColor(shade.color, format)};`,
  );

  return `:root {\n${lines.join("\n")}\n}\n`;
}
