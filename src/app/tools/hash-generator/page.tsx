import type { Metadata } from "next";
import { HashGeneratorTool } from "~/components/tools/hash-generator-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("hash-generator");

export default function Page() {
  return (
    <ToolPage slug="hash-generator">
      <HashGeneratorTool />
    </ToolPage>
  );
}
