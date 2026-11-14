export const CASE_NAMES = [
  "camel",
  "pascal",
  "snake",
  "kebab",
  "constant",
  "title",
  "sentence",
] as const;

export type CaseName = (typeof CASE_NAMES)[number];

/**
 * Splits any of the usual casings into plain words. Acronyms stay whole:
 * `parseHTTPResponse` becomes `parse`, `HTTP`, `Response`.
 */
export function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_\-.]+/)
    .filter((word) => word !== "");
}

const upperFirst = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export function toCase(input: string, name: CaseName): string {
  const words = splitWords(input);

  if (words.length === 0) {
    return "";
  }

  const lower = words.map((word) => word.toLowerCase());

  switch (name) {
    case "camel":
      return lower
        .map((word, index) => (index === 0 ? word : upperFirst(word)))
        .join("");
    case "pascal":
      return lower.map(upperFirst).join("");
    case "snake":
      return lower.join("_");
    case "kebab":
      return lower.join("-");
    case "constant":
      return lower.join("_").toUpperCase();
    case "title":
      return lower.map(upperFirst).join(" ");
    case "sentence":
      return upperFirst(lower.join(" "));
  }
}
