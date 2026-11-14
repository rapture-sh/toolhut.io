import type { PagePick } from "~/lib/pdf/build";
import { downloadName } from "~/utils/filename";

/** A page of the open document as the grid holds it. */
export interface PageCard {
  /** Stable while the list is dragged about, so a thumbnail stays put. */
  id: string;
  /** The page in the document it came from, counting from 1. */
  page: number;
  /** Quarter turns clockwise, kept inside 0 to 3. */
  turns: number;
  /** A dropped page stays in the list until the file is saved. */
  dropped: boolean;
}

/** How many pages are kept, dropped and turned, for the count above the grid. */
export interface PageSummary {
  total: number;
  kept: number;
  dropped: number;
  turned: number;
}

const FULL_CIRCLE = 4;

/** Every page of a document, in the order it already has. */
export function pagesFrom(count: number): PageCard[] {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

  return Array.from({ length: total }, (_, index) => ({
    id: `page-${index + 1}`,
    page: index + 1,
    turns: 0,
    dropped: false,
  }));
}

/** Quarter turns as a number of turns clockwise from upright, so 0 to 3. */
export function wrapTurns(quarters: number): number {
  if (!Number.isFinite(quarters)) {
    return 0;
  }

  const whole = Math.trunc(quarters);

  return ((whole % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
}

export function turnPage(
  cards: readonly PageCard[],
  id: string,
  quarters = 1,
): PageCard[] {
  return cards.map((card) =>
    card.id === id
      ? { ...card, turns: wrapTurns(card.turns + quarters) }
      : card,
  );
}

/** Turns every page that is still kept, which is what "Rotate all" does. */
export function turnAll(cards: readonly PageCard[], quarters = 1): PageCard[] {
  return cards.map((card) =>
    card.dropped ? card : { ...card, turns: wrapTurns(card.turns + quarters) },
  );
}

export function dropPage(cards: readonly PageCard[], id: string): PageCard[] {
  return cards.map((card) =>
    card.id === id ? { ...card, dropped: true } : card,
  );
}

export function restorePage(
  cards: readonly PageCard[],
  id: string,
): PageCard[] {
  return cards.map((card) =>
    card.id === id ? { ...card, dropped: false } : card,
  );
}

/**
 * The pages to keep, in list order, ready for `collectPages`. Every page comes
 * from the one open document, so each pick names source 0.
 */
export function keptPages(cards: readonly PageCard[]): PagePick[] {
  return cards
    .filter((card) => !card.dropped)
    .map((card) => ({ source: 0, page: card.page, turns: card.turns }));
}

export function summary(cards: readonly PageCard[]): PageSummary {
  const kept = cards.filter((card) => !card.dropped);

  return {
    total: cards.length,
    kept: kept.length,
    dropped: cards.length - kept.length,
    turned: kept.filter((card) => card.turns !== 0).length,
  };
}

/** `report.pdf` becomes `report-organized.pdf`. */
export function organizedName(original: string): string {
  return downloadName(original, { suffix: "organized", extension: "pdf" });
}
