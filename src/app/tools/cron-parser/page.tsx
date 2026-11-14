import type { Metadata } from "next";
import { CronParserTool } from "~/components/tools/cron-parser-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("cron-parser");

export default function CronParserPage() {
  return (
    <ToolPage slug="cron-parser">
      <CronParserTool />
    </ToolPage>
  );
}
