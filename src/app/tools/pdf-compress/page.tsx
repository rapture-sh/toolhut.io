import type { Metadata } from "next";
import { PdfCompressTool } from "~/components/tools/pdf-compress-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("pdf-compress");

export default function PdfCompressPage() {
  return (
    <ToolPage slug="pdf-compress">
      <PdfCompressTool />
    </ToolPage>
  );
}
