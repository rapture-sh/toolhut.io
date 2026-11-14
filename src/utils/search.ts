import type { Tool, ToolTag } from "~/lib/tools/types";

export type TagFilter = ToolTag | "all";

export interface ToolQuery {
  query: string;
  tag: TagFilter;
}

function haystack(tool: Tool): string {
  return `${tool.name} ${tool.description} ${tool.tags.join(" ")}`.toLowerCase();
}

export function filterTools(
  tools: readonly Tool[],
  { query, tag }: ToolQuery,
): Tool[] {
  const needle = query.trim().toLowerCase();

  return tools.filter((tool) => {
    const matchesTag = tag === "all" || tool.tags.includes(tag);
    const matchesQuery = needle === "" || haystack(tool).includes(needle);
    return matchesTag && matchesQuery;
  });
}
