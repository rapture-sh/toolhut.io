import type { Metadata } from "next";
import { ColorFromImageTool } from "~/components/tools/color-from-image-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("color-from-image");

export default function ColorFromImagePage() {
  return (
    <ToolPage slug="color-from-image">
      <ColorFromImageTool />
    </ToolPage>
  );
}
