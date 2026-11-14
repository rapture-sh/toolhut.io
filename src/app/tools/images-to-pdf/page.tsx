import type { Metadata } from "next";
import { ImagesToPdfTool } from "~/components/tools/images-to-pdf-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("images-to-pdf");

export default function ImagesToPdfPage() {
  return (
    <ToolPage slug="images-to-pdf">
      <ImagesToPdfTool />
    </ToolPage>
  );
}
