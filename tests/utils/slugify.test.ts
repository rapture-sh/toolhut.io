import { describe, expect, it } from "vitest";
import { slugify } from "~/utils/slugify";

describe("slugify", () => {
  it("lowercases and joins words with a hyphen", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("folds accents instead of dropping the letter", () => {
    expect(slugify("Crème brûlée")).toBe("creme-brulee");
    expect(slugify("Zürich straße")).toBe("zurich-strasse");
  });

  it("drops punctuation and collapses the gaps it leaves", () => {
    expect(slugify("What's new, in 2026?!")).toBe("what-s-new-in-2026");
  });

  it("never starts or ends with the separator", () => {
    expect(slugify("  --- hello ---  ")).toBe("hello");
  });

  it("takes a different separator", () => {
    expect(slugify("Hello World", { separator: "_" })).toBe("hello_world");
  });

  it("cuts at a word boundary when a maximum is given", () => {
    expect(slugify("the quick brown fox", { maxLength: 14 })).toBe("the-quick");
  });

  it("returns an empty string when nothing survives", () => {
    expect(slugify("!!! ???")).toBe("");
  });
});
