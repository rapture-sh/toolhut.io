import type { Metadata } from "next";
import { SvgOptimizerTool } from "~/components/tools/svg-optimizer-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("svg-optimizer");

export default function SvgOptimizerPage() {
  return (
    <ToolPage slug="svg-optimizer">
      <SvgOptimizerTool />
    </ToolPage>
  );
}
