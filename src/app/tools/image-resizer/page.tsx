import type { Metadata } from "next";
import { ImageResizerTool } from "~/components/tools/image-resizer-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("image-resizer");

export default function ImageResizerPage() {
  return (
    <ToolPage slug="image-resizer">
      <ImageResizerTool />
    </ToolPage>
  );
}
