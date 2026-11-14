import type { Metadata } from "next";
import { ExifViewerTool } from "~/components/tools/exif-viewer-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("exif-viewer");

export default function ExifViewerPage() {
  return (
    <ToolPage slug="exif-viewer">
      <ExifViewerTool />
    </ToolPage>
  );
}
