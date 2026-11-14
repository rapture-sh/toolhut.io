import type { Metadata } from "next";
import { PdfSplitTool } from "~/components/tools/pdf-split-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("pdf-split");

export default function PdfSplitPage() {
  return (
    <ToolPage slug="pdf-split">
      <PdfSplitTool />
    </ToolPage>
  );
}
