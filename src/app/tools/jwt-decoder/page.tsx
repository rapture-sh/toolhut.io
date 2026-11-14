import type { Metadata } from "next";
import { JwtDecoderTool } from "~/components/tools/jwt-decoder-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("jwt-decoder");

export default function JwtDecoderPage() {
  return (
    <ToolPage slug="jwt-decoder">
      <JwtDecoderTool />
    </ToolPage>
  );
}
