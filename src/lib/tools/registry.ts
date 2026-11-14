import {
  Binary,
  CalendarClock,
  Clock,
  FileJson,
  Files,
  FileText,
  GitCompare,
  Hash,
  Image,
  KeyRound,
  Link,
  Lock,
  Minimize2,
  Palette,
  QrCode,
  Regex,
  Scissors,
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
    description: "Encode text to Base64 or decode it back, Unicode included.",
    tags: ["dev", "text"],
    icon: Binary,
    status: "ready",
  },
  {
    slug: "json-formatter",
    name: "JSON formatter",
    description: "Pretty print, minify and sort the keys of a JSON document.",
    tags: ["dev", "data"],
    icon: FileJson,
    status: "planned",
  },
  {
    slug: "jwt-decoder",
    name: "JWT decoder",
    description: "Read the header and payload of a token without sending it.",
    tags: ["dev", "crypto"],
    icon: KeyRound,
    status: "planned",
  },
  {
    slug: "regex-tester",
    name: "Regex tester",
    description: "Match a pattern against sample text and see every group.",
    tags: ["dev", "text"],
    icon: Regex,
    status: "planned",
  },
  {
    slug: "hash-generator",
    name: "Hash generator",
    description: "SHA-256, SHA-1 and MD5 of text or a file, via Web Crypto.",
    tags: ["crypto", "dev"],
    icon: Hash,
    status: "planned",
  },
  {
    slug: "password-generator",
    name: "Password generator",
    description: "Random passwords and passphrases from your own machine.",
    tags: ["crypto"],
    icon: Lock,
    status: "planned",
  },
  {
    slug: "image-compressor",
    name: "Image compressor",
    description: "Shrink a PNG or JPEG without it ever leaving the page.",
    tags: ["image"],
    icon: Minimize2,
    status: "planned",
  },
  {
    slug: "image-converter",
    name: "Image converter",
    description: "Move an image between PNG, JPEG, WebP and AVIF.",
    tags: ["image", "data"],
    icon: Image,
    status: "planned",
  },
  {
    slug: "pdf-merge",
    name: "PDF merge",
    description: "Join several PDFs into one file, in the order you choose.",
    tags: ["pdf"],
    icon: Files,
    status: "planned",
  },
  {
    slug: "pdf-split",
    name: "PDF split",
    description: "Pull single pages or ranges out of a PDF.",
    tags: ["pdf"],
    icon: Scissors,
    status: "planned",
  },
  {
    slug: "pdf-to-image",
    name: "PDF to image",
    description: "Render the pages of a PDF as PNG or JPEG files.",
    tags: ["pdf", "image"],
    icon: FileText,
    status: "planned",
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    description: "Convert tabular data in either direction, with a preview.",
    tags: ["data", "text"],
    icon: Table,
    status: "planned",
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp converter",
    description: "Unix time to a readable date and back, in any time zone.",
    tags: ["time", "dev"],
    icon: Clock,
    status: "planned",
  },
  {
    slug: "cron-parser",
    name: "Cron parser",
    description: "Explain a cron expression in plain words and list its runs.",
    tags: ["time", "dev"],
    icon: CalendarClock,
    status: "planned",
  },
  {
    slug: "color-converter",
    name: "Color converter",
    description: "HEX, RGB, HSL and OKLCH side by side, with contrast checks.",
    tags: ["color", "image"],
    icon: Palette,
    status: "planned",
  },
  {
    slug: "case-converter",
    name: "Case converter",
    description: "camelCase, snake_case, kebab-case and Title Case.",
    tags: ["text"],
    icon: Type,
    status: "planned",
  },
  {
    slug: "diff-checker",
    name: "Diff checker",
    description: "Compare two blocks of text line by line.",
    tags: ["text", "dev"],
    icon: GitCompare,
    status: "planned",
  },
  {
    slug: "qr-code",
    name: "QR code",
    description: "Turn a link or a block of text into a QR code to download.",
    tags: ["web", "image"],
    icon: QrCode,
    status: "planned",
  },
  {
    slug: "url-encoder",
    name: "URL encoder",
    description: "Percent encode and decode URLs and query strings.",
    tags: ["web", "dev"],
    icon: Link,
    status: "planned",
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function readyTools(): Tool[] {
  return tools.filter((tool) => tool.status === "ready");
}

export function countByTag(tag: ToolTag): number {
  return tools.filter((tool) => tool.tags.includes(tag)).length;
}
