import Link from "next/link";
import { SiteFooter } from "~/components/site-footer";
import { toolsByCategory } from "~/lib/tools/registry";
import { CATEGORY_LABELS } from "~/lib/tools/types";

export default function Home() {
  const categories = toolsByCategory();

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 py-24">
        <header className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">toolhut</h1>
          <p className="text-lg leading-8 text-muted">
            Everyday tools that run entirely in your browser. Most tools on the
            web upload your files to a server to do work your own machine can do
            perfectly well. toolhut does not. No uploads, no accounts, no
            tracking, and the whole thing is open source.
          </p>
        </header>

        {categories.map(([category, group]) => (
          <section key={category} className="flex flex-col gap-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
              {CATEGORY_LABELS[category]}
            </h2>
            <ul className="flex flex-col gap-2">
              {group.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="flex flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:border-foreground"
                  >
                    <span className="font-medium">{tool.name}</span>
                    <span className="text-sm text-muted">
                      {tool.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
