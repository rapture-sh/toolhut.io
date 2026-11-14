import type { Metadata } from "next";
import { TextDiffTool } from "~/components/tools/text-diff-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("text-diff");

export default function Page() {
  return (
    <ToolPage slug="text-diff">
      <TextDiffTool />
    </ToolPage>
  );
}
