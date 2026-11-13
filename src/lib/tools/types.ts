/**
 * Metadata for a single tool.
 *
 * Every tool in toolhut runs fully in the browser: no request may leave the
 * page with user input in it. See AGENTS.md for the rules a tool must follow.
 */
export interface Tool {
  /** URL segment, kebab-case. Lives at /tools/<slug>. */
  slug: string;
  /** Short display name, e.g. "Base64 encoder". */
  name: string;
  /** One sentence, shown on the home page and in search. */
  description: string;
  category: ToolCategory;
  /** Extra words people might search for. Lowercase. */
  keywords: string[];
}

export const TOOL_CATEGORIES = [
  "text",
  "data",
  "image",
  "file",
  "time",
  "crypto",
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  text: "Text",
  data: "Data & formats",
  image: "Images",
  file: "Files",
  time: "Dates & time",
  crypto: "Hashing & crypto",
};
