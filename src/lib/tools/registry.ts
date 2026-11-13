import type { Tool, ToolCategory } from "~/lib/tools/types";

/**
 * The single source of truth for which tools exist.
 *
 * Adding a tool means: add an entry here, then create `src/utils/<slug>.ts`,
 * `src/components/tools/<slug>-tool.tsx` and `src/app/tools/<slug>/page.tsx`.
 */
export const tools: Tool[] = [
  {
    slug: "base64",
    name: "Base64 encoder & decoder",
    description:
      "Encode text to Base64 or decode it back, with full Unicode support.",
    category: "data",
    keywords: ["base64", "encode", "decode", "btoa", "atob"],
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function toolsByCategory(): [ToolCategory, Tool[]][] {
  const grouped = new Map<ToolCategory, Tool[]>();

  for (const tool of tools) {
    const bucket = grouped.get(tool.category) ?? [];
    bucket.push(tool);
    grouped.set(tool.category, bucket);
  }

  return [...grouped.entries()].map(([category, group]) => [
    category,
    [...group].sort((a, b) => a.name.localeCompare(b.name)),
  ]);
}
