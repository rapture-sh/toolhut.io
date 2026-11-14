import { describe, expect, it } from "vitest";
import {
  compileRegex,
  findMatches,
  RegexError,
  replaceMatches,
  splitByMatches,
} from "~/utils/regex-tester";

describe("compileRegex", () => {
  it("compiles a pattern with its flags", () => {
    const regex = compileRegex("ab+", "i");

    expect(regex.test("ABBB")).toBe(true);
  });

  it("asks for a pattern when none was given", () => {
    expect(() => compileRegex("", "g")).toThrow(RegexError);
  });

  it("rejects a pattern the engine cannot read", () => {
    expect(() => compileRegex("(unclosed", "")).toThrow(RegexError);
  });

  it("rejects a flag that does not exist", () => {
    expect(() => compileRegex("a", "q")).toThrow(RegexError);
  });
});

describe("findMatches", () => {
  it("finds every match without the global flag", () => {
    const matches = findMatches(compileRegex("\\d+", ""), "a1 b22 c333");

    expect(matches.map((match) => match.text)).toEqual(["1", "22", "333"]);
    expect(matches.map((match) => match.index)).toEqual([1, 4, 8]);
  });

  it("keeps the name of a named group", () => {
    const matches = findMatches(
      compileRegex("(?<year>\\d{4})-(?<month>\\d{2})", ""),
      "2026-11",
    );

    expect(matches[0].groups).toEqual([
      { number: 1, name: "year", value: "2026" },
      { number: 2, name: "month", value: "11" },
    ]);
  });

  it("reports a group that took no part in the match", () => {
    const matches = findMatches(compileRegex("(a)|(b)", ""), "b");

    expect(matches[0].groups).toEqual([
      { number: 1, name: null, value: null },
      { number: 2, name: null, value: "b" },
    ]);
  });

  it("counts groups past a non-capturing one", () => {
    const matches = findMatches(compileRegex("(?:x)(y)", ""), "xy");

    expect(matches[0].groups).toEqual([{ number: 1, name: null, value: "y" }]);
  });

  it("walks past a zero length match instead of looping", () => {
    const matches = findMatches(compileRegex("a*", "g"), "bb");

    expect(matches.map((match) => match.index)).toEqual([0, 1, 2]);
  });

  it("stops at the limit", () => {
    expect(findMatches(compileRegex("a", ""), "aaaaaaaaaa", 3)).toHaveLength(3);
  });

  it("leaves the caller's regex where it was", () => {
    const regex = compileRegex("a", "g");
    findMatches(regex, "aaa");

    expect(regex.lastIndex).toBe(0);
  });

  it("returns nothing for empty text", () => {
    expect(findMatches(compileRegex("a", "g"), "")).toEqual([]);
  });

  it("returns nothing when the pattern does not match", () => {
    expect(findMatches(compileRegex("z", ""), "abc")).toEqual([]);
  });
});

describe("replaceMatches", () => {
  it("replaces every match even without the global flag", () => {
    expect(replaceMatches(compileRegex("o", ""), "toolhut too", "0")).toBe(
      "t00lhut t00",
    );
  });

  it("puts a numbered group into the replacement", () => {
    expect(
      replaceMatches(compileRegex("(\\w+)@(\\w+)", ""), "ada@toolhut", "$2:$1"),
    ).toBe("toolhut:ada");
  });

  it("puts a named group into the replacement", () => {
    expect(
      replaceMatches(compileRegex("(?<word>\\w+)", ""), "hello", "[$<word>]"),
    ).toBe("[hello]");
  });

  it("returns the text unchanged when nothing matches", () => {
    expect(replaceMatches(compileRegex("z", ""), "abc", "x")).toBe("abc");
  });
});

describe("splitByMatches", () => {
  it("cuts the text into unmatched and matched runs", () => {
    const text = "a1 b22";
    const parts = splitByMatches(
      text,
      findMatches(compileRegex("\\d+", ""), text),
    );

    expect(parts).toEqual([
      { text: "a", match: false },
      { text: "1", match: true },
      { text: " b", match: false },
      { text: "22", match: true },
    ]);
  });

  it("keeps the whole text when the parts are joined back up", () => {
    const text = "one two three";
    const parts = splitByMatches(
      text,
      findMatches(compileRegex("t\\w+", ""), text),
    );

    expect(parts.map((part) => part.text).join("")).toBe(text);
  });

  it("drops zero length matches", () => {
    const text = "bb";
    const parts = splitByMatches(
      text,
      findMatches(compileRegex("a*", ""), text),
    );

    expect(parts).toEqual([{ text: "bb", match: false }]);
  });

  it("returns one unmatched run when there are no matches", () => {
    expect(splitByMatches("abc", [])).toEqual([{ text: "abc", match: false }]);
  });
});
