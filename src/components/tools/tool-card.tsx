import Link from "next/link";
import { TagChip } from "~/components/tag-chip";
import { TAG_SOLID } from "~/lib/tools/tag-styles";
import type { Tool } from "~/lib/tools/types";
import { cn } from "~/lib/utils";

interface ToolCardProps {
  tool: Tool;
}

/** One tool in a grid. A planned tool renders flat, with nothing to click. */
export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  const planned = tool.status === "planned";
  const shell = "group flex h-full w-full flex-col rounded-3xl bg-card p-6";

  const body = (
    <>
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
          TAG_SOLID[tool.tags[0]],
        )}
      >
        <Icon className="size-[22px]" strokeWidth={1.8} />
      </span>
      <span className="mt-5 flex items-center gap-2">
        <span className="text-[17px] font-semibold tracking-[-0.02em]">
          {tool.name}
        </span>
        {planned && (
          <span className="font-mono text-[11px] text-muted-foreground">
            soon
          </span>
        )}
      </span>
      <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </span>
      <span className="mt-auto flex flex-wrap gap-1.5 pt-6">
        {tool.tags.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </span>
    </>
  );

  if (planned) {
    return <div className={cn(shell, "opacity-60")}>{body}</div>;
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(shell, "transition-colors hover:bg-accent")}
    >
      {body}
    </Link>
  );
}
