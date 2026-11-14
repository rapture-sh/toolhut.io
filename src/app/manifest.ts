import type { MetadataRoute } from "next";
import { siteConfig } from "~/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name}, ${siteConfig.tagline.toLowerCase()}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#b9c6f7",
    categories: ["utilities", "productivity", "developer"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
