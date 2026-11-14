import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TagChip } from "~/components/tag-chip";
import { ToolCard } from "~/components/tools/tool-card";
import { getTool, relatedTools } from "~/lib/tools/registry";

interface ToolPageProps {
  slug: string;
  children: React.ReactNode;
}

/**
 * The frame every tool page shares: where you came from, what this tool is,
 * the tool itself, and where to go next.
 */
export function ToolPage({ slug, children }: ToolPageProps) {
  const tool = getTool(slug);
  const related = relatedTools(slug);

  if (!tool) {
    return null;
  }

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={1.8} />
        All tools
      </Link>

      <header className="mt-8">
        <h1 className="text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
          {tool.name}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      </header>

      <div className="mt-10">{children}</div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold tracking-[-0.025em]">
            Related tools
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <li key={other.slug} className="flex">
                <ToolCard tool={other} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
