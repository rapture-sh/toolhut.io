const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
  euro: "\u20ac",
  pound: "\u00a3",
  deg: "\u00b0",
};

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export interface EncodeOptions {
  /** Also escape every character outside ASCII, as a numeric entity. */
  nonAscii?: boolean;
}

export function encodeEntities(
  input: string,
  { nonAscii = false }: EncodeOptions = {},
): string {
  const escaped = input.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);

  if (!nonAscii) {
    return escaped;
  }

  return [...escaped]
    .map((char) => {
      const point = char.codePointAt(0) ?? 0;
      return point > 127 ? `&#${point};` : char;
    })
    .join("");
}

/** Named entities cover the common set; numeric entities are exhaustive. */
export function decodeEntities(input: string): string {
  return input.replace(
    /&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g,
    (match, body: string) => {
      if (body.startsWith("#x") || body.startsWith("#X")) {
        const point = Number.parseInt(body.slice(2), 16);
        return Number.isNaN(point) ? match : String.fromCodePoint(point);
      }

      if (body.startsWith("#")) {
        const point = Number.parseInt(body.slice(1), 10);
        return Number.isNaN(point) ? match : String.fromCodePoint(point);
      }

      return NAMED[body.toLowerCase()] ?? match;
    },
  );
}
