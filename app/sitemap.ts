import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://cinci360.com/",
      lastModified: new Date("2026-09-04"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://cinci360.com/3d-laser-scanning-cincinnati",
      lastModified: new Date("2026-09-04"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://cinci360.com/scan-to-bim-revit-cad",
      lastModified: new Date("2026-09-04"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://cinci360.com/it-services",
      lastModified: new Date("2026-09-04"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://cinci360.com/answers",
      lastModified: new Date("2026-09-04"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://cinci360.com/projects/estee-lauder-plant",
      lastModified: new Date("2026-09-04"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
