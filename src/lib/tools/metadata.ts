import type { Metadata } from "next";
import { siteConfig } from "~/config/site";
import { getTool } from "~/lib/tools/registry";

/**
 * Every tool page's metadata comes from its registry entry, so the title,
 * description and keywords can never drift from the card that links to it.
 */
export function toolMetadata(slug: string): Metadata {
  const tool = getTool(slug);

  if (!tool) {
    return {};
  }

  const description = tool.metaDescription ?? tool.description;
  const url = `${siteConfig.url}/tools/${tool.slug}`;

  return {
    // The layout template appends the site name.
    title: `${tool.name} - ${tool.tagline}`,
    description,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title: `${tool.name} - ${tool.tagline} - ${siteConfig.name}`,
      description,
    },
  };
}
