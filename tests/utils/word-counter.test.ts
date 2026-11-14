import { describe, expect, it } from "vitest";
import { textStats } from "~/utils/word-counter";

describe("textStats", () => {
  it("should count an ordinary sentence", () => {
    const stats = textStats("The quick brown fox.");

    expect(stats.words).toBe(4);
    expect(stats.characters).toBe(20);
    expect(stats.charactersNoSpaces).toBe(17);
    expect(stats.sentences).toBe(1);
    expect(stats.paragraphs).toBe(1);
  });

  it("should return zeroes for empty and whitespace only input", () => {
    const empty = textStats("");
    const blank = textStats("   \n\n  ");

    expect(empty.words).toBe(0);
    expect(blank.words).toBe(0);
    expect(blank.readingMinutes).toBe(0);
  });

  it("should treat runs of whitespace as one separator", () => {
    expect(textStats("one   two\n\nthree\tfour").words).toBe(4);
  });

  it("should count paragraphs by blank lines, not by newlines", () => {
    const stats = textStats("one\ntwo\n\nthree");

    expect(stats.paragraphs).toBe(2);
    expect(stats.lines).toBe(4);
  });

  it("should count a sentence per closing mark, however many are used", () => {
    expect(textStats("Really?! Yes. No!").sentences).toBe(3);
  });

  it("should round reading time up, so short text still reads as a minute", () => {
    const short = textStats("a few words only");
    const long = textStats(Array.from({ length: 420 }, () => "word").join(" "));

    expect(short.readingMinutes).toBe(1);
    expect(long.readingMinutes).toBe(3);
  });
});
