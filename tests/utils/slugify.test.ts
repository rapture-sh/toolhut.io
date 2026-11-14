import { describe, expect, it } from "vitest";
import { slugify } from "~/utils/slugify";

describe("slugify", () => {
  it("should lowercase and join words with a hyphen", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should fold accents instead of dropping the letter", () => {
    expect(slugify("Crème brûlée")).toBe("creme-brulee");
    expect(slugify("Zürich straße")).toBe("zurich-strasse");
  });

  it("should drop punctuation and collapse the gaps it leaves", () => {
    expect(slugify("What's new, in 2026?!")).toBe("what-s-new-in-2026");
  });

  it("should never start or ends with the separator", () => {
    expect(slugify("  --- hello ---  ")).toBe("hello");
  });

  it("should take a different separator", () => {
    expect(slugify("Hello World", { separator: "_" })).toBe("hello_world");
  });

  it("should cut at a word boundary when a maximum is given", () => {
    expect(slugify("the quick brown fox", { maxLength: 14 })).toBe("the-quick");
  });

  it("should return an empty string when nothing survives", () => {
    expect(slugify("!!! ???")).toBe("");
  });
});
