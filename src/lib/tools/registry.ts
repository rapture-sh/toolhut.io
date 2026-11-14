import {
  Binary,
  Braces,
  Calculator,
  CalendarClock,
  Clock,
  Code,
  Dices,
  FileJson,
  Files,
  FileText,
  Fingerprint,
  GitCompare,
  Image,
  KeyRound,
  Link,
  Link2,
  Lock,
  Minimize2,
  Palette,
  Pilcrow,
  QrCode,
  Regex,
  Scissors,
  ShieldCheck,
  Shuffle,
  Table,
  Type,
} from "lucide-react";
import type { Tool, ToolTag } from "~/lib/tools/types";

/**
 * The single source of truth for which tools exist.
 *
 * A `ready` tool needs `src/utils/<slug>.ts`, `src/components/tools/<slug>-tool.tsx`
 * and `src/app/tools/<slug>/page.tsx`. A `planned` tool needs none of them.
 */
export const tools: Tool[] = [
  {
    slug: "base64",
    name: "Base64",
    tagline: "encode and decode text",
    description: "Encode text to Base64 or decode it back, Unicode included.",
    metaDescription:
      "Free Base64 encoder and decoder that runs in your browser. Paste text or Base64, get the other one back, with full Unicode support and nothing uploaded.",
    keywords: [
      "base64 encoder",
      "base64 decoder",
      "base64 to text",
      "encode base64 online",
    ],
    tags: ["dev", "text"],
    icon: Braces,
    status: "ready",
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem ipsum",
    tagline: "placeholder text generator",
    description: "Generate placeholder text by paragraphs, sentences or words.",
    metaDescription:
      "Free lorem ipsum generator. Pick paragraphs, sentences or words, copy the placeholder text, and keep it all in your browser.",
    keywords: [
      "lorem ipsum generator",
      "placeholder text",
      "dummy text generator",
      "filler text",
    ],
    tags: ["text", "dev"],
    icon: Pilcrow,
    status: "ready",
  },
  {
    slug: "word-counter",
    name: "Word counter",
    tagline: "count words and characters",
    description: "Count words, characters, sentences and reading time.",
    metaDescription:
      "Free word and character counter. Paste your text to count words, characters with and without spaces, sentences, paragraphs and reading time, all in your browser.",
    keywords: [
      "word counter",
      "character counter",
      "count words online",
      "letter count",
      "reading time calculator",
    ],
    tags: ["text"],
    icon: Calculator,
    status: "ready",
  },
  {
    slug: "text-diff",
    name: "Text diff",
    tagline: "compare two texts",
    description: "Compare two blocks of text line by line.",
    metaDescription:
      "Free text diff tool. Paste two versions to see added, removed and unchanged lines side by side, without uploading either of them.",
    keywords: [
      "text diff",
      "compare text online",
      "diff checker",
      "find difference between two texts",
    ],
    tags: ["text", "dev"],
    icon: GitCompare,
    status: "ready",
  },
  {
    slug: "case-converter",
    name: "Case converter",
    tagline: "change text case",
    description: "camelCase, snake_case, kebab-case and four more, at once.",
    metaDescription:
      "Free case converter. Paste any text and get camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case and Sentence case side by side, in your browser.",
    keywords: [
      "case converter",
      "camelcase converter",
      "snake case converter",
      "kebab case",
      "text case changer",
    ],
    tags: ["text", "dev"],
    icon: Type,
    status: "ready",
  },
  {
    slug: "slugify",
    name: "Slugify",
    tagline: "url slug generator",
    description: "Turn a heading into a clean URL slug.",
    metaDescription:
      "Free slug generator. Turn a title into a URL slug with accents folded, punctuation dropped and separators collapsed, all in your browser.",
    keywords: [
      "slug generator",
      "url slug",
      "slugify text",
      "permalink generator",
    ],
    tags: ["text", "web"],
    icon: Link2,
    status: "ready",
  },
  {
    slug: "url-encoder",
    name: "URL encoder",
    tagline: "percent encode and decode",
    description: "Percent encode and decode URLs and query strings.",
    metaDescription:
      "Free URL encoder and decoder. Percent encode a value or a whole URL, decode one back, and read any query string as a table, without uploading anything.",
    keywords: [
      "url encoder",
      "url decoder",
      "percent encoding",
      "query string parser",
    ],
    tags: ["web", "dev"],
    icon: Link,
    status: "ready",
  },
  {
    slug: "html-entities",
    name: "HTML entities",
    tagline: "escape and unescape html",
    description: "Escape text for markup, or read entities back as text.",
    metaDescription:
      "Free HTML entity encoder and decoder. Escape angle brackets, quotes and ampersands for safe markup, or decode named, decimal and hex entities back to text.",
    keywords: [
      "html entity encoder",
      "html entity decoder",
      "escape html",
      "unescape html",
    ],
    tags: ["web", "text"],
    icon: Code,
    status: "ready",
  },
  {
    slug: "number-base",
    name: "Number base",
    tagline: "hex, binary and decimal",
    description: "Convert between binary, octal, decimal and hexadecimal.",
    metaDescription:
      "Free number base converter. Convert between binary, octal, decimal and hexadecimal with arbitrary precision, in your browser.",
    keywords: [
      "hex to decimal",
      "binary converter",
      "number base converter",
      "decimal to binary",
    ],
    tags: ["dev", "data"],
    icon: Binary,
    status: "ready",
  },
  {
    slug: "json-formatter",
    name: "JSON formatter",
    tagline: "format and minify json",
    description: "Pretty print, minify and sort the keys of a JSON document.",
    keywords: ["json formatter", "json beautifier", "json minifier"],
    tags: ["dev", "data"],
    icon: FileJson,
    status: "planned",
  },
  {
    slug: "jwt-decoder",
    name: "JWT decoder",
    tagline: "decode a json web token",
    description: "Read the header and payload of a token without sending it.",
    keywords: ["jwt decoder", "decode jwt online", "json web token"],
    tags: ["dev", "crypto"],
    icon: KeyRound,
    status: "planned",
  },
  {
    slug: "regex-tester",
    name: "Regex tester",
    tagline: "test a regular expression",
    description: "Match a pattern against sample text and see every group.",
    keywords: ["regex tester", "regular expression tester", "regex match"],
    tags: ["dev", "text"],
    icon: Regex,
    status: "planned",
  },
  {
    slug: "hash-generator",
    name: "Hash generator",
    tagline: "sha-256 of text or a file",
    description: "SHA-256, SHA-1, SHA-384 and SHA-512 of text or a file.",
    metaDescription:
      "Free SHA-256 and SHA-1 hash generator. Hash text or a file with Web Crypto in your browser, with nothing uploaded, and compare the digest against a checksum.",
    keywords: [
      "sha256 generator",
      "sha1 hash",
      "hash text online",
      "file checksum",
    ],
    tags: ["crypto", "dev"],
    icon: Fingerprint,
    status: "ready",
  },
  {
    slug: "uuid-generator",
    name: "UUID generator",
    tagline: "random uuid v4",
    description: "Random version 4 UUIDs, one or five hundred at a time.",
    metaDescription:
      "Free UUID v4 generator. Produce one identifier or hundreds at once with the browser's own random source, and copy them all in a click.",
    keywords: ["uuid generator", "uuid v4", "random uuid", "guid generator"],
    tags: ["dev"],
    icon: Dices,
    status: "ready",
  },
  {
    slug: "random-secret",
    name: "Random secret",
    tagline: "random key generator",
    description: "Random bytes as hex, Base64 or Base64 URL.",
    metaDescription:
      "Free random secret generator for API keys, session secrets and salts. Pick the byte length and the format, generated by your browser and never transmitted.",
    keywords: [
      "random key generator",
      "api key generator",
      "session secret",
      "random hex string",
    ],
    tags: ["crypto", "dev"],
    icon: Shuffle,
    status: "ready",
  },
  {
    slug: "rsa-keypair",
    name: "RSA keypair",
    tagline: "generate a pem keypair",
    description: "Generate an RSA keypair and export it as PEM.",
    metaDescription:
      "Free RSA key generator. Produce a 2048, 3072 or 4096 bit keypair with Web Crypto and export it as PEM, with the private key never leaving your browser.",
    keywords: [
      "rsa key generator",
      "generate rsa keypair",
      "pem key generator",
      "public private key generator",
    ],
    tags: ["crypto", "dev"],
    icon: ShieldCheck,
    status: "ready",
  },
  {
    slug: "password-generator",
    name: "Password generator",
    tagline: "random passwords",
    description: "Random passwords and passphrases from your own machine.",
    keywords: ["password generator", "random password", "passphrase generator"],
    tags: ["crypto"],
    icon: Lock,
    status: "planned",
  },
  {
    slug: "image-compressor",
    name: "Image compressor",
    tagline: "shrink png and jpeg",
    description: "Shrink a PNG or JPEG without it ever leaving the page.",
    keywords: ["compress image", "image compressor", "reduce image size"],
    tags: ["image"],
    icon: Minimize2,
    status: "planned",
  },
  {
    slug: "image-converter",
    name: "Image converter",
    tagline: "png, jpeg, webp and avif",
    description: "Move an image between PNG, JPEG, WebP and AVIF.",
    keywords: ["image converter", "png to jpg", "webp converter"],
    tags: ["image", "data"],
    icon: Image,
    status: "planned",
  },
  {
    slug: "pdf-merge",
    name: "PDF merge",
    tagline: "combine pdf files",
    description: "Join several PDFs into one file, in the order you choose.",
    keywords: ["merge pdf", "combine pdf", "pdf merger"],
    tags: ["pdf"],
    icon: Files,
    status: "planned",
  },
  {
    slug: "pdf-split",
    name: "PDF split",
    tagline: "extract pdf pages",
    description: "Pull single pages or ranges out of a PDF.",
    keywords: ["split pdf", "extract pdf pages", "pdf splitter"],
    tags: ["pdf"],
    icon: Scissors,
    status: "planned",
  },
  {
    slug: "pdf-to-image",
    name: "PDF to image",
    tagline: "pdf to png or jpg",
    description: "Render the pages of a PDF as PNG or JPEG files.",
    keywords: ["pdf to png", "pdf to jpg", "convert pdf to image"],
    tags: ["pdf", "image"],
    icon: FileText,
    status: "planned",
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    tagline: "convert csv and json",
    description: "Convert tabular data in either direction, with a preview.",
    keywords: ["csv to json", "json to csv", "convert csv"],
    tags: ["data", "text"],
    icon: Table,
    status: "planned",
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp converter",
    tagline: "unix time to a date",
    description: "Unix time to a readable date and back, in any time zone.",
    keywords: [
      "unix timestamp converter",
      "epoch converter",
      "timestamp to date",
    ],
    tags: ["time", "dev"],
    icon: Clock,
    status: "planned",
  },
  {
    slug: "cron-parser",
    name: "Cron parser",
    tagline: "explain a cron expression",
    description: "Explain a cron expression in plain words and list its runs.",
    keywords: ["cron parser", "crontab expression", "cron schedule explained"],
    tags: ["time", "dev"],
    icon: CalendarClock,
    status: "planned",
  },
  {
    slug: "color-converter",
    name: "Color converter",
    tagline: "hex, rgb, hsl and oklch",
    description: "HEX, RGB, HSL and OKLCH side by side, with contrast checks.",
    keywords: ["hex to rgb", "color converter", "hsl converter"],
    tags: ["color", "image"],
    icon: Palette,
    status: "planned",
  },
  {
    slug: "qr-code",
    name: "QR code",
    tagline: "qr code generator",
    description: "Turn a link or a block of text into a QR code to download.",
    keywords: ["qr code generator", "make qr code", "url to qr"],
    tags: ["web", "image"],
    icon: QrCode,
    status: "planned",
  },
];

/** Alphabetical by name, which is the order every listing uses. */
export function allTools(): Tool[] {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function readyTools(): Tool[] {
  return allTools().filter((tool) => tool.status === "ready");
}

export function countByTag(tag: ToolTag): number {
  return tools.filter((tool) => tool.tags.includes(tag)).length;
}

/**
 * Tools that share a tag with this one, the ones you can actually open first.
 * Used by the tool layout to point somewhere useful next.
 */
export function relatedTools(slug: string, limit = 3): Tool[] {
  const tool = getTool(slug);
  if (!tool) {
    return [];
  }

  const shared = (other: Tool) =>
    other.tags.filter((tag) => tool.tags.includes(tag)).length;

  return allTools()
    .filter((other) => other.slug !== slug && shared(other) > 0)
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "ready" ? -1 : 1;
      }
      return shared(b) - shared(a);
    })
    .slice(0, limit);
}
