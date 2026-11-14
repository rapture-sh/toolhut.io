import {
  type Color as CuloriColor,
  clampChroma,
  converter,
  displayable,
  formatHex,
  formatHex8,
  formatHsl,
  formatRgb,
  type Oklch,
  parse,
  type Rgb,
} from "culori";

/** Thrown when a string cannot be read as a colour. */
export class ColorParseError extends Error {
  constructor(message = "That is not a colour this tool understands.") {
    super(message);
    this.name = "ColorParseError";
  }
}

/** sRGB, every channel 0 to 1, with `alpha` only when it is not opaque. */
export type Color = Rgb;

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export const COLOR_FORMATS = ["hex", "rgb", "hsl", "oklch"] as const;

export const FORMAT_LABELS: Record<ColorFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
  oklch: "OKLCH",
};

const toRgb = converter("rgb");
const toOklch = converter("oklch");

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function trim(value: number, digits: number): number {
  return Number(value.toFixed(digits));
}

function isOpaque(color: Color): boolean {
  return color.alpha === undefined || color.alpha >= 1;
}

/**
 * Pulls a colour into sRGB by lowering its chroma, so a wide gamut input such
 * as `oklch(70% 0.4 30)` keeps its hue instead of clipping to a channel wall.
 */
function toSrgb(color: CuloriColor): Color {
  const direct = toRgb(color);

  if (displayable(direct)) {
    return direct;
  }

  const mapped = toRgb(clampChroma(toOklch(color), "oklch"));

  return {
    mode: "rgb",
    r: clamp01(mapped.r),
    g: clamp01(mapped.g),
    b: clamp01(mapped.b),
    alpha: mapped.alpha,
  };
}

/**
 * Reads anything CSS understands, plus a bare hex such as `aabbcc`.
 *
 * @throws ColorParseError when the string is not a colour.
 */
export function parseColor(input: string): Color {
  const parsed = parse(input.trim());

  if (!parsed) {
    throw new ColorParseError();
  }

  return toSrgb(parsed);
}

/** Rounded enough to stay readable, close enough to round trip to the same hex. */
function formatOklch(color: Oklch): string {
  const lightness = `${trim(color.l * 100, 2)}%`;
  const chroma = trim(color.c, 4);
  const hue = trim(color.h ?? 0, 2);
  const alpha =
    color.alpha === undefined || color.alpha >= 1
      ? ""
      : ` / ${trim(color.alpha, 2)}`;

  return `oklch(${lightness} ${chroma} ${hue}${alpha})`;
}

export function formatColor(color: Color, format: ColorFormat): string {
  switch (format) {
    case "hex":
      return isOpaque(color) ? formatHex(color) : formatHex8(color);
    case "rgb":
      return formatRgb(color);
    case "hsl":
      return formatHsl(color);
    case "oklch":
      return formatOklch(toOklch(color));
  }
}

export function formatAll(color: Color): Record<ColorFormat, string> {
  return {
    hex: formatColor(color, "hex"),
    rgb: formatColor(color, "rgb"),
    hsl: formatColor(color, "hsl"),
    oklch: formatColor(color, "oklch"),
  };
}

/** Six digit hex with no alpha, which is all `<input type="color">` takes. */
export function toPickerHex(color: Color): string {
  return formatHex({ mode: "rgb", r: color.r, g: color.g, b: color.b });
}

export function toOklchColor(color: Color): Oklch {
  return toOklch(color);
}

export function fromOklch(color: Oklch): Color {
  return toSrgb(color);
}
