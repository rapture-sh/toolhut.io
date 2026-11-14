import type { Metadata } from "next";
import { PdfToImageTool } from "~/components/tools/pdf-to-image-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("pdf-to-image");

export default function PdfToImagePage() {
  return (
    <ToolPage slug="pdf-to-image">
      <PdfToImageTool />
    </ToolPage>
  );
}
