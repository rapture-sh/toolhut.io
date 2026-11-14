import type { Metadata } from "next";
import { QrCodeTool } from "~/components/tools/qr-code-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("qr-code");

export default function QrCodePage() {
  return (
    <ToolPage slug="qr-code">
      <QrCodeTool />
    </ToolPage>
  );
}
