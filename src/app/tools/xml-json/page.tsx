import type { Metadata } from "next";
import { ToolPage } from "~/components/tools/tool-page";
import { XmlJsonTool } from "~/components/tools/xml-json-tool";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("xml-json");

export default function XmlJsonPage() {
  return (
    <ToolPage slug="xml-json">
      <XmlJsonTool />
    </ToolPage>
  );
}
