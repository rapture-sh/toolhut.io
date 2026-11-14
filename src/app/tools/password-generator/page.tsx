import type { Metadata } from "next";
import { PasswordGeneratorTool } from "~/components/tools/password-generator-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("password-generator");

export default function PasswordGeneratorPage() {
  return (
    <ToolPage slug="password-generator">
      <PasswordGeneratorTool />
    </ToolPage>
  );
}
