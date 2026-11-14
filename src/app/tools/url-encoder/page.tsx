import type { Metadata } from "next";
import { ToolPage } from "~/components/tools/tool-page";
import { UrlEncoderTool } from "~/components/tools/url-encoder-tool";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("url-encoder");

export default function Page() {
  return (
    <ToolPage slug="url-encoder">
      <UrlEncoderTool />
    </ToolPage>
  );
}
