import type { ReactNode } from "react";

interface ToolsLayoutProps {
  children: ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return <div className="pb-8">{children}</div>;
}
