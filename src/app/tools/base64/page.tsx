import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TagChip } from "~/components/tag-chip";
import { Base64Tool } from "~/components/tools/base64-tool";
import { getTool } from "~/lib/tools/registry";

const tool = getTool("base64");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
};

export default function Base64Page() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-10 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={1.8} />
        All tools
      </Link>
      <h1 className="mt-8 text-4xl font-bold tracking-[-0.035em]">
        {tool?.name}
      </h1>
      <p className="mt-3 text-muted-foreground">{tool?.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tool?.tags.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </div>
      <div className="mt-10">
        <Base64Tool />
      </div>
    </div>
  );
}
