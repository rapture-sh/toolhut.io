import type { Metadata } from "next";
import { LoremIpsumTool } from "~/components/tools/lorem-ipsum-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("lorem-ipsum");

export default function Page() {
  return (
    <ToolPage slug="lorem-ipsum">
      <LoremIpsumTool />
    </ToolPage>
  );
}
