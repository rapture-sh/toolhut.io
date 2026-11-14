import type { Metadata } from "next";
import { PdfToTextTool } from "~/components/tools/pdf-to-text-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("pdf-to-text");

export default function PdfToTextPage() {
  return (
    <ToolPage slug="pdf-to-text">
      <PdfToTextTool />
    </ToolPage>
  );
}
