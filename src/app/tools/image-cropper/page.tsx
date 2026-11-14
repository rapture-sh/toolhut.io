import type { Metadata } from "next";
import { ImageCropperTool } from "~/components/tools/image-cropper-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("image-cropper");

export default function ImageCropperPage() {
  return (
    <ToolPage slug="image-cropper">
      <ImageCropperTool />
    </ToolPage>
  );
}
