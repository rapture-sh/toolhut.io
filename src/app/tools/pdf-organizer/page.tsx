import type { Metadata } from "next";
import { PdfOrganizerTool } from "~/components/tools/pdf-organizer-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("pdf-organizer");

export default function PdfOrganizerPage() {
  return (
    <ToolPage slug="pdf-organizer">
      <PdfOrganizerTool />
    </ToolPage>
  );
}
