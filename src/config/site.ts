export const siteConfig = {
  name: "toolhut",
  url: "https://toolhut.io",
  tagline: "Free online tools that never upload your files.",
  description:
    "Free online tools that run entirely in your browser: converters, encoders, image and PDF utilities. Open source, no uploads, no accounts, no servers.",
  links: {
    github: "https://github.com/rapture-sh/toolhut.io",
    issues: "https://github.com/rapture-sh/toolhut.io/issues",
    contributing:
      "https://github.com/rapture-sh/toolhut.io/blob/main/CONTRIBUTING.md",
    license: "https://github.com/rapture-sh/toolhut.io/blob/main/LICENSE",
    /** Tagged, so Rapture can see the traffic toolhut sends them. */
    rapture:
      "https://rapture.sh/?utm_source=toolhut.io&utm_medium=referral&utm_campaign=made-by",
  },
} as const;

export type SiteConfig = typeof siteConfig;
