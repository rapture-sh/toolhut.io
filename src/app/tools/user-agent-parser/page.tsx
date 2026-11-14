import type { Metadata } from "next";
import { ToolPage } from "~/components/tools/tool-page";
import { UserAgentParserTool } from "~/components/tools/user-agent-parser-tool";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("user-agent-parser");

export default function UserAgentParserPage() {
  return (
    <ToolPage slug="user-agent-parser">
      <UserAgentParserTool />
    </ToolPage>
  );
}
