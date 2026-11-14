import { describe, expect, it } from "vitest";
import { jsonToToml, TomlParseError, tomlToJson } from "~/utils/toml-json";

const INDENT = { indent: 2 } as const;

describe("tomlToJson", () => {
  it("should convert a table and its values", () => {
    const json = tomlToJson(
      'title = "toolhut"\n\n[owner]\nname = "abi"\nage = 31\n',
      INDENT,
    );

    expect(JSON.parse(json)).toEqual({
      title: "toolhut",
      owner: { name: "abi", age: 31 },
    });
  });

  it("should write a date as ISO text, which JSON can hold", () => {
    const json = tomlToJson("day = 1979-05-27\n", INDENT);

    expect(JSON.parse(json)).toEqual({ day: "1979-05-27" });
  });

  it("should indent the JSON by the width it is given", () => {
    expect(tomlToJson("a = 1", { indent: 4 })).toBe('{\n    "a": 1\n}');
  });

  it("should return an empty string for blank input", () => {
    expect(tomlToJson("  \n ", INDENT)).toBe("");
  });

  it("should report where a broken document goes wrong", () => {
    try {
      tomlToJson("a = = 1", INDENT);
      expect.unreachable("that TOML should not parse");
    } catch (error) {
      expect(error).toBeInstanceOf(TomlParseError);
      if (error instanceof TomlParseError) {
        expect(error.line).toBe(1);
        expect(error.column).toBe(5);
        expect(error.message).toContain("line 1, column 5");
        expect(error.message).not.toContain("\n");
      }
    }
  });
});

describe("jsonToToml", () => {
  it("should convert an object to TOML", () => {
    expect(jsonToToml('{"a":1,"b":{"c":"x"}}')).toBe('a = 1\n\n[b]\nc = "x"\n');
  });

  it("should return an empty string for blank input", () => {
    expect(jsonToToml("")).toBe("");
  });

  it("should reject text that is not JSON", () => {
    expect(() => jsonToToml("{nope}")).toThrow(TomlParseError);
  });

  it("should reject a list at the top level", () => {
    expect(() => jsonToToml("[1, 2]")).toThrow(/top level/);
  });

  it("should name the key whose value is null", () => {
    expect(() => jsonToToml('{"a":{"b":null}}')).toThrow(/"a\.b"/);
  });

  it("should round-trip a document", () => {
    const toml = 'title = "toolhut"\n\n[owner]\nname = "abi"\n';

    expect(jsonToToml(tomlToJson(toml, INDENT))).toBe(toml);
  });
});
