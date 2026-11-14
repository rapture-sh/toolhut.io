export type JsonTokenKind =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "punctuation";

export interface JsonToken {
  text: string;
  kind: JsonTokenKind;
}

/**
 * JSON broken into pieces a view can colour. The walk is over the value
 * itself rather than over formatted text, so a brace inside a string can
 * never be mistaken for structure.
 *
 * Joining every `text` back together gives exactly what `JSON.stringify`
 * would have written with the same indent.
 */
export function highlightJson(value: unknown, indent = 2): JsonToken[] {
  const tokens: JsonToken[] = [];
  const pad = (depth: number) => " ".repeat(indent * depth);

  const push = (text: string, kind: JsonTokenKind) => {
    if (text !== "") {
      tokens.push({ text, kind });
    }
  };

  const write = (node: unknown, depth: number) => {
    if (node === null) {
      push("null", "null");
      return;
    }

    if (typeof node === "string") {
      push(JSON.stringify(node), "string");
      return;
    }

    if (typeof node === "number") {
      if (Number.isFinite(node)) {
        push(String(node), "number");
        return;
      }
      push("null", "null");
      return;
    }

    if (typeof node === "boolean") {
      push(String(node), "boolean");
      return;
    }

    if (Array.isArray(node)) {
      if (node.length === 0) {
        push("[]", "punctuation");
        return;
      }

      push("[\n", "punctuation");
      node.forEach((item, index) => {
        push(pad(depth + 1), "punctuation");
        write(item, depth + 1);
        push(index < node.length - 1 ? ",\n" : "\n", "punctuation");
      });
      push(`${pad(depth)}]`, "punctuation");
      return;
    }

    if (typeof node === "object") {
      const entries = Object.entries(node as Record<string, unknown>).filter(
        ([, item]) => item !== undefined,
      );

      if (entries.length === 0) {
        push("{}", "punctuation");
        return;
      }

      push("{\n", "punctuation");
      entries.forEach(([key, item], index) => {
        push(pad(depth + 1), "punctuation");
        push(JSON.stringify(key), "key");
        push(": ", "punctuation");
        write(item, depth + 1);
        push(index < entries.length - 1 ? ",\n" : "\n", "punctuation");
      });
      push(`${pad(depth)}}`, "punctuation");
      return;
    }

    // A function, a symbol or undefined. JSON cannot carry any of them.
    push("null", "null");
  };

  write(value, 0);

  return tokens;
}
