import {
  AppWindow,
  Binary,
  Braces,
  Calculator,
  CalendarClock,
  Camera,
  Clock,
  Code,
  CodeXml,
  Contrast,
  Crop,
  Database,
  Dices,
  Eye,
  FileCode,
  FileImage,
  FileJson,
  Files,
  FileText,
  Fingerprint,
  Frame,
  GitCompare,
  Image,
  KeyRound,
  Link,
  Link2,
  ListTree,
  Lock,
  Minimize2,
  MonitorSmartphone,
  Palette,
  Pilcrow,
  Pipette,
  QrCode,
  Regex,
  Scaling,
  Scissors,
  Settings2,
  Shapes,
  ShieldCheck,
  Shuffle,
  SwatchBook,
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
    status: "ready",
  },
  {
    slug: "jwt-decoder",
    name: "JWT decoder",
    tagline: "decode a json web token",
    description: "Read the header and payload of a token without sending it.",
    keywords: ["jwt decoder", "decode jwt online", "json web token"],
    tags: ["dev", "crypto"],
    icon: KeyRound,
    status: "ready",
  },
  {
    slug: "regex-tester",
    name: "Regex tester",
    tagline: "test a regular expression",
    description: "Match a pattern against sample text and see every group.",
    keywords: ["regex tester", "regular expression tester", "regex match"],
    tags: ["dev", "text"],
    icon: Regex,
    status: "ready",
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
    description:
      "Generate a strong password with the length and character sets you choose.",
    metaDescription:
      "Free password generator that runs in your browser. Choose the length and the character sets, see the entropy in bits, and nothing is ever sent anywhere.",
    keywords: [
      "password generator",
      "random password",
      "strong password generator",
      "secure password",
    ],
    tags: ["crypto"],
    icon: Lock,
    status: "ready",
  },
  {
    slug: "image-compressor",
    name: "Image compressor",
    tagline: "shrink png and jpeg",
    description: "Shrink a PNG or JPEG without it ever leaving the page.",
    keywords: ["compress image", "image compressor", "reduce image size"],
    tags: ["image"],
    icon: Minimize2,
    status: "ready",
  },
  {
    slug: "image-converter",
    name: "Image converter",
    tagline: "png, jpeg and webp",
    description: "Move an image between PNG, JPEG and WebP.",
    keywords: ["image converter", "png to jpg", "webp converter"],
    tags: ["image", "data"],
    icon: Image,
    status: "ready",
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
    description: "Turn a CSV file into JSON, or JSON back into a CSV.",
    metaDescription:
      "Free CSV to JSON and JSON to CSV converter that runs in your browser. Pick the delimiter, say whether the first row is a header, and nothing is uploaded.",
    keywords: [
      "csv to json",
      "json to csv",
      "convert csv",
      "csv converter online",
    ],
    tags: ["data", "text"],
    icon: Table,
    status: "ready",
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
    status: "ready",
  },
  {
    slug: "cron-parser",
    name: "Cron parser",
    tagline: "explain a cron expression",
    description: "Explain a cron expression in plain words and list its runs.",
    keywords: ["cron parser", "crontab expression", "cron schedule explained"],
    tags: ["time", "dev"],
    icon: CalendarClock,
    status: "ready",
  },
  {
    slug: "color-converter",
    name: "Color converter",
    tagline: "hex, rgb, hsl and oklch",
    description: "Convert a colour between HEX, RGB, HSL and OKLCH.",
    keywords: ["hex to rgb", "color converter", "hsl converter"],
    tags: ["color", "image"],
    icon: Palette,
    status: "ready",
  },
  {
    slug: "qr-code",
    name: "QR code",
    tagline: "qr code generator",
    description: "Turn a link or a block of text into a QR code to download.",
    keywords: ["qr code generator", "make qr code", "url to qr"],
    tags: ["web", "image"],
    icon: QrCode,
    status: "ready",
  },
  {
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    tagline: "typescript from json",
    description:
      "Turn a JSON sample into TypeScript interfaces you can paste into your code.",
    metaDescription:
      "Free JSON to TypeScript converter that runs in your browser. Paste a JSON sample and get named interfaces back, with optional fields and nested shapes handled.",
    keywords: [
      "json to typescript",
      "json to interface",
      "typescript type generator",
      "json schema to types",
    ],
    tags: ["dev", "data"],
    icon: FileCode,
    status: "ready",
  },
  {
    slug: "markdown-preview",
    name: "Markdown preview",
    tagline: "render markdown safely",
    description:
      "Write Markdown on the left and watch the rendered page appear on the right.",
    metaDescription:
      "Free Markdown preview and Markdown to HTML converter that runs in your browser. Write on the left, see the rendered result on the right, and copy the HTML.",
    keywords: [
      "markdown preview",
      "markdown to html",
      "markdown editor online",
      "render markdown",
    ],
    tags: ["text", "web"],
    icon: Eye,
    status: "ready",
  },
  {
    slug: "image-resizer",
    name: "Image resizer",
    tagline: "resize by pixels or percent",
    description:
      "Resize an image by pixels or percent, with the aspect ratio locked or free.",
    metaDescription:
      "Free image resizer that runs in your browser. Resize a PNG, JPEG or WebP by pixels or percent with high quality filtering, and nothing is ever uploaded.",
    keywords: [
      "image resizer",
      "resize image online",
      "resize png",
      "resize jpeg",
      "scale image",
    ],
    tags: ["image"],
    icon: Scaling,
    status: "ready",
  },
  {
    slug: "logo-padding",
    name: "Logo padding",
    tagline: "add space around a logo",
    description:
      "Put a logo on a bigger canvas with the background colour and padding you pick.",
    metaDescription:
      "Free tool to add padding around a logo or icon in your browser. Pick a canvas size, a background colour or transparency, and where the logo sits, then download or copy it.",
    keywords: [
      "add padding to image",
      "logo background maker",
      "expand image canvas",
      "add space around logo",
      "resize canvas not image",
    ],
    tags: ["image"],
    icon: Frame,
    status: "ready",
  },
  {
    slug: "image-cropper",
    name: "Image cropper",
    tagline: "crop to any ratio",
    description:
      "Crop an image by dragging a box, with presets for avatars and social cards.",
    metaDescription:
      "Free image cropper that runs in your browser. Drag a crop box or pick a ratio like 1:1 and 16:9, then download or copy the result without uploading anything.",
    keywords: [
      "image cropper",
      "crop image online",
      "crop to square",
      "crop photo",
    ],
    tags: ["image"],
    icon: Crop,
    status: "ready",
  },
  {
    slug: "favicon-generator",
    name: "Favicon generator",
    tagline: "every icon size at once",
    description:
      "Turn one square image into every favicon and app icon size, in a single zip.",
    metaDescription:
      "Free favicon generator that runs in your browser. Drop one square image and get every icon size a site needs, zipped, with nothing uploaded to a server.",
    keywords: [
      "favicon generator",
      "app icon generator",
      "favicon from image",
      "apple touch icon",
    ],
    tags: ["image", "web"],
    icon: AppWindow,
    status: "ready",
  },
  {
    slug: "svg-optimizer",
    name: "SVG optimizer",
    tagline: "shrink svg markup",
    description:
      "Strip the editor leftovers out of an SVG and see how many bytes it saves.",
    metaDescription:
      "Free SVG optimizer that runs in your browser. Paste or drop an SVG to remove editor metadata and shrink the markup, with the saving shown and nothing uploaded.",
    keywords: ["svg optimizer", "minify svg", "compress svg", "clean up svg"],
    tags: ["image", "web"],
    icon: Shapes,
    status: "ready",
  },
  {
    slug: "image-to-base64",
    name: "Image to base64",
    tagline: "data uri and css",
    description:
      "Turn an image into a data URI, with the CSS rule ready beside it.",
    metaDescription:
      "Free image to base64 converter that runs in your browser. Drop a PNG, JPEG, WebP or SVG and copy the data URI or the ready made CSS background rule.",
    keywords: [
      "image to base64",
      "png to base64",
      "data uri generator",
      "base64 background image",
    ],
    tags: ["image", "dev"],
    icon: FileImage,
    status: "ready",
  },
  {
    slug: "exif-viewer",
    name: "EXIF viewer",
    tagline: "see and strip photo metadata",
    description:
      "See the camera, date and place a photo carries, then save a clean copy.",
    metaDescription:
      "Free EXIF viewer and metadata remover that runs in your browser. See the camera, date and GPS a photo carries, then download a copy with all of it stripped.",
    keywords: [
      "exif viewer",
      "remove exif data",
      "strip photo metadata",
      "check photo gps location",
    ],
    tags: ["image"],
    icon: Camera,
    status: "ready",
  },
  {
    slug: "color-from-image",
    name: "Color from image",
    tagline: "pick colors out of a picture",
    description:
      "Paste a picture, take its palette, and copy any colour as HEX, RGB, HSL or OKLCH.",
    metaDescription:
      "Free colour picker for images that runs in your browser. Drop or paste a picture, get its palette, pick any pixel with the eyedropper, and copy HEX, RGB, HSL or OKLCH.",
    keywords: [
      "color picker from image",
      "image color extractor",
      "get hex from image",
      "palette from image",
      "eyedropper online",
    ],
    tags: ["color", "image"],
    icon: Pipette,
    status: "ready",
  },
  {
    slug: "contrast-checker",
    name: "Contrast checker",
    tagline: "wcag contrast ratio",
    description:
      "Check a text and background pair against the WCAG AA and AAA thresholds.",
    metaDescription:
      "Free WCAG contrast checker that runs in your browser. Enter a text and background colour to get the contrast ratio and whether it passes AA and AAA.",
    keywords: [
      "contrast checker",
      "wcag contrast ratio",
      "accessible color contrast",
      "color contrast test",
    ],
    tags: ["color", "web"],
    icon: Contrast,
    status: "ready",
  },
  {
    slug: "color-shades",
    name: "Color shades",
    tagline: "tints and shades of a color",
    description:
      "Build the 50 to 950 ramp from one colour, ready to drop into a theme.",
    metaDescription:
      "Free colour shade generator that runs in your browser. Give it one colour and get the 50 to 950 ramp of tints and shades, as HEX, RGB, HSL or OKLCH.",
    keywords: [
      "color shades generator",
      "tailwind color palette",
      "tints and shades",
      "color ramp generator",
    ],
    tags: ["color"],
    icon: SwatchBook,
    status: "ready",
  },
  {
    slug: "yaml-json",
    name: "YAML to JSON",
    tagline: "convert either direction",
    description:
      "Convert YAML to JSON or JSON back to YAML, with the errors explained.",
    metaDescription:
      "Free YAML to JSON and JSON to YAML converter that runs in your browser. Paste either one, get the other, and see exactly where a broken document goes wrong.",
    keywords: [
      "yaml to json",
      "json to yaml",
      "yaml converter",
      "yaml parser online",
    ],
    tags: ["data", "dev"],
    icon: ListTree,
    status: "ready",
  },
  {
    slug: "toml-json",
    name: "TOML to JSON",
    tagline: "convert either direction",
    description: "Convert TOML to JSON or JSON back to TOML.",
    metaDescription:
      "Free TOML to JSON and JSON to TOML converter that runs in your browser. Paste a config, get the other format back, with nothing uploaded anywhere.",
    keywords: [
      "toml to json",
      "json to toml",
      "toml converter",
      "toml parser online",
    ],
    tags: ["data", "dev"],
    icon: Settings2,
    status: "ready",
  },
  {
    slug: "xml-json",
    name: "XML to JSON",
    tagline: "convert either direction",
    description: "Convert XML to JSON or JSON back to XML, attributes and all.",
    metaDescription:
      "Free XML to JSON and JSON to XML converter that runs in your browser. Paste either one and get the other, with attributes kept and nothing uploaded.",
    keywords: [
      "xml to json",
      "json to xml",
      "xml converter",
      "xml parser online",
    ],
    tags: ["data", "dev"],
    icon: CodeXml,
    status: "ready",
  },
  {
    slug: "sql-formatter",
    name: "SQL formatter",
    tagline: "format sql queries",
    description:
      "Format a query for the dialect you use, or squash it back to one line.",
    metaDescription:
      "Free SQL formatter that runs in your browser. Format a query for Postgres, MySQL, SQLite, BigQuery and more, or minify it back to a single line.",
    keywords: [
      "sql formatter",
      "format sql online",
      "sql beautifier",
      "pretty print sql",
    ],
    tags: ["data", "dev"],
    icon: Database,
    status: "ready",
  },
  {
    slug: "user-agent-parser",
    name: "User agent parser",
    tagline: "browser, os and device",
    description:
      "Break a user agent string into the browser, engine, system and device.",
    metaDescription:
      "Free user agent parser that runs in your browser. Paste any user agent string to see the browser, rendering engine, operating system and device it describes.",
    keywords: [
      "user agent parser",
      "parse user agent string",
      "what is my user agent",
      "user agent lookup",
    ],
    tags: ["web", "dev"],
    icon: MonitorSmartphone,
    status: "ready",
  },
];

/** Alphabetical by name, which is the order every listing uses. */
export function allTools(): Tool[] {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/** The three people reach for first, offered before anything is typed. */
const POPULAR_SLUGS = ["image-converter", "json-formatter", "base64"];

export function popularTools(limit = 3): Tool[] {
  return POPULAR_SLUGS.map(getTool)
    .filter((tool): tool is Tool => tool?.status === "ready")
    .slice(0, limit);
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
