import type { Metadata } from "next";
import { ToolPage } from "~/components/tools/tool-page";
import { YamlJsonTool } from "~/components/tools/yaml-json-tool";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("yaml-json");

export default function YamlJsonPage() {
  return (
    <ToolPage slug="yaml-json">
      <YamlJsonTool />
    </ToolPage>
  );
}
