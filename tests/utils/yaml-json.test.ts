import { describe, expect, it } from "vitest";
import { jsonToYaml, YamlParseError, yamlToJson } from "~/utils/yaml-json";

const INDENT = { indent: 2 } as const;

describe("yamlToJson", () => {
  it("should convert a mapping with a nested list", () => {
    const json = yamlToJson(
      "name: toolhut\ntags:\n  - data\n  - dev\n",
      INDENT,
    );

    expect(JSON.parse(json)).toEqual({
      name: "toolhut",
      tags: ["data", "dev"],
    });
  });

  it("should indent the JSON by the width it is given", () => {
    expect(yamlToJson("a: 1", { indent: 4 })).toBe('{\n    "a": 1\n}');
  });

  it("should return an empty string for blank input", () => {
    expect(yamlToJson("   \n", INDENT)).toBe("");
  });

  it("should report the line and column of a broken document", () => {
    try {
      yamlToJson("a:\n- 1\n b: 2", INDENT);
      expect.unreachable("that YAML should not parse");
    } catch (error) {
      expect(error).toBeInstanceOf(YamlParseError);
      if (error instanceof YamlParseError) {
        expect(error.line).toBe(2);
        expect(error.column).toBe(3);
        expect(error.message).not.toContain("\n");
      }
    }
  });

  it("should explain a tab used as indentation", () => {
    expect(() => yamlToJson("a:\n\t- 1", INDENT)).toThrow(/Tabs are not/);
  });

  it("should explain a file holding more than one document", () => {
    expect(() => yamlToJson("---\na: 1\n---\nb: 2", INDENT)).toThrow(
      /more than one document/,
    );
  });
});

describe("jsonToYaml", () => {
  it("should convert an object to YAML", () => {
    expect(jsonToYaml('{"a":1,"b":["x","y"]}')).toBe(
      "a: 1\nb:\n  - x\n  - y\n",
    );
  });

  it("should leave a long string on one line", () => {
    const long = "word ".repeat(40).trim();

    expect(jsonToYaml(JSON.stringify({ a: long }))).toBe(`a: ${long}\n`);
  });

  it("should return an empty string for blank input", () => {
    expect(jsonToYaml("")).toBe("");
  });

  it("should reject text that is not JSON", () => {
    expect(() => jsonToYaml("{nope}")).toThrow(YamlParseError);
  });

  it("should round-trip a document", () => {
    const yaml = "name: toolhut\ncount: 3\ntags:\n  - data\n  - dev\n";

    expect(jsonToYaml(yamlToJson(yaml, INDENT))).toBe(yaml);
  });
});
