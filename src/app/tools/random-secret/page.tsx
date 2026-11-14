import type { Metadata } from "next";
import { RandomSecretTool } from "~/components/tools/random-secret-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("random-secret");

export default function Page() {
  return (
    <ToolPage slug="random-secret">
      <RandomSecretTool />
    </ToolPage>
  );
}
