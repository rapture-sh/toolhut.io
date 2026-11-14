import { describe, expect, it } from "vitest";
import { JsonParseError, jsonToTypeScript } from "~/utils/json-to-typescript";

describe("jsonToTypeScript", () => {
  it("should turn a flat object into one interface", () => {
    expect(jsonToTypeScript('{"name":"ada","age":36,"active":true}')).toBe(
      [
        "export interface Root {",
        "  name: string;",
        "  age: number;",
        "  active: boolean;",
        "}",
      ].join("\n"),
    );
  });

  it("should name a nested interface after its key", () => {
    expect(jsonToTypeScript('{"user":{"id":1}}')).toBe(
      [
        "export interface Root {",
        "  user: User;",
        "}",
        "",
        "export interface User {",
        "  id: number;",
        "}",
      ].join("\n"),
    );
  });

  it("should merge array elements and mark a missing key optional", () => {
    expect(
      jsonToTypeScript('{"users":[{"id":1,"nick":"ada"},{"id":2}]}'),
    ).toContain("  nick?: string;");
  });

  it("should name an array element with a naive singular", () => {
    const output = jsonToTypeScript('{"categories":[{"id":1}]}');

    expect(output).toContain("  categories: Category[];");
    expect(output).toContain("export interface Category {");
  });

  it("should union mixed primitives in an array", () => {
    expect(jsonToTypeScript('{"mixed":[1,"a"]}')).toContain(
      "  mixed: (number | string)[];",
    );
  });

  it("should use unknown[] for an empty array", () => {
    expect(jsonToTypeScript('{"tags":[]}')).toContain("  tags: unknown[];");
  });

  it("should keep null as part of a union", () => {
    expect(
      jsonToTypeScript('{"users":[{"nick":"ada"},{"nick":null}]}'),
    ).toContain("  nick: string | null;");
  });

  it("should type a key that is only ever null", () => {
    expect(jsonToTypeScript('{"deleted":null}')).toContain("  deleted: null;");
  });

  it("should quote a key that is not an identifier", () => {
    expect(jsonToTypeScript('{"my-key":1}')).toContain('  "my-key": number;');
  });

  it("should use Record for an object with no keys", () => {
    expect(jsonToTypeScript('{"meta":{}}')).toContain(
      "  meta: Record<string, unknown>;",
    );
  });

  it("should give two interfaces from the same key different names", () => {
    const output = jsonToTypeScript(
      '{"a":{"name":{"x":1}},"b":{"name":{"y":2}}}',
    );

    expect(output).toContain("export interface Name {");
    expect(output).toContain("export interface Name2 {");
  });

  it("should take a root name and make it an identifier", () => {
    expect(jsonToTypeScript('{"a":1}', { rootName: "user profile" })).toContain(
      "export interface UserProfile {",
    );
  });

  it("should describe a root array of objects with the root interface", () => {
    expect(jsonToTypeScript('[{"id":1},{"id":2}]')).toBe(
      ["export interface Root {", "  id: number;", "}"].join("\n"),
    );
  });

  it("should aliase a root that is not an object", () => {
    expect(jsonToTypeScript('["a","b"]')).toBe("export type Root = string[];");
  });

  it("should aliase a root scalar", () => {
    expect(jsonToTypeScript("42")).toBe("export type Root = number;");
  });

  it("should return an empty string for blank input", () => {
    expect(jsonToTypeScript("  \n ")).toBe("");
  });

  it("should reject input that is not JSON", () => {
    expect(() => jsonToTypeScript("{oops}")).toThrow(JsonParseError);
  });
});
