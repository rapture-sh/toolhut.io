import { describe, expect, it } from "vitest";
import { splitWords, toCase } from "~/utils/case-converter";

describe("splitWords", () => {
  it("splits each of the usual casings the same way", () => {
    expect(splitWords("helloWorldAgain")).toEqual(["hello", "World", "Again"]);
    expect(splitWords("hello_world_again")).toEqual([
      "hello",
      "world",
      "again",
    ]);
    expect(splitWords("hello-world-again")).toEqual([
      "hello",
      "world",
      "again",
    ]);
    expect(splitWords("Hello World Again")).toEqual([
      "Hello",
      "World",
      "Again",
    ]);
  });

  it("keeps an acronym whole instead of one word per letter", () => {
    expect(splitWords("parseHTTPResponse")).toEqual([
      "parse",
      "HTTP",
      "Response",
    ]);
  });

  it("keeps digits with the word they belong to", () => {
    expect(splitWords("base64Encode")).toEqual(["base64", "Encode"]);
  });

  it("returns nothing for input with no words in it", () => {
    expect(splitWords("   __  -- ")).toEqual([]);
  });
});

describe("toCase", () => {
  const input = "parse HTTP response";

  it("writes each casing", () => {
    expect(toCase(input, "camel")).toBe("parseHttpResponse");
    expect(toCase(input, "pascal")).toBe("ParseHttpResponse");
    expect(toCase(input, "snake")).toBe("parse_http_response");
    expect(toCase(input, "kebab")).toBe("parse-http-response");
    expect(toCase(input, "constant")).toBe("PARSE_HTTP_RESPONSE");
    expect(toCase(input, "title")).toBe("Parse Http Response");
    expect(toCase(input, "sentence")).toBe("Parse http response");
  });

  it("converts between casings, not just from plain words", () => {
    expect(toCase("user_first_name", "camel")).toBe("userFirstName");
    expect(toCase("userFirstName", "kebab")).toBe("user-first-name");
  });

  it("returns an empty string when there is nothing to convert", () => {
    expect(toCase("", "camel")).toBe("");
    expect(toCase("  -_ ", "snake")).toBe("");
  });
});
