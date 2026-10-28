import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../app/analytics.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function mount(search, storage) {
  const events = [];
  const listeners = {};
  const form = { addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener() {} };
  const context = {
    exports: {}, process: { env: {} }, URLSearchParams,
    require: name => name === "react" ? { useEffect: fn => fn() } : {},
    sessionStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key),
    },
    window: {
      location: { search, pathname: "/" },
      gtag: (_, event, params) => events.push({ event, params }),
      addEventListener() {}, removeEventListener() {}, setTimeout: () => 1, clearTimeout() {},
    },
    document: { querySelector: () => form, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} },
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
  };
  vm.runInNewContext(code, context);
  context.exports.AnalyticsEvents();
  return { events, submit: listeners.submit };
}

test("submission attempt becomes a lead only after the provider success return, once", () => {
  const storage = new Map();
  const attempt = mount("?utm_source=google&utm_campaign=gbp", storage);
  attempt.submit();
  assert.ok(attempt.events.some(e => e.event === "lead_form_submit"));
  assert.equal(attempt.events.filter(e => e.event === "generate_lead").length, 0);
  const confirmed = mount("?sent=1", storage);
  const leads = confirmed.events.filter(e => e.event === "generate_lead");
  assert.equal(leads.length, 1);
  assert.equal(leads[0].params.utm_campaign, "gbp");
  assert.equal(leads[0].params.confirmation_method, "formsubmit_return");
  assert.equal(mount("?sent=1", storage).events.filter(e => e.event === "generate_lead").length, 0);
});

test("visiting a success URL without submitting does not generate a lead", () => {
  assert.equal(mount("?sent=1", new Map()).events.filter(e => e.event === "generate_lead").length, 0);
});
