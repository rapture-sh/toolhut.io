import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { countByTag, getTool, readyTools, tools } from "~/lib/tools/registry";
import { TOOL_TAGS } from "~/lib/tools/types";

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const routeOf = (slug: string) => join("src", "app", "tools", slug, "page.tsx");

describe("tool registry", () => {
  it("should give every tool a unique kebab-case slug", () => {
    const slugs = tools.map((tool) => tool.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.filter((slug) => !KEBAB_CASE.test(slug))).toEqual([]);
  });

  it("should carry the metadata the cards render", () => {
    for (const tool of tools) {
      expect(tool.name.trim()).not.toBe("");
      expect(tool.description.trim()).not.toBe("");
      expect(tool.icon).toBeDefined();
      expect(tool.tags.length).toBeGreaterThan(0);
      expect(new Set(tool.tags).size).toBe(tool.tags.length);
      for (const tag of tool.tags) {
        expect(TOOL_TAGS).toContain(tag);
      }
    }
  });

  it("should back every ready tool with a route and a component", () => {
    const missing = readyTools()
      .flatMap((tool) => [
        routeOf(tool.slug),
        join("src", "components", "tools", `${tool.slug}-tool.tsx`),
      ])
      .filter((path) => !existsSync(join(process.cwd(), path)));

    expect(missing).toEqual([]);
  });

  it("should keep planned tools unlinkable, with no route of their own", () => {
    const built = tools
      .filter((tool) => tool.status === "planned")
      .map((tool) => routeOf(tool.slug))
      .filter((path) => existsSync(join(process.cwd(), path)));

    expect(built).toEqual([]);
  });
});

describe("page titles", () => {
  /** Search results cut a title at about 60 characters. */
  const LIMIT = 60;

  it("should fit every title inside what a search result shows", () => {
    const tooLong = tools
      .map((tool) => `${tool.name} - ${tool.tagline} - toolhut`)
      .filter((title) => title.length > LIMIT);

    expect(tooLong).toEqual([]);
  });

  it("should write a tagline that adds to the name instead of repeating it", () => {
    for (const tool of tools) {
      expect(tool.tagline.trim()).not.toBe("");
      expect(tool.tagline.endsWith(".")).toBe(false);
      expect(tool.tagline.toLowerCase()).not.toBe(tool.name.toLowerCase());
    }
  });
});

describe("getTool", () => {
  it("should find a tool by slug and return undefined for an unknown one", () => {
    expect(getTool("base64")?.slug).toBe("base64");
    expect(getTool("not-a-tool")).toBeUndefined();
  });
});

describe("countByTag", () => {
  it("should count every tool carrying the tag, not just its first one", () => {
    const expected = tools.filter((tool) => tool.tags.includes("dev")).length;

    expect(countByTag("dev")).toBe(expected);
    expect(countByTag("dev")).toBeGreaterThan(0);
  });
});
