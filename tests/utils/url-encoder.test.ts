import { describe, expect, it } from "vitest";
import {
  decodeUrl,
  encodeUrl,
  parseQuery,
  UrlDecodeError,
} from "~/utils/url-encoder";

describe("encodeUrl", () => {
  it("escapes everything a value may not contain", () => {
    expect(encodeUrl("a b&c=d/e", "component")).toBe("a%20b%26c%3Dd%2Fe");
  });

  it("leaves the characters a whole URL needs alone", () => {
    expect(encodeUrl("https://toolhut.io/a b?x=1&y=2", "full")).toBe(
      "https://toolhut.io/a%20b?x=1&y=2",
    );
  });
});

describe("decodeUrl", () => {
  it("round-trips an encoded value", () => {
    const original = "héllo world/&?";

    expect(decodeUrl(encodeUrl(original, "component"), "component")).toBe(
      original,
    );
  });

  it("rejects a malformed sequence instead of returning rubbish", () => {
    expect(() => decodeUrl("%E0%A4%A", "component")).toThrow(UrlDecodeError);
  });
});

describe("parseQuery", () => {
  it("reads the query out of a whole URL", () => {
    expect(parseQuery("https://toolhut.io/x?a=1&b=two")).toEqual([
      { key: "a", value: "1" },
      { key: "b", value: "two" },
    ]);
  });

  it("reads a bare query string, with or without the question mark", () => {
    expect(parseQuery("?a=1")).toEqual([{ key: "a", value: "1" }]);
    expect(parseQuery("a=1")).toEqual([{ key: "a", value: "1" }]);
  });

  it("decodes values and keeps repeated keys", () => {
    expect(parseQuery("?q=hello%20world&tag=a&tag=b")).toEqual([
      { key: "q", value: "hello world" },
      { key: "tag", value: "a" },
      { key: "tag", value: "b" },
    ]);
  });

  it("stops at the fragment", () => {
    expect(parseQuery("https://toolhut.io/x?a=1#section")).toEqual([
      { key: "a", value: "1" },
    ]);
  });

  it("returns nothing for empty input", () => {
    expect(parseQuery("   ")).toEqual([]);
  });
});
