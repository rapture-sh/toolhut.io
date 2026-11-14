import type { Tool, ToolTag } from "~/lib/tools/types";

export type TagFilter = ToolTag | "all";

export interface ToolQuery {
  query: string;
  tag: TagFilter;
}

/**
 * Lower is a better match. A search box only shows the first few, so a tool
 * whose name begins with what you typed has to come before one that merely
 * carries the word somewhere in its description.
 */
export function rankTool(tool: Tool, needle: string): number | null {
  const name = tool.name.toLowerCase();

  if (name.startsWith(needle)) {
    return 0;
  }

  if (name.split(/[\s-]+/).some((word) => word.startsWith(needle))) {
    return 1;
  }

  if (name.includes(needle)) {
    return 2;
  }

  if (tool.tagline.toLowerCase().includes(needle)) {
    return 3;
  }

  if (tool.description.toLowerCase().includes(needle)) {
    return 4;
  }

  if (tool.keywords.some((keyword) => keyword.toLowerCase().includes(needle))) {
    return 5;
  }

  if (tool.tags.some((tag) => tag.includes(needle))) {
    return 6;
  }

  return null;
}

/** Best match first, then alphabetical, which is how ties are settled. */
export function searchTools(tools: readonly Tool[], query: string): Tool[] {
  const needle = query.trim().toLowerCase();

  if (needle === "") {
    return [...tools];
  }

  return tools
    .map((tool) => ({ tool, score: rankTool(tool, needle) }))
    .filter(
      (entry): entry is { tool: Tool; score: number } => entry.score !== null,
    )
    .sort((a, b) => a.score - b.score || a.tool.name.localeCompare(b.tool.name))
    .map((entry) => entry.tool);
}

export function filterTools(
  tools: readonly Tool[],
  { query, tag }: ToolQuery,
): Tool[] {
  const carrying = tools.filter(
    (tool) => tag === "all" || tool.tags.includes(tag),
  );

  return searchTools(carrying, query);
}
