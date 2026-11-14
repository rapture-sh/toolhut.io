import type { Metadata } from "next";
import { FaviconGeneratorTool } from "~/components/tools/favicon-generator-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("favicon-generator");

export default function FaviconGeneratorPage() {
  return (
    <ToolPage slug="favicon-generator">
      <FaviconGeneratorTool />
    </ToolPage>
  );
}
