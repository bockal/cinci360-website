import type { Metadata } from "next";
import Link from "next/link";
import "../../3d-laser-scanning-cincinnati/service-page.css";
import "./trek.css";
import "./estee.css";

export const metadata: Metadata = {
  title: "Trek & Estée Lauder Full-Facility Case Study",
  description: "Cinci360's two largest full-facility reality-capture projects: Trek headquarters for ChangeUp and an Estée Lauder plant for BHDP.",
  alternates: { canonical: "https://cinci360.com/projects/trek-waterloo" },
  openGraph: {
    type: "article",
    url: "https://cinci360.com/projects/trek-waterloo",
    title: "Trek & Estée Lauder Full-Facility Case Study | Cinci360",
    description: "Two large full-facility surveys delivered by Cinci360 for ChangeUp and BHDP.",
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": "https://cinci360.com/projects/trek-waterloo#case-study",
    headline: "Full-facility reality capture at Trek and Estée Lauder",
    description: "Cinci360's two largest projects to date: Trek Bicycle headquarters for ChangeUp and an Estée Lauder plant on Long Island for BHDP.",
    mainEntityOfPage: "https://cinci360.com/projects/trek-waterloo",
    author: { "@id": "https://cinci360.com/#organization" },
    publisher: { "@id": "https://cinci360.com/#organization" },
    about: ["3D laser scanning", "reality capture", "existing conditions", "scan-to-BIM"],
    contentLocation: [
      { "@type": "Place", name: "Trek Bicycle headquarters, Waterloo, Wisconsin" },
      { "@type": "Place", name: "Estée Lauder plant, Long Island, New York" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "3DModel",
    "@id": "https://cinci360.com/projects/trek-waterloo#trek-revit-model",
    name: "Trek Bicycle headquarters Revit model",
    description: "Interactive Autodesk Viewer presentation of the Revit model associated with Cinci360's full-facility reality-capture work at Trek Bicycle headquarters for ChangeUp.",
    encoding: { "@type": "MediaObject", embedUrl: "https://viewer.autodesk.com/id/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YTM2MHZpZXdlci1wcm90ZWN0ZWQvdDE3ODg1NDYwNjFfNGExNjFmYjItY2NjMC00Y2ZmLWE0NzYtM2I4M2ZlYWJhNTE2LnJ2dA?sheetId=ZmEwOTY1ZmQtNDI2MC00NWUzLTQ1NDEtMDVlMTJiMWNjMWZi" },
  },
  {
    "@context": "https://schema.org",
    "@type": "3DModel",
    "@id": "https://cinci360.com/projects/trek-waterloo#estee-lauder-model",
    name: "Estée Lauder plant Matterport digital twin",
    description: "Interactive Matterport digital twin from Cinci360's full-facility survey of an Estée Lauder plant for BHDP on Long Island, New York.",
    encoding: { "@type": "MediaObject", embedUrl: "https://my.matterport.com/show/?m=QtjFgkR1NsT", contentUrl: "https://my.matterport.com/show/?m=QtjFgkR1NsT" },
  },
  {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": "https://cinci360.com/projects/trek-waterloo#estee-lauder-plan",
    name: "Annotated Estée Lauder plant facility plan",
    description: "An annotated first-floor facility plan from BHDP showing operating zones and circulation across the Estée Lauder plant documented by Cinci360.",
    contentUrl: "https://cinci360.com/images/case-studies/estee-lauder-facility-plan.webp",
    width: 1769,
    height: 1189,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Projects", item: "https://cinci360.com/#projects" },
      { "@type": "ListItem", position: 3, name: "Trek and Estée Lauder", item: "https://cinci360.com/projects/trek-waterloo" },
    ],
  },
];

export default function TrekCaseStudy() {
  return <main className="service-page trek-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><nav><Link href="/answers">Answers</Link><Link href="/#contact">Start a project</Link></nav></header>
    <section className="trek-hero"><p className="eyebrow">Case study · Large-facility reality capture</p><h1>Two complete facilities. One dependable record of each.</h1><div className="trek-summary"><p>Trek Bicycle headquarters and an Estée Lauder plant are Cinci360’s two largest full-facility reality-capture projects to date.</p><dl><div><dt>Project teams</dt><dd>ChangeUp · BHDP</dd></div><div><dt>Scope</dt><dd>Two complete facilities</dd></div><div><dt>Service</dt><dd>Reality capture</dd></div><div><dt>Locations</dt><dd>Wisconsin · New York</dd></div></dl></div></section>
    <section className="trek-film"><div><p className="eyebrow">Trek · Waterloo, Wisconsin</p><h2>Headquarters captured for ChangeUp.</h2><p>Cinci360 surveyed the entire Trek Bicycle headquarters facility for ChangeUp. Open the resulting Revit model in Autodesk Viewer to inspect the BIM deliverable directly.</p><a className="viewer-link" href="https://autode.sk/4iN1k8r" target="_blank" rel="noreferrer">Open the Trek model full screen ↗</a></div><div className="viewer-frame"><iframe src="https://viewer.autodesk.com/id/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YTM2MHZpZXdlci1wcm90ZWN0ZWQvdDE3ODg1NDYwNjFfNGExNjFmYjItY2NjMC00Y2ZmLWE0NzYtM2I4M2ZlYWJhNTE2LnJ2dA?sheetId=ZmEwOTY1ZmQtNDI2MC00NWUzLTQ1NDEtMDVlMTJiMWNjMWZi" title="Trek Bicycle headquarters Revit model in Autodesk Viewer" loading="lazy" allow="fullscreen" allowFullScreen/></div></section>
    <figure className="facility-plan"><img src="/images/case-studies/estee-lauder-facility-plan.webp" width="1769" height="1189" alt="Annotated first-floor plan of the Estée Lauder plant showing filling, assembly, laboratory, storage and circulation zones"/><figcaption><span>BHDP · Estée Lauder plant</span><p>A facility-scale plan makes the complexity visible: production zones, laboratories, storage, circulation and operating constraints coordinated across one building.</p></figcaption></figure>
    <section className="estee-model"><div><p className="eyebrow">Estée Lauder · Long Island, New York</p><h2>An entire plant captured for BHDP.</h2><p>Cinci360 scanned the complete Estée Lauder facility for BHDP. Explore the Matterport digital twin to move through the documented plant directly in the browser.</p></div><div className="matterport-frame"><iframe src="https://my.matterport.com/show/?m=QtjFgkR1NsT" title="Estée Lauder plant Matterport digital twin captured by Cinci360" loading="lazy" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" allowFullScreen/></div></section>
    <section className="trek-story"><div><p className="eyebrow">The shared challenge</p><h2>One coordinated record of each complex facility.</h2></div><article><span>01 · The setting</span><h3>Large operating environments</h3><p>Facilities of this scale create a coordination problem: many spaces, many stakeholders and many downstream decisions. Complete capture gives the project team a shared spatial reference.</p></article><article><span>02 · The field work</span><h3>Facility-wide coverage</h3><p>Planning each assignment at building scale supported consistent coverage and a more useful handoff than teams could obtain from isolated site measurements.</p></article><article><span>03 · The value</span><h3>Buildings teams can revisit</h3><p>Reality-capture data preserves context after the field team leaves so stakeholders can return to the documented environment while planning and coordinating.</p></article></section>
    <section className="model-proof"><div><p className="eyebrow">More than a project list</p><h2>The strongest proof is the work itself.</h2></div><div><p>The annotated facility plan, live Matterport tour and inspectable Revit model show three different ways captured building data supports downstream teams—from remote visual context to detailed BIM review.</p><Link className="button button-gold" href="/#contact">Discuss your deliverables</Link></div></section>
    <section className="service-fit"><div><p className="eyebrow">Planning a large facility?</p><h2>Define the handoff before the first scan.</h2></div><p>Share the location, approximate area, access conditions and the files your architects or facilities team expects to use.</p><Link className="button button-gold" href="/#contact">Discuss a facility survey</Link></section>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>Reality capture · Existing conditions · BIM-ready documentation</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
