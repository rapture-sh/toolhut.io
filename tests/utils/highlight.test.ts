import { describe, expect, it } from "vitest";
import {
  HIGHLIGHT_LANGUAGES,
  type HighlightLanguage,
  type TokenKind,
  tokenise,
} from "~/utils/highlight";

const SAMPLES: Record<HighlightLanguage, string> = {
  json: '{\n  "name": "toolhut",\n  "count": 42,\n  "ok": true,\n  "gone": null\n}',
  yaml: "# a note\nname: toolhut\ncount: 42\nlist:\n  - one\n  - two\n",
  toml: '# a note\n[server]\nname = "toolhut"\nport = 8080\nlive = true\n',
  xml: '<?xml version="1.0"?>\n<!-- a note -->\n<tools count="2">\n  <tool id="base64">Base64</tool>\n</tools>',
  sql: "-- a note\nSELECT name, count(*)\nFROM tools\nWHERE slug = 'base64';",
  typescript:
    "// a note\nexport interface Root {\n  name: string;\n  count: number;\n}",
  plain: "nothing special here",
};

const kindsOf = (source: string, language: HighlightLanguage, text: string) =>
  tokenise(source, language)
    .filter((token) => token.text === text)
    .map((token) => token.kind);

describe("tokenise", () => {
  it("should give back exactly what it was given, for every language", () => {
    for (const language of HIGHLIGHT_LANGUAGES) {
      const source = SAMPLES[language];
      const joined = tokenise(source, language)
        .map((token) => token.text)
        .join("");

      expect(joined, language).toBe(source);
    }
  });

  it("should leave a language it does not know as one plain piece", () => {
    expect(tokenise("some words", "plain")).toEqual([
      { text: "some words", kind: "plain" },
    ]);
  });

  it("should have nothing to say about an empty source", () => {
    expect(tokenise("", "json")).toEqual([]);
  });

  it("should tell a JSON key from a JSON string", () => {
    expect(kindsOf(SAMPLES.json, "json", '"name"')).toEqual(["key"]);
    expect(kindsOf(SAMPLES.json, "json", '"toolhut"')).toEqual(["string"]);
    expect(kindsOf(SAMPLES.json, "json", "42")).toEqual(["number"]);
    expect(kindsOf(SAMPLES.json, "json", "true")).toEqual(["boolean"]);
    expect(kindsOf(SAMPLES.json, "json", "null")).toEqual(["null"]);
  });

  it("should keep a brace inside a JSON string out of the structure", () => {
    const tokens = tokenise('{"tricky": "{not real}"}', "json");
    const braces = tokens.filter((token) => token.kind === "punctuation");

    expect(braces.map((token) => token.text)).toEqual(["{", ":", "}"]);
    expect(kindsOf('{"tricky": "{not real}"}', "json", '"{not real}"')).toEqual(
      ["string"],
    );
  });

  it("should read a YAML comment and key", () => {
    expect(kindsOf(SAMPLES.yaml, "yaml", "# a note")).toEqual(["comment"]);
    expect(kindsOf(SAMPLES.yaml, "yaml", "name")).toEqual(["key"]);
  });

  it("should read a TOML table and key", () => {
    expect(kindsOf(SAMPLES.toml, "toml", "[server]")).toEqual(["keyword"]);
    expect(kindsOf(SAMPLES.toml, "toml", "port")).toEqual(["key"]);
  });

  it("should read an XML tag, attribute and value", () => {
    expect(kindsOf(SAMPLES.xml, "xml", "<tools")).toEqual(["tag"]);
    expect(kindsOf(SAMPLES.xml, "xml", "count")).toEqual(["attribute"]);
    expect(kindsOf(SAMPLES.xml, "xml", '"2"')).toEqual(["string"]);
    expect(kindsOf(SAMPLES.xml, "xml", "<!-- a note -->")).toEqual(["comment"]);
  });

  it("should read SQL keywords whatever their case", () => {
    expect(kindsOf(SAMPLES.sql, "sql", "SELECT")).toEqual(["keyword"]);
    expect(kindsOf("select 1", "sql", "select")).toEqual(["keyword"]);
    expect(kindsOf(SAMPLES.sql, "sql", "'base64'")).toEqual(["string"]);
  });

  it("should read a TypeScript declaration", () => {
    expect(kindsOf(SAMPLES.typescript, "typescript", "interface")).toEqual([
      "keyword",
    ]);
    expect(kindsOf(SAMPLES.typescript, "typescript", "string")).toEqual([
      "type",
    ]);
  });

  it("should never lose a character of awkward input", () => {
    const awkward = '{"a":"\\"quoted\\"","b":[1,-2.5e10],"c":"line\\nbreak"}';
    const kinds = new Set<TokenKind>(
      tokenise(awkward, "json").map((token) => token.kind),
    );

    expect(
      tokenise(awkward, "json")
        .map((token) => token.text)
        .join(""),
    ).toBe(awkward);
    expect(kinds.has("string")).toBe(true);
  });
});
