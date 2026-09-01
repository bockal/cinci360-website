import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://cinci360.com/",
      lastModified: new Date("2026-09-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://cinci360.com/3d-laser-scanning-cincinnati",
      lastModified: new Date("2026-09-01"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
