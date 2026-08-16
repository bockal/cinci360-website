import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a fully static site, including out/index.html, for GitHub Pages.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
