import type { Metadata } from "next";
import { MarkdownPreviewTool } from "~/components/tools/markdown-preview-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("markdown-preview");

export default function MarkdownPreviewPage() {
  return (
    <ToolPage slug="markdown-preview">
      <MarkdownPreviewTool />
    </ToolPage>
  );
}
