import type { ReactNode } from "react";

interface ToolsLayoutProps {
  children: ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-4">{children}</div>
  );
}
