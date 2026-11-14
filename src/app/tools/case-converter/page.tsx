import type { Metadata } from "next";
import { CaseConverterTool } from "~/components/tools/case-converter-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("case-converter");

export default function Page() {
  return (
    <ToolPage slug="case-converter">
      <CaseConverterTool />
    </ToolPage>
  );
}
