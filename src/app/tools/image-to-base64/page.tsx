import type { Metadata } from "next";
import { ImageToBase64Tool } from "~/components/tools/image-to-base64-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("image-to-base64");

export default function ImageToBase64Page() {
  return (
    <ToolPage slug="image-to-base64">
      <ImageToBase64Tool />
    </ToolPage>
  );
}
