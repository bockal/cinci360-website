import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const redirects = {
  "cinci360-services": "/it-services",
  gallery: "/scan-to-bim-revit-cad",
  "cinci360-courses": "/it-services",
  consulting: "/it-services",
  "web-pricing": "/it-services",
  "3d-pricing": "/3d-laser-scanning-cincinnati",
  capabilities: "/Cinci360-Capability-Statement.pdf",
  webdev: "/it-services",
  "3d-portfolio": "/scan-to-bim-revit-cad",
  "3d-modeling-services": "/scan-to-bim-revit-cad",
  "seo-portal": "/it-services",
  "seo-tutorial": "/it-services",
  matterport: "/3d-laser-scanning-cincinnati",
  cupix: "/3d-laser-scanning-cincinnati",
};

for (const [legacyPath, destination] of Object.entries(redirects)) {
  const directory = join("out", legacyPath);
  await mkdir(directory, { recursive: true });
  const absoluteDestination = new URL(destination, "https://cinci360.com").href;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${absoluteDestination}"><link rel="canonical" href="${absoluteDestination}"><title>Page moved | Cinci360</title><script>location.replace(${JSON.stringify(destination)}+location.search+location.hash)</script></head><body><p>This page has moved to <a href="${absoluteDestination}">${absoluteDestination}</a>.</p></body></html>`;
  await writeFile(join(directory, "index.html"), html);
}
