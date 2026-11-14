import type { PluginConfig } from "svgo/browser";
import { looksLikeSvg, SvgError } from "~/utils/svg-optimizer";

export interface SvgOptimizeOptions {
  /** Decimal places kept on coordinates. Fewer means smaller and coarser. */
  precision: number;
  /** Leave the width and height attributes on the root element alone. */
  keepDimensions: boolean;
}

/**
 * Runs svgo in this tab. The library is pulled in on demand, so every other
 * page loads without it.
 *
 * @throws {SvgError} when the markup is not an SVG, or svgo cannot parse it.
 */
export async function optimizeSvg(
  markup: string,
  { precision, keepDimensions }: SvgOptimizeOptions,
): Promise<string> {
  if (!looksLikeSvg(markup)) {
    throw new SvgError("That markup has no <svg> element in it.");
  }

  const plugins: PluginConfig[] = [
    { name: "preset-default", params: { floatPrecision: precision } },
  ];

  if (!keepDimensions) {
    plugins.push("removeDimensions");
  }

  const { optimize } = await import("svgo/browser");

  try {
    const { data } = optimize(markup, {
      multipass: true,
      floatPrecision: precision,
      plugins,
    });

    return data;
  } catch {
    throw new SvgError(
      "That SVG could not be parsed. Check the markup is complete and every tag is closed.",
    );
  }
}
