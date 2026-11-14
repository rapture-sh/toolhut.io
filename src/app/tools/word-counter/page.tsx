import type { Metadata } from "next";
import { ToolPage } from "~/components/tools/tool-page";
import { WordCounterTool } from "~/components/tools/word-counter-tool";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("word-counter");

export default function Page() {
  return (
    <ToolPage slug="word-counter">
      <WordCounterTool />
    </ToolPage>
  );
}
