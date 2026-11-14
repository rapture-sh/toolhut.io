import type { Metadata } from "next";
import { RegexTesterTool } from "~/components/tools/regex-tester-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("regex-tester");

export default function RegexTesterPage() {
  return (
    <ToolPage slug="regex-tester">
      <RegexTesterTool />
    </ToolPage>
  );
}
