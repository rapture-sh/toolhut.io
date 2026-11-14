import type { Metadata } from "next";
import { TomlJsonTool } from "~/components/tools/toml-json-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("toml-json");

export default function TomlJsonPage() {
  return (
    <ToolPage slug="toml-json">
      <TomlJsonTool />
    </ToolPage>
  );
}
