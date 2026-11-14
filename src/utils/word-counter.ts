/** Words a minute, the figure most reading time estimates use. */
const READING_SPEED = 200;

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  /** Rounded up, so any text at all reads as at least a minute. */
  readingMinutes: number;
}

export function textStats(input: string): TextStats {
  const trimmed = input.trim();

  if (trimmed === "") {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).length;

  return {
    words,
    characters: input.length,
    charactersNoSpaces: input.replace(/\s/g, "").length,
    // A run of ., ! or ? closes one sentence, however many marks it uses.
    sentences: (trimmed.match(/[^.!?]+[.!?]*/g) ?? []).length,
    paragraphs: trimmed.split(/\n\s*\n/).filter((part) => part.trim() !== "")
      .length,
    lines: input.split("\n").length,
    readingMinutes: Math.ceil(words / READING_SPEED),
  };
}
