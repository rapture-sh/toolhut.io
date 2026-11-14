import type { Metadata } from "next";
import { PdfMergeTool } from "~/components/tools/pdf-merge-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("pdf-merge");

export default function PdfMergePage() {
  return (
    <ToolPage slug="pdf-merge">
      <PdfMergeTool />
    </ToolPage>
  );
}
