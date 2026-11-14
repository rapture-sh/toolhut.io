import { Binary, FileText } from "lucide-react";
import { describe, expect, it } from "vitest";
import type { Tool } from "~/lib/tools/types";
import { filterTools } from "~/utils/search";

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
  it("returns everything when nothing is filtered", () => {
    expect(filterTools(catalogue, { query: "", tag: "all" })).toEqual(
      catalogue,
    );
  });

  it("matches a tag a tool carries beyond its first one", () => {
    expect(filterTools(catalogue, { query: "", tag: "text" })).toEqual([
      base64,
    ]);
  });

  it("searches the name, the description and the tags", () => {
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

  it("ignores surrounding whitespace in the query", () => {
    expect(filterTools(catalogue, { query: "   ", tag: "all" })).toEqual(
      catalogue,
    );
    expect(filterTools(catalogue, { query: "  merge  ", tag: "all" })).toEqual([
      pdfMerge,
    ]);
  });

  it("combines the tag and the query", () => {
    expect(filterTools(catalogue, { query: "merge", tag: "dev" })).toEqual([]);
  });
});
