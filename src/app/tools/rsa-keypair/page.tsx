import type { Metadata } from "next";
import { RsaKeypairTool } from "~/components/tools/rsa-keypair-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("rsa-keypair");

export default function Page() {
  return (
    <ToolPage slug="rsa-keypair">
      <RsaKeypairTool />
    </ToolPage>
  );
}
