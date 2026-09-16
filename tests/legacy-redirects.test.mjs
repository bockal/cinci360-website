import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

test("legacy pages preserve queries and select the correct replacement section", async () => {
  const directory = await mkdtemp(join(tmpdir(), "cinci-redirects-"));
  try {
    execFileSync(process.execPath, [resolve("scripts/generate-legacy-redirects.mjs")], { cwd: directory });
    const cases = [
      ["product/website-creation-services", "/it-services", "#pricing"],
      ["2018/05/12/cinci360-history", "/", "#team"],
      ["2021/01/01/digital-twin-technology-combining-3d-data-and-industry-insights-for-rapid-growth", "/answers", "#facilities"],
    ];
    for (const [path, expectedPath, expectedHash] of cases) {
      const html = await readFile(join(directory, "out", path, "index.html"), "utf8");
      assert.match(html, /http-equiv="refresh"/);
      assert.match(html, /rel="canonical"/);
      let redirected;
      vm.runInNewContext(html.match(/<script>(.*?)<\/script>/s)[1], {
        URL,
        location: { search: "?utm_source=legacy", hash: "#pricing", replace: value => { redirected = new URL(value); } },
      });
      assert.equal(redirected.origin, "https://cinci360.com");
      assert.equal(redirected.pathname, expectedPath);
      assert.equal(redirected.search, "?utm_source=legacy");
      assert.equal(redirected.hash, expectedHash);
    }
  } finally {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith("cinci-redirects-"));
    await rm(directory, { recursive: true, force: true });
  }
});
