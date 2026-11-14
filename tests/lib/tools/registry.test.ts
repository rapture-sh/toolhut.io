import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { countByTag, getTool, readyTools, tools } from "~/lib/tools/registry";
import { TOOL_TAGS } from "~/lib/tools/types";

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const routeOf = (slug: string) => join("src", "app", "tools", slug, "page.tsx");

describe("tool registry", () => {
  it("gives every tool a unique kebab-case slug", () => {
    const slugs = tools.map((tool) => tool.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.filter((slug) => !KEBAB_CASE.test(slug))).toEqual([]);
  });

  it("carries the metadata the cards render", () => {
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

  it("backs every ready tool with a route and a component", () => {
    const missing = readyTools()
      .flatMap((tool) => [
        routeOf(tool.slug),
        join("src", "components", "tools", `${tool.slug}-tool.tsx`),
      ])
      .filter((path) => !existsSync(join(process.cwd(), path)));

    expect(missing).toEqual([]);
  });

  it("keeps planned tools unlinkable, with no route of their own", () => {
    const built = tools
      .filter((tool) => tool.status === "planned")
      .map((tool) => routeOf(tool.slug))
      .filter((path) => existsSync(join(process.cwd(), path)));

    expect(built).toEqual([]);
  });
});

describe("getTool", () => {
  it("finds a tool by slug and returns undefined for an unknown one", () => {
    expect(getTool("base64")?.slug).toBe("base64");
    expect(getTool("not-a-tool")).toBeUndefined();
  });
});

describe("countByTag", () => {
  it("counts every tool carrying the tag, not just its first one", () => {
    const expected = tools.filter((tool) => tool.tags.includes("dev")).length;

    expect(countByTag("dev")).toBe(expected);
    expect(countByTag("dev")).toBeGreaterThan(0);
  });
});
