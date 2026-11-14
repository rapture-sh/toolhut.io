import { Binary, FileText } from "lucide-react";
import { describe, expect, it } from "vitest";
import type { Tool } from "~/lib/tools/types";
import { filterTools, rankTool, searchTools } from "~/utils/search";

const base64: Tool = {
  slug: "base64",
  name: "Base64",
  description: "Encode text to Base64 or decode it back.",
  tagline: "encode and decode text",
  keywords: ["base64 encoder"],
  tags: ["dev", "text"],
  icon: Binary,
  status: "ready",
};

const pdfMerge: Tool = {
  slug: "pdf-merge",
  name: "PDF merge",
  description: "Join several PDFs into one file.",
  tagline: "combine pdf files",
  keywords: ["merge pdf"],
  tags: ["pdf"],
  icon: FileText,
  status: "planned",
};

const catalogue = [base64, pdfMerge];

describe("filterTools", () => {
  it("should return everything when nothing is filtered", () => {
    expect(filterTools(catalogue, { query: "", tag: "all" })).toEqual(
      catalogue,
    );
  });

  it("should match a tag a tool carries beyond its first one", () => {
    expect(filterTools(catalogue, { query: "", tag: "text" })).toEqual([
      base64,
    ]);
  });

  it("should search the name, the description and the tags", () => {
    expect(
      filterTools(catalogue, { query: "join several", tag: "all" }),
    ).toEqual([pdfMerge]);
    expect(filterTools(catalogue, { query: "pdf", tag: "all" })).toEqual([
      pdfMerge,
    ]);
    expect(filterTools(catalogue, { query: "BASE64", tag: "all" })).toEqual([
      base64,
    ]);
  });

  it("should ignore surrounding whitespace in the query", () => {
    expect(filterTools(catalogue, { query: "   ", tag: "all" })).toEqual(
      catalogue,
    );
    expect(filterTools(catalogue, { query: "  merge  ", tag: "all" })).toEqual([
      pdfMerge,
    ]);
  });

  it("should combine the tag and the query", () => {
    expect(filterTools(catalogue, { query: "merge", tag: "dev" })).toEqual([]);
  });
});

describe("rankTool", () => {
  it("should put a name that starts with the words first", () => {
    expect(rankTool(base64, "base")).toBeLessThan(
      rankTool(base64, "encode") ?? Number.POSITIVE_INFINITY,
    );
  });

  it("should rank a tag match below anything the words actually say", () => {
    expect(rankTool(base64, "dev")).toBeGreaterThan(
      rankTool(base64, "base64") ?? 0,
    );
  });

  it("should return nothing for a tool the words do not reach", () => {
    expect(rankTool(base64, "sausage")).toBeNull();
  });
});

describe("searchTools", () => {
  const imageConverter: Tool = {
    ...base64,
    slug: "image-converter",
    name: "Image converter",
    description: "Move an image between PNG, JPEG and WebP.",
    tagline: "png, jpeg and webp",
    keywords: ["convert image"],
    tags: ["image"],
  };

  const colorConverter: Tool = {
    ...base64,
    slug: "color-converter",
    name: "Color converter",
    description: "Convert a colour between HEX, RGB, HSL and OKLCH.",
    tagline: "hex, rgb, hsl and oklch",
    keywords: ["color converter"],
    tags: ["color", "image"],
  };

  it("should offer the tool named after the words before one merely tagged with them", () => {
    expect(
      searchTools([colorConverter, imageConverter], "image").map(
        (tool) => tool.slug,
      ),
    ).toEqual(["image-converter", "color-converter"]);
  });

  it("should settle a tie alphabetically", () => {
    const first: Tool = { ...imageConverter, slug: "a", name: "Image alpha" };
    const second: Tool = { ...imageConverter, slug: "b", name: "Image beta" };

    expect(
      searchTools([second, first], "image").map((tool) => tool.name),
    ).toEqual(["Image alpha", "Image beta"]);
  });

  it("should give everything back when nothing was typed", () => {
    expect(searchTools([base64, pdfMerge], "  ")).toEqual([base64, pdfMerge]);
  });
});
