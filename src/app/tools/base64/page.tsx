import type { Metadata } from "next";
import { Base64Tool } from "~/components/tools/base64-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("base64");

export default function Base64Page() {
  return (
    <ToolPage slug="base64">
      <Base64Tool />
    </ToolPage>
  );
}
