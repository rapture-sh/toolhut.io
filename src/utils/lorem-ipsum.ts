const WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
  "curabitur",
  "pretium",
  "tincidunt",
  "lacus",
  "nulla",
  "gravida",
  "orci",
  "a",
  "odio",
  "nullam",
  "varius",
  "turpis",
  "commodo",
  "sagittis",
];

const OPENER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export type LoremUnit = "paragraphs" | "sentences" | "words";

export interface LoremOptions {
  unit: LoremUnit;
  /** Clamped to 1..100, so a pasted number cannot hang the page. */
  count: number;
  startWithLorem?: boolean;
}

/** Randomness is injected so tests can pin the output. */
export type Random = () => number;

function pick(random: Random): string {
  return WORDS[Math.floor(random() * WORDS.length)] ?? "lorem";
}

function between(random: Random, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function sentence(random: Random): string {
  const words = Array.from({ length: between(random, 6, 14) }, () =>
    pick(random),
  );
  const text = words.join(" ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

function paragraph(random: Random): string {
  return Array.from({ length: between(random, 3, 6) }, () =>
    sentence(random),
  ).join(" ");
}

export function generateLorem(
  { unit, count, startWithLorem = true }: LoremOptions,
  random: Random = Math.random,
): string {
  const amount = Math.min(Math.max(1, Math.trunc(count)), 100);

  if (unit === "words") {
    const words = Array.from({ length: amount }, () => pick(random));
    if (startWithLorem) {
      words.splice(0, Math.min(2, words.length), "lorem", "ipsum");
    }
    const text = words.join(" ");
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  }

  if (unit === "sentences") {
    const sentences = Array.from({ length: amount }, () => sentence(random));
    if (startWithLorem) {
      sentences[0] = OPENER;
    }
    return sentences.join(" ");
  }

  const paragraphs = Array.from({ length: amount }, () => paragraph(random));
  if (startWithLorem) {
    paragraphs[0] = `${OPENER} ${paragraphs[0]}`;
  }
  return paragraphs.join("\n\n");
}
