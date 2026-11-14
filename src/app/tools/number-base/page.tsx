import type { Metadata } from "next";
import { NumberBaseTool } from "~/components/tools/number-base-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("number-base");

export default function Page() {
  return (
    <ToolPage slug="number-base">
      <NumberBaseTool />
    </ToolPage>
  );
}
