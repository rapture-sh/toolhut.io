import type { Metadata } from "next";
import { HtmlEntitiesTool } from "~/components/tools/html-entities-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("html-entities");

export default function Page() {
  return (
    <ToolPage slug="html-entities">
      <HtmlEntitiesTool />
    </ToolPage>
  );
}
