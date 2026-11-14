export type TokenKind =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "comment"
  | "keyword"
  | "type"
  | "tag"
  | "attribute"
  | "punctuation"
  | "plain";

export interface Token {
  text: string;
  kind: TokenKind;
}

export const HIGHLIGHT_LANGUAGES = [
  "json",
  "yaml",
  "toml",
  "xml",
  "sql",
  "typescript",
  "plain",
] as const;

export type HighlightLanguage = (typeof HIGHLIGHT_LANGUAGES)[number];

interface Rule {
  kind: TokenKind;
  pattern: RegExp;
}

const rule = (kind: TokenKind, source: string, flags = ""): Rule => ({
  kind,
  pattern: new RegExp(source, `${flags}y`),
});

const NUMBER = String.raw`-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?`;
const DOUBLE_QUOTED = String.raw`"(?:[^"\\\n]|\\.)*"`;
const SINGLE_QUOTED = String.raw`'(?:[^'\\\n]|\\.)*'`;

const SQL_KEYWORDS =
  "select|from|where|group|by|order|having|limit|offset|insert|into|values|update|set|delete|create|table|alter|drop|index|view|join|inner|left|right|full|outer|cross|on|as|and|or|not|in|is|null|like|between|case|when|then|else|end|union|all|distinct|with|returning|primary|key|foreign|references|default|constraint|cascade|asc|desc|count|sum|avg|min|max|coalesce";

const TYPE_KEYWORDS =
  "export|import|from|interface|type|enum|class|extends|implements|readonly|const|let|var|function|return|declare|namespace|as";

const PRIMITIVES =
  "string|number|boolean|unknown|never|void|null|undefined|Record|Array|Date";

/** The rules are tried in order, so the specific ones come first. */
const RULES: Record<HighlightLanguage, Rule[]> = {
  json: [
    rule("key", `${DOUBLE_QUOTED}(?=\\s*:)`),
    rule("string", DOUBLE_QUOTED),
    rule("boolean", String.raw`\b(?:true|false)\b`),
    rule("null", String.raw`\bnull\b`),
    rule("number", NUMBER),
    rule("punctuation", String.raw`[{}\[\],:]`),
  ],
  yaml: [
    rule("comment", "#[^\\n]*"),
    rule("string", `${DOUBLE_QUOTED}|${SINGLE_QUOTED}`),
    rule("key", String.raw`[\w.$-]+(?=\s*:(?:\s|$))`),
    rule("boolean", String.raw`\b(?:true|false|yes|no|on|off)\b`, "i"),
    rule("null", String.raw`\bnull\b|~`),
    rule("number", NUMBER),
    rule("punctuation", String.raw`[-:\[\]{},|>]`),
  ],
  toml: [
    rule("comment", "#[^\\n]*"),
    rule("keyword", String.raw`\[\[?[^\]\n]+\]\]?`),
    rule(
      "string",
      `"""[\\s\\S]*?"""|'''[\\s\\S]*?'''|${DOUBLE_QUOTED}|${SINGLE_QUOTED}`,
    ),
    rule("key", String.raw`[\w.-]+(?=\s*=)`),
    rule("boolean", String.raw`\b(?:true|false)\b`),
    rule("number", String.raw`\d{4}-\d{2}-\d{2}(?:[T ][\d:.+Z-]+)?|${NUMBER}`),
    rule("punctuation", String.raw`[=\[\]{},]`),
  ],
  xml: [
    rule("comment", "<!--[\\s\\S]*?-->"),
    rule("keyword", String.raw`<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>`, "i"),
    rule("tag", String.raw`</?[\w:.-]+`),
    rule("string", `${DOUBLE_QUOTED}|${SINGLE_QUOTED}`),
    rule("attribute", String.raw`[\w:.-]+(?=\s*=)`),
    rule("punctuation", "/?>|="),
  ],
  sql: [
    rule("comment", String.raw`--[^\n]*|/\*[\s\S]*?\*/`),
    rule("string", SINGLE_QUOTED),
    rule("keyword", `\\b(?:${SQL_KEYWORDS})\\b`, "i"),
    rule("number", NUMBER),
    rule("punctuation", "[(),;*.]"),
  ],
  typescript: [
    rule("comment", String.raw`//[^\n]*|/\*[\s\S]*?\*/`),
    rule("string", `${DOUBLE_QUOTED}|${SINGLE_QUOTED}`),
    rule("keyword", `\\b(?:${TYPE_KEYWORDS})\\b`),
    rule("type", `\\b(?:${PRIMITIVES})\\b`),
    rule("boolean", String.raw`\b(?:true|false)\b`),
    rule("number", NUMBER),
    rule("punctuation", String.raw`[{}\[\]()<>;,:?|&]`),
  ],
  plain: [],
};

/**
 * Splits code into pieces a view can colour. Joining every `text` back
 * together gives exactly the source that went in, so nothing a tool produced
 * is lost on the way to the screen.
 */
export function tokenise(
  source: string,
  language: HighlightLanguage = "plain",
): Token[] {
  const rules = RULES[language];

  if (source === "" || rules.length === 0) {
    return source === "" ? [] : [{ text: source, kind: "plain" }];
  }

  const tokens: Token[] = [];
  let plain = "";
  let index = 0;

  const flush = () => {
    if (plain !== "") {
      tokens.push({ text: plain, kind: "plain" });
      plain = "";
    }
  };

  while (index < source.length) {
    let matched = false;

    for (const { kind, pattern } of rules) {
      pattern.lastIndex = index;
      const found = pattern.exec(source);

      if (found && found[0] !== "") {
        flush();
        tokens.push({ text: found[0], kind });
        index += found[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      plain += source[index];
      index += 1;
    }
  }

  flush();

  return tokens;
}
