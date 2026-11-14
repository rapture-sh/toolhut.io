import type { LucideIcon } from "lucide-react";

export const TOOL_TAGS = [
  "dev",
  "text",
  "image",
  "pdf",
  "data",
  "time",
  "crypto",
  "color",
  "web",
] as const;

export type ToolTag = (typeof TOOL_TAGS)[number];

/** `planned` tools are listed but not linked, so the grid never shows a dead link. */
export type ToolStatus = "ready" | "planned";

export interface Tool {
  /** Kebab-case. A ready tool is served at `/tools/<slug>`. */
  slug: string;
  name: string;
  /** One sentence. Shown on the card and as the page description. */
  description: string;
  /**
   * The page's own description, written for search results rather than for a
   * card. Falls back to `description` when a tool does not need its own.
   */
  metaDescription?: string;
  /** What people type into a search engine to find this tool. */
  keywords: string[];
  /** At least one tag. The first one gives the tool its colour. */
  tags: readonly [ToolTag, ...ToolTag[]];
  icon: LucideIcon;
  status: ToolStatus;
}
