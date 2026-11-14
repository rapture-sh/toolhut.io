import type { Metadata } from "next";
import { ColorShadesTool } from "~/components/tools/color-shades-tool";
import { ToolPage } from "~/components/tools/tool-page";
import { toolMetadata } from "~/lib/tools/metadata";

export const metadata: Metadata = toolMetadata("color-shades");

export default function ColorShadesPage() {
  return (
    <ToolPage slug="color-shades">
      <ColorShadesTool />
    </ToolPage>
  );
}
