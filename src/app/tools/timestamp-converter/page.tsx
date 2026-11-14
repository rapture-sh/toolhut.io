import type { Metadata } from "next";
import { TimestampConverterTool } from "~/components/tools/timestamp-converter-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("timestamp-converter");

export default function TimestampConverterPage() {
  return (
    <ToolPage slug="timestamp-converter">
      <TimestampConverterTool />
    </ToolPage>
  );
}
