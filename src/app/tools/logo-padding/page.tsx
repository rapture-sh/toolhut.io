import type { Metadata } from "next";
import { LogoPaddingTool } from "~/components/tools/logo-padding-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("logo-padding");

export default function LogoPaddingPage() {
  return (
    <ToolPage slug="logo-padding">
      <LogoPaddingTool />
    </ToolPage>
  );
}
