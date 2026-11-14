import { describe, expect, it } from "vitest";
import { tools } from "~/lib/tools/registry";
import { TOOL_CATEGORIES } from "~/lib/tools/types";

describe("tool registry", () => {
  it("has unique, kebab-case slugs", () => {
    const slugs = tools.map((tool) => tool.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("describes every tool with a name, sentence and known category", () => {
    for (const tool of tools) {
      expect(tool.name.length).toBeGreaterThan(2);
      expect(tool.description.length).toBeGreaterThan(10);
      expect(TOOL_CATEGORIES).toContain(tool.category);
      expect(tool.keywords.length).toBeGreaterThan(0);
      expect(tool.keywords).toEqual(
        tool.keywords.map((keyword) => keyword.toLowerCase()),
      );
    }
  });
});
