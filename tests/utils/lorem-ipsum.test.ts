import { describe, expect, it } from "vitest";
import { generateLorem } from "~/utils/lorem-ipsum";

/** Always picks the middle of any range, so output is predictable. */
const steady = () => 0.5;

describe("generateLorem", () => {
  it("should open with the expected line when asked to", () => {
    const text = generateLorem({ unit: "sentences", count: 2 }, steady);

    expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(true);
  });

  it("should leave the opener out when asked not to", () => {
    const text = generateLorem(
      { unit: "sentences", count: 1, startWithLorem: false },
      steady,
    );

    expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(false);
    expect(text.endsWith(".")).toBe(true);
  });

  it("should return the requested number of paragraphs", () => {
    const text = generateLorem({ unit: "paragraphs", count: 3 }, steady);

    expect(text.split("\n\n")).toHaveLength(3);
  });

  it("should return the requested number of words", () => {
    const text = generateLorem(
      { unit: "words", count: 12, startWithLorem: false },
      steady,
    );

    expect(text.replace(".", "").split(" ")).toHaveLength(12);
  });

  it("should clamp the count, so a pasted number cannot hang the page", () => {
    const tooMany = generateLorem({ unit: "paragraphs", count: 5000 }, steady);
    const tooFew = generateLorem({ unit: "paragraphs", count: -4 }, steady);

    expect(tooMany.split("\n\n")).toHaveLength(100);
    expect(tooFew.split("\n\n")).toHaveLength(1);
  });

  it("should end every sentence with a full stop", () => {
    const text = generateLorem({ unit: "paragraphs", count: 2 }, steady);

    expect(text.trim().endsWith(".")).toBe(true);
  });
});
