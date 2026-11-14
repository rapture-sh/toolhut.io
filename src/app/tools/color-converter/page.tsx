import type { Metadata } from "next";
import { ColorConverterTool } from "~/components/tools/color-converter-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("color-converter");

export default function ColorConverterPage() {
  return (
    <ToolPage slug="color-converter">
      <ColorConverterTool />
    </ToolPage>
  );
}
