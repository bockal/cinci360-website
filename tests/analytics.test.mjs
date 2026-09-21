import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("analytics covers acquisition, engagement, and conversion without collecting field values", async () => {
  const [layout, analytics] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/analytics.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /<head>[\s\S]*<GoogleAnalyticsHead \/>[\s\S]*<\/head>/);
  assert.match(layout, /<AnalyticsEvents \/>/);
  assert.match(analytics, /G-SYVFL4853B/);
  for (const event of [
    "content_view", "section_view", "scroll_depth", "engaged_time", "navigation_click",
    "navigation_menu_toggle", "service_interest", "case_study_click", "virtual_tour_view",
    "virtual_tour_click", "review_profile_click", "linkedin_profile_click", "social_profile_click",
    "outbound_click", "file_download", "contact_click", "contact_cta_click", "lead_form_view",
    "lead_form_start", "lead_form_field_complete", "lead_form_validation_error", "lead_form_abandon",
    "lead_form_submit", "generate_lead",
  ]) assert.match(analytics, new RegExp(`\\"${event}\\"`));
  for (const source of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "msclkid"]) {
    assert.match(analytics, new RegExp(`\\"${source}\\"`));
  }
  assert.doesNotMatch(analytics, /FormData|\.value\b|email_address|phone_number/);
});
