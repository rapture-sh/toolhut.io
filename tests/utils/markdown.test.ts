import { describe, expect, it } from "vitest";
import { renderMarkdown } from "~/utils/markdown";

describe("renderMarkdown", () => {
  it("renders a heading", () => {
    expect(renderMarkdown("# Title")).toContain("<h1>Title</h1>");
  });

  it("renders a list", () => {
    const html = renderMarkdown("- one\n- two");

    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
  });

  it("renders a fenced code block", () => {
    expect(renderMarkdown("```\nconst a = 1;\n```")).toContain("<code>");
  });

  it("renders a table, which needs GitHub flavoured Markdown", () => {
    const html = renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |");

    expect(html).toContain("<table>");
  });

  it("keeps HTML that is safe to keep", () => {
    expect(renderMarkdown("<b>bold</b>")).toContain("<b>bold</b>");
  });

  it("drops a script tag", () => {
    const html = renderMarkdown("Hello\n\n<script>alert(1)</script>");

    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("drops an event handler attribute", () => {
    const html = renderMarkdown('<img src="x" onerror="alert(1)">');

    expect(html).not.toContain("onerror");
  });

  it("drops a javascript URL", () => {
    const html = renderMarkdown("[click](javascript:alert(1))");

    expect(html).not.toContain("javascript:");
  });

  it("returns an empty string for blank input", () => {
    expect(renderMarkdown("   \n  ")).toBe("");
  });
});
