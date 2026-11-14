export class UrlDecodeError extends Error {
  constructor(message = "That is not a valid percent encoded string.") {
    super(message);
    this.name = "UrlDecodeError";
  }
}

/**
 * `component` escapes everything a value may not contain, `full` keeps the
 * characters a whole URL needs to stay a URL.
 */
export type UrlScope = "component" | "full";

export function encodeUrl(input: string, scope: UrlScope): string {
  return scope === "component" ? encodeURIComponent(input) : encodeURI(input);
}

export function decodeUrl(input: string, scope: UrlScope): string {
  try {
    return scope === "component" ? decodeURIComponent(input) : decodeURI(input);
  } catch {
    throw new UrlDecodeError();
  }
}

export interface QueryParameter {
  key: string;
  value: string;
}

/** The query string of a URL, or a bare query string, as readable pairs. */
export function parseQuery(input: string): QueryParameter[] {
  const trimmed = input.trim();
  if (trimmed === "") {
    return [];
  }

  const start = trimmed.indexOf("?");
  const query = start === -1 ? trimmed : trimmed.slice(start + 1);
  const hash = query.indexOf("#");

  return [
    ...new URLSearchParams(hash === -1 ? query : query.slice(0, hash)),
  ].map(([key, value]) => ({ key, value }));
}
