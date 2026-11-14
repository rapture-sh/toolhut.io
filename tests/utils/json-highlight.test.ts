import { describe, expect, it } from "vitest";
import { highlightJson, type JsonTokenKind } from "~/utils/json-highlight";

const text = (value: unknown, indent?: number) =>
  highlightJson(value, indent)
    .map((token) => token.text)
    .join("");

const kindOf = (value: unknown, piece: string): JsonTokenKind | undefined =>
  highlightJson(value).find((token) => token.text === piece)?.kind;

describe("highlightJson", () => {
  it("writes exactly what JSON.stringify would write", () => {
    const value = {
      name: "toolhut",
      count: 42,
      ratio: -0.5,
      ok: true,
      missing: null,
      tags: ["dev", "text"],
      nested: { deep: { deeper: [1, { last: false }] } },
      empty: {},
      none: [],
    };

    expect(text(value)).toBe(JSON.stringify(value, null, 2));
  });

  it("honours a different indent", () => {
    const value = { a: { b: 1 } };

    expect(text(value, 4)).toBe(JSON.stringify(value, null, 4));
  });

  it("labels each kind of value", () => {
    const value = { key: "word", n: 7, yes: true, nothing: null };

    expect(kindOf(value, '"key"')).toBe("key");
    expect(kindOf(value, '"word"')).toBe("string");
    expect(kindOf(value, "7")).toBe("number");
    expect(kindOf(value, "true")).toBe("boolean");
    expect(kindOf(value, "null")).toBe("null");
  });

  it("keeps a brace inside a string out of the structure", () => {
    const tokens = highlightJson({ tricky: '{"not": "real"}' });
    const braces = tokens.filter(
      (token) => token.kind === "punctuation" && token.text.includes('"not"'),
    );

    expect(braces).toEqual([]);
    expect(
      kindOf({ tricky: '{"not": "real"}' }, '"{\\"not\\": \\"real\\"}"'),
    ).toBe("string");
  });

  it("escapes a quote in a key rather than breaking the markup", () => {
    expect(text({ 'a"b': 1 })).toBe(JSON.stringify({ 'a"b': 1 }, null, 2));
  });

  it("handles a bare value with no object around it", () => {
    expect(text("just a string")).toBe('"just a string"');
    expect(text(12)).toBe("12");
    expect(text(null)).toBe("null");
  });

  it("writes a number JSON cannot hold as null, the way stringify does", () => {
    expect(text({ broken: Number.POSITIVE_INFINITY })).toBe(
      JSON.stringify({ broken: Number.POSITIVE_INFINITY }, null, 2),
    );
  });

  it("drops an undefined member, the way stringify does", () => {
    const value = { kept: 1, gone: undefined };

    expect(text(value)).toBe(JSON.stringify(value, null, 2));
  });
});
