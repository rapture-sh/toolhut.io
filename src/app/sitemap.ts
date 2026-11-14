import type { MetadataRoute } from "next";
import { siteConfig } from "~/config/site";
import { readyTools } from "~/lib/tools/registry";

/** Only tools that exist get a URL, so the sitemap never lists a 404. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...readyTools().map((tool) => ({
      url: `${siteConfig.url}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
