import type { Metadata } from "next";
import { ToolPage } from "~/components/tools/tool-page";
import { UuidGeneratorTool } from "~/components/tools/uuid-generator-tool";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("uuid-generator");

export default function Page() {
  return (
    <ToolPage slug="uuid-generator">
      <UuidGeneratorTool />
    </ToolPage>
  );
}
