import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://cinci360.com/sitemap.xml",
    host: "https://cinci360.com",
  };
}
