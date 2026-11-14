import { wcagContrast } from "culori";
import type { Color } from "~/utils/color";

/** Thrown when a ratio is outside the 1 to 21 range contrast can take. */
export class ContrastRangeError extends Error {
  constructor(message = "A contrast ratio is a number from 1 to 21.") {
    super(message);
    this.name = "ContrastRangeError";
  }
}

/** The ratios WCAG 2.2 asks for, by level and text size. */
export const WCAG_THRESHOLDS = {
  aaNormal: 4.5,
  aaLarge: 3,
  aaaNormal: 7,
  aaaLarge: 4.5,
} as const;

export interface WcagLevels {
  aa: { normal: boolean; large: boolean };
  aaa: { normal: boolean; large: boolean };
}

/** 1 for two colours that match, 21 for black against white. */
export function contrastRatio(a: Color, b: Color): number {
  return wcagContrast(a, b);
}

/**
 * @throws ContrastRangeError when the ratio could not have come from two
 * colours, which would otherwise read as a quiet row of failures.
 */
export function wcagLevels(ratio: number): WcagLevels {
  if (!Number.isFinite(ratio) || ratio < 1 || ratio > 21) {
    throw new ContrastRangeError();
  }

  return {
    aa: {
      normal: ratio >= WCAG_THRESHOLDS.aaNormal,
      large: ratio >= WCAG_THRESHOLDS.aaLarge,
    },
    aaa: {
      normal: ratio >= WCAG_THRESHOLDS.aaaNormal,
      large: ratio >= WCAG_THRESHOLDS.aaaLarge,
    },
  };
}

export function formatRatio(ratio: number): string {
  return `${Number(ratio.toFixed(2))}:1`;
}
