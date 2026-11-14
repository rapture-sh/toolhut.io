import type { Metadata } from "next";
import { JsonFormatterTool } from "~/components/tools/json-formatter-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("json-formatter");

export default function JsonFormatterPage() {
  return (
    <ToolPage slug="json-formatter">
      <JsonFormatterTool />
    </ToolPage>
  );
}
