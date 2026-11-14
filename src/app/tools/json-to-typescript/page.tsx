import type { Metadata } from "next";
import { JsonToTypescriptTool } from "~/components/tools/json-to-typescript-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("json-to-typescript");

export default function JsonToTypescriptPage() {
  return (
    <ToolPage slug="json-to-typescript">
      <JsonToTypescriptTool />
    </ToolPage>
  );
}
