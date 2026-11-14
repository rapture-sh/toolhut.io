import type { Metadata } from "next";
import { PdfMetadataTool } from "~/components/tools/pdf-metadata-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("pdf-metadata");

export default function PdfMetadataPage() {
  return (
    <ToolPage slug="pdf-metadata">
      <PdfMetadataTool />
    </ToolPage>
  );
}
