import { describe, expect, it } from "vitest";
import { JsonParseError, jsonToTypeScript } from "~/utils/json-to-typescript";

describe("jsonToTypeScript", () => {
  it("turns a flat object into one interface", () => {
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

  it("names a nested interface after its key", () => {
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

  it("merges array elements and marks a missing key optional", () => {
    expect(
      jsonToTypeScript('{"users":[{"id":1,"nick":"ada"},{"id":2}]}'),
    ).toContain("  nick?: string;");
  });

  it("names an array element with a naive singular", () => {
    const output = jsonToTypeScript('{"categories":[{"id":1}]}');

    expect(output).toContain("  categories: Category[];");
    expect(output).toContain("export interface Category {");
  });

  it("unions mixed primitives in an array", () => {
    expect(jsonToTypeScript('{"mixed":[1,"a"]}')).toContain(
      "  mixed: (number | string)[];",
    );
  });

  it("uses unknown[] for an empty array", () => {
    expect(jsonToTypeScript('{"tags":[]}')).toContain("  tags: unknown[];");
  });

  it("keeps null as part of a union", () => {
    expect(
      jsonToTypeScript('{"users":[{"nick":"ada"},{"nick":null}]}'),
    ).toContain("  nick: string | null;");
  });

  it("types a key that is only ever null", () => {
    expect(jsonToTypeScript('{"deleted":null}')).toContain("  deleted: null;");
  });

  it("quotes a key that is not an identifier", () => {
    expect(jsonToTypeScript('{"my-key":1}')).toContain('  "my-key": number;');
  });

  it("uses Record for an object with no keys", () => {
    expect(jsonToTypeScript('{"meta":{}}')).toContain(
      "  meta: Record<string, unknown>;",
    );
  });

  it("gives two interfaces from the same key different names", () => {
    const output = jsonToTypeScript(
      '{"a":{"name":{"x":1}},"b":{"name":{"y":2}}}',
    );

    expect(output).toContain("export interface Name {");
    expect(output).toContain("export interface Name2 {");
  });

  it("takes a root name and makes it an identifier", () => {
    expect(jsonToTypeScript('{"a":1}', { rootName: "user profile" })).toContain(
      "export interface UserProfile {",
    );
  });

  it("describes a root array of objects with the root interface", () => {
    expect(jsonToTypeScript('[{"id":1},{"id":2}]')).toBe(
      ["export interface Root {", "  id: number;", "}"].join("\n"),
    );
  });

  it("aliases a root that is not an object", () => {
    expect(jsonToTypeScript('["a","b"]')).toBe("export type Root = string[];");
  });

  it("aliases a root scalar", () => {
    expect(jsonToTypeScript("42")).toBe("export type Root = number;");
  });

  it("returns an empty string for blank input", () => {
    expect(jsonToTypeScript("  \n ")).toBe("");
  });

  it("rejects input that is not JSON", () => {
    expect(() => jsonToTypeScript("{oops}")).toThrow(JsonParseError);
  });
});
