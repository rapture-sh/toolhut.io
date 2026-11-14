import type { Metadata } from "next";
import { ContrastCheckerTool } from "~/components/tools/contrast-checker-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("contrast-checker");

export default function ContrastCheckerPage() {
  return (
    <ToolPage slug="contrast-checker">
      <ContrastCheckerTool />
    </ToolPage>
  );
}
