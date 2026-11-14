import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Markdown is allowed to carry raw HTML, so the rendered result is sanitised
 * before any caller can put it in the page.
 */
export function renderMarkdown(input: string): string {
  if (input.trim() === "") {
    return "";
  }

  const html = marked.parse(input, { async: false, gfm: true });

  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
