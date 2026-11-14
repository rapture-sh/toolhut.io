import { describe, expect, it } from "vitest";
import {
  formatJson,
  JsonParseError,
  minifyJson,
  parseJson,
} from "~/utils/json-formatter";

function parseError(input: string): JsonParseError {
  try {
    parseJson(input);
  } catch (error) {
    if (error instanceof JsonParseError) {
      return error;
    }
  }

  throw new Error(`${input} parsed without an error`);
}

describe("formatJson", () => {
  it("should indent with two spaces by default", () => {
    expect(formatJson('{"b":1,"a":[1,2]}')).toBe(
      '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}',
    );
  });

  it("should indent with four spaces", () => {
    expect(formatJson('{"a":1}', { indent: 4 })).toBe('{\n    "a": 1\n}');
  });

  it("should indent with a tab", () => {
    expect(formatJson('{"a":1}', { indent: "tab" })).toBe('{\n\t"a": 1\n}');
  });

  it("should sort keys at every level when asked", () => {
    expect(
      formatJson('{"b":{"d":1,"c":2},"a":3}', { indent: 2, sortKeys: true }),
    ).toBe('{\n  "a": 3,\n  "b": {\n    "c": 2,\n    "d": 1\n  }\n}');
  });

  it("should leave array order alone when sorting keys", () => {
    expect(minifyJson(formatJson("[3,1,2]", { sortKeys: true }))).toBe(
      "[3,1,2]",
    );
  });

  it("should sort keys of objects inside arrays", () => {
    expect(minifyJson(formatJson('[{"b":1,"a":2}]', { sortKeys: true }))).toBe(
      '[{"a":2,"b":1}]',
    );
  });

  it("should format a top level scalar", () => {
    expect(formatJson("42")).toBe("42");
  });

  it("should return an empty string for blank input", () => {
    expect(formatJson("   \n ")).toBe("");
  });

  it("should reject input that is not JSON", () => {
    expect(() => formatJson("{oops}")).toThrow(JsonParseError);
  });
});

describe("minifyJson", () => {
  it("should drop the whitespace between tokens", () => {
    expect(minifyJson('{\n  "a": [ 1, 2 ]\n}')).toBe('{"a":[1,2]}');
  });

  it("should round-trip a document through format and minify", () => {
    const compact = '{"name":"toolhut","tags":["dev","data"],"open":true}';

    expect(minifyJson(formatJson(compact, { indent: 4 }))).toBe(compact);
  });

  it("should return an empty string for blank input", () => {
    expect(minifyJson("")).toBe("");
  });
});

describe("parseJson", () => {
  it("should return the parsed value", () => {
    expect(parseJson('{"a":[1,null]}')).toEqual({ a: [1, null] });
  });

  it("should point at the line and column the bad token is on", () => {
    const error = parseError('{\n  "a": 1,\n  "b": oops\n}');

    expect(error.line).toBe(3);
    expect(error.column).toBe(8);
    expect(error.message).toContain("Line 3, column 8");
  });

  it("should point at a structural mistake further down the document", () => {
    const error = parseError('{\n  "a": 1\n  "b": 2\n}');

    expect(error.line).toBe(3);
  });

  it("should explain blank input instead of throwing a raw SyntaxError", () => {
    const error = parseError("");

    expect(error).toBeInstanceOf(JsonParseError);
    expect(error.line).toBe(1);
    expect(error.column).toBe(1);
  });

  it("should write a message without the engine's position noise", () => {
    expect(parseError('{"a": 1,}').message).not.toContain("position");
  });
});
