import type { Metadata } from "next";
import { ImageConverterTool } from "~/components/tools/image-converter-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("image-converter");

export default function ImageConverterPage() {
  return (
    <ToolPage slug="image-converter">
      <ImageConverterTool />
    </ToolPage>
  );
}
