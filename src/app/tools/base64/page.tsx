import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "~/components/site-footer";
import { Base64Tool } from "~/components/tools/base64-tool";
import { getTool } from "~/lib/tools/registry";

const tool = getTool("base64");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
};

export default function Base64Page() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-24">
        <header className="flex flex-col gap-3">
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← All tools
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            {tool?.name}
          </h1>
          <p className="text-muted">{tool?.description}</p>
        </header>

        <Base64Tool />
      </main>
      <SiteFooter />
    </>
  );
}
