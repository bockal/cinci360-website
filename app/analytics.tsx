"use client";

import { useEffect } from "react";

type AnalyticsParameters = Record<string, string | number | boolean | undefined>;
type TrackedEvent = readonly [string, AnalyticsParameters];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, eventName: string, parameters?: AnalyticsParameters) => void;
  }
}

const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-SYVFL4853B";
const leadFormId = "project_inquiry";
const acquisitionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "msclkid"] as const;

export function trackEvent(eventName: string, parameters: AnalyticsParameters = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, parameters);
}

function cleanLabel(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim().slice(0, 100) || undefined;
}

function routeType(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/answers") return "faq";
  if (pathname.startsWith("/projects/")) return "case_study";
  if (pathname === "/it-services") return "it_services";
  return "reality_capture_service";
}

function rememberAcquisition(params: URLSearchParams) {
  for (const key of acquisitionKeys) {
    const value = params.get(key);
    if (value) sessionStorage.setItem(`cinci360_${key}`, value.slice(0, 150));
  }
}

function acquisitionParameters(): AnalyticsParameters {
  return Object.fromEntries(
    acquisitionKeys
      .map(key => [key, sessionStorage.getItem(`cinci360_${key}`) || undefined])
      .filter(([, value]) => value),
  );
}

function classifyLink(anchor: HTMLAnchorElement): TrackedEvent | null {
  const href = anchor.getAttribute("href") || "";
  const label = cleanLabel(anchor.getAttribute("aria-label") || anchor.textContent);
  const shared = { link_url: anchor.href || href, link_text: label, link_location: anchor.closest("header,main,footer")?.tagName.toLowerCase() };

  if (href.startsWith("mailto:")) return ["contact_click", { ...shared, contact_method: "email" }];
  if (href.startsWith("tel:")) return ["contact_click", { ...shared, contact_method: "phone" }];
  if (/linkedin\.com/i.test(href)) return ["linkedin_profile_click", { ...shared, social_network: "linkedin" }];
  if (/instagram\.com/i.test(href)) return ["social_profile_click", { ...shared, social_network: "instagram" }];
  if (/youtube\.com/i.test(href)) return ["social_profile_click", { ...shared, social_network: "youtube" }];
  if (/github\.com/i.test(href)) return ["social_profile_click", { ...shared, social_network: "github" }];
  if (/my\.matterport\.com|discover\.matterport\.com/i.test(href)) return ["virtual_tour_click", shared];
  if (/google\.com\/maps/i.test(href)) return ["review_profile_click", shared];
  if (/\.(pdf|dwg|dxf|rvt|ifc|e57|zip)(?:[?#]|$)/i.test(href)) return ["file_download", { ...shared, file_extension: href.split(".").pop()?.split(/[?#]/)[0]?.toLowerCase() }];
  if (href === "#contact" || href.endsWith("/#contact")) return ["contact_cta_click", { ...shared, cta_destination: "project_inquiry" }];
  if (/^\/(3d-laser-scanning|scan-to-bim|it-services)/.test(href)) return ["service_interest", { ...shared, service_path: href }];
  if (/^\/projects\//.test(href)) return ["case_study_click", { ...shared, project_path: href }];
  if (/^https?:\/\//.test(href) && !/^(https?:\/\/)?(www\.)?cinci360\.com/i.test(href)) return ["outbound_click", shared];
  if (href.startsWith("#") || href.startsWith("/")) return ["navigation_click", { ...shared, navigation_target: href }];
  return null;
}

export function AnalyticsEvents() {
  useEffect(() => {
    let formStarted = false;
    let formSubmitted = false;
    const completedFields = new Set<string>();
    const observedSections = new Set<string>();
    const observedTours = new Set<string>();
    const reachedDepths = new Set<number>();
    const cleanupTimers: number[] = [];
    const contactForm = document.querySelector<HTMLFormElement>("#contact form");
    const params = new URLSearchParams(window.location.search);

    rememberAcquisition(params);
    trackEvent("content_view", { content_type: routeType(window.location.pathname), page_path: window.location.pathname });

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (anchor) {
        const classified = classifyLink(anchor);
        if (classified) {
          if (classified[0] === "contact_cta_click") {
            sessionStorage.setItem("cinci360_last_cta", classified[1].link_text?.toString() || "contact_cta");
          }
          trackEvent(classified[0], classified[1]);
        }
      }
      if (target?.closest<HTMLButtonElement>("button.menu-button")) {
        trackEvent("navigation_menu_toggle", { menu_name: "primary" });
      }
    };

    const onFormStart = () => {
      if (formStarted) return;
      formStarted = true;
      trackEvent("lead_form_start", { form_id: leadFormId });
    };

    const onFieldChange = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!field?.name || field.name.startsWith("_")) return;
      if (field.validity.valid && !completedFields.has(field.name)) {
        completedFields.add(field.name);
        trackEvent("lead_form_field_complete", { form_id: leadFormId, field_name: field.name });
      }
    };

    const onInvalid = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!field?.name || field.name.startsWith("_")) return;
      trackEvent("lead_form_validation_error", { form_id: leadFormId, field_name: field.name });
    };

    const onFormSubmit = () => {
      formSubmitted = true;
      trackEvent("lead_form_submit", {
        form_id: leadFormId,
        completed_field_count: completedFields.size,
        cta_source: sessionStorage.getItem("cinci360_last_cta") || "direct",
        ...acquisitionParameters(),
      });
    };

    const onPageHide = () => {
      if (formStarted && !formSubmitted) {
        trackEvent("lead_form_abandon", { form_id: leadFormId, completed_field_count: completedFields.size, transport_type: "beacon" });
      }
    };

    const onScroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (available <= 0) return;
      const percent = Math.round((window.scrollY / available) * 100);
      for (const depth of [25, 50, 75, 90]) {
        if (percent >= depth && !reachedDepths.has(depth)) {
          reachedDepths.add(depth);
          trackEvent("scroll_depth", { percent_scrolled: depth, page_path: window.location.pathname });
        }
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onPageHide);
    contactForm?.addEventListener("focusin", onFormStart);
    contactForm?.addEventListener("change", onFieldChange);
    contactForm?.addEventListener("invalid", onInvalid, true);
    contactForm?.addEventListener("submit", onFormSubmit);

    const visibilityObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
        const element = entry.target as HTMLElement;
        if (element.tagName === "IFRAME") {
          const tourName = element.getAttribute("title") || "Matterport tour";
          if (!observedTours.has(tourName)) {
            observedTours.add(tourName);
            trackEvent("virtual_tour_view", { tour_name: tourName });
          }
        } else {
          const sectionId = element.id || "contact_form";
          if (!observedSections.has(sectionId)) {
            observedSections.add(sectionId);
            trackEvent(sectionId === "contact" ? "lead_form_view" : "section_view", { section_id: sectionId });
          }
        }
        visibilityObserver.unobserve(element);
      }
    }, { threshold: 0.5 });

    document.querySelectorAll<HTMLElement>("main section[id], #contact, iframe[title]").forEach(element => visibilityObserver.observe(element));

    for (const seconds of [30, 60, 120]) {
      cleanupTimers.push(window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          trackEvent("engaged_time", { seconds_engaged: seconds, page_path: window.location.pathname });
        }
      }, seconds * 1000));
    }

    if (params.get("sent") === "1" && sessionStorage.getItem("cinci360_lead_recorded") !== "1") {
      sessionStorage.setItem("cinci360_lead_recorded", "1");
      trackEvent("generate_lead", {
        form_id: leadFormId,
        cta_source: sessionStorage.getItem("cinci360_last_cta") || "direct",
        ...acquisitionParameters(),
      });
    }

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      contactForm?.removeEventListener("focusin", onFormStart);
      contactForm?.removeEventListener("change", onFieldChange);
      contactForm?.removeEventListener("invalid", onInvalid, true);
      contactForm?.removeEventListener("submit", onFormSubmit);
      visibilityObserver.disconnect();
      cleanupTimers.forEach(window.clearTimeout);
    };
  }, []);

  return null;
}

export function GoogleAnalyticsHead() {
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true,send_page_view:true});` }} />
    </>
  );
}
