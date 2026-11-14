import {
  COLOR_FORMATS,
  type Color,
  type ColorFormat,
  FORMAT_LABELS,
  formatColor,
  parseColor,
} from "~/utils/color";

export interface Conversion {
  format: ColorFormat;
  label: string;
  value: string;
}

export interface ConvertedColor {
  color: Color;
  conversions: Conversion[];
}

/**
 * Reads one colour and writes it in every format the tool shows.
 *
 * @throws ColorParseError when the input is not a colour.
 */
export function convertColor(input: string): ConvertedColor {
  const color = parseColor(input);

  return {
    color,
    conversions: COLOR_FORMATS.map((format) => ({
      format,
      label: FORMAT_LABELS[format],
      value: formatColor(color, format),
    })),
  };
}
