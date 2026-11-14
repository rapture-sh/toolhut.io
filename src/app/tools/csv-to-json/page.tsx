import type { Metadata } from "next";
import { CsvToJsonTool } from "~/components/tools/csv-to-json-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("csv-to-json");

export default function CsvToJsonPage() {
  return (
    <ToolPage slug="csv-to-json">
      <CsvToJsonTool />
    </ToolPage>
  );
}
