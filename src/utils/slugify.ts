export interface SlugOptions {
  separator?: string;
  /** Cuts at the last whole word, so a slug never ends mid-word. */
  maxLength?: number;
}

/**
 * Turns a heading into a URL segment: accents folded, symbols dropped,
 * separators collapsed.
 */
export function slugify(
  input: string,
  { separator = "-", maxLength }: SlugOptions = {},
): string {
  const slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00df]/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((part) => part !== "")
    .join(separator);

  if (maxLength === undefined || slug.length <= maxLength) {
    return slug;
  }

  const cut = slug.slice(0, maxLength);
  const lastSeparator = cut.lastIndexOf(separator);

  return lastSeparator > 0 ? cut.slice(0, lastSeparator) : cut;
}
