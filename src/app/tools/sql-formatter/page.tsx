import type { Metadata } from "next";
import { SqlFormatterTool } from "~/components/tools/sql-formatter-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("sql-formatter");

export default function SqlFormatterPage() {
  return (
    <ToolPage slug="sql-formatter">
      <SqlFormatterTool />
    </ToolPage>
  );
}
