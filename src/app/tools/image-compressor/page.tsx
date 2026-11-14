import type { Metadata } from "next";
import { ImageCompressorTool } from "~/components/tools/image-compressor-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("image-compressor");

export default function ImageCompressorPage() {
  return (
    <ToolPage slug="image-compressor">
      <ImageCompressorTool />
    </ToolPage>
  );
}
