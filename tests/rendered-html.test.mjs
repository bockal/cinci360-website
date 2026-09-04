import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders production SEO metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.match(html, /<form[^>]+action=["']https:\/\/formsubmit\.co\/aubrey@cinci360\.com["'][^>]+method=["']POST["']/i);
  assert.match(html, /<source[^>]+srcSet=["']\/images\/workflows\/cinci360-tenure-hero-mobile\.webp["']/i);
  assert.match(html, /href=["']\/projects\/estee-lauder-plant["'][^>]*>Case Study<\/a>/i);
  assert.match(html, /href=["']\/answers["'][^>]*>FAQ<\/a>/i);
  assert.doesNotMatch(html, /Cinci360-Capability-Statement\.pdf|Capability statement/i);
});

test("renders the Estée Lauder case study without Trek content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("case-study-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/projects/estee-lauder-plant", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Asian clean-room manufacturing standards/);
  assert.match(html, /estee-lauder-scan-to-revit-poster\.png/);
  assert.match(html, /estee-lauder-facility-plan-v2\.webp/);
  assert.match(html, /my\.matterport\.com\/show\/\?m=QtjFgkR1NsT/);
  assert.doesNotMatch(html, /Trek Bicycle|Waterloo, Wisconsin|autode\.sk/);
});

test("renders the animated Cinci360 tripod mark on every interior page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("interior-brand-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const routes = [
    "/3d-laser-scanning-cincinnati",
    "/scan-to-bim-revit-cad",
    "/it-services",
    "/answers",
    "/projects/estee-lauder-plant",
  ];

  for (const route of routes) {
    const response = await worker.fetch(
      new Request(`http://localhost${route}`, { headers: { accept: "text/html" } }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), /class=["'][^"']*brand-tripod[^"']*["']/, route);
  }
});
