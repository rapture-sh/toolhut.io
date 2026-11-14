import type { Metadata } from "next";
import { SlugifyTool } from "~/components/tools/slugify-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("slugify");

export default function Page() {
  return (
    <ToolPage slug="slugify">
      <SlugifyTool />
    </ToolPage>
  );
}
