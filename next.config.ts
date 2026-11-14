import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev writes into AGENTS.md unless both of these are off.
  agentRules: false,
  experimental: {
    agentFeedback: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
