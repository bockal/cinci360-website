import type { Metadata } from "next";
import Link from "next/link";
import AnimatedBrand from "../animated-brand";
import "../3d-laser-scanning-cincinnati/service-page.css";
import "../service-nav.css";
import "../floor-plans/landing-page.css";

export const metadata: Metadata = {
  title: "LiDAR Due Diligence for Existing Buildings",
  description: "Document existing conditions before you buy, renovate or repurpose a building. Cinci360 captures facilities with LiDAR, floor plans, 3D data and digital records for acquisition and retrofit due diligence.",
  alternates: { canonical: "https://cinci360.com/due-diligence" },
  openGraph: {
    type: "website",
    url: "https://cinci360.com/due-diligence",
    title: "Existing-Building Due Diligence with LiDAR | Cinci360",
    description: "Know the building before you buy, renovate or repurpose it. Capture existing conditions, retrofit scope and spatial data in one coordinated survey.",
    images: [{ url: "https://cinci360.com/images/landing/due-diligence-hero.webp", width: 1800, height: 694, alt: "Cinci360 existing-building due diligence LiDAR survey" }],
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://cinci360.com/due-diligence#service",
    name: "Existing-Building Due Diligence with LiDAR",
    serviceType: "Building acquisition due diligence, LiDAR existing-condition capture and retrofit documentation",
    provider: { "@id": "https://cinci360.com/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    url: "https://cinci360.com/due-diligence",
    description: "LiDAR surveys, floor plans, point clouds and digital building records used to understand existing conditions before acquisition, renovation or repurposing.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Building Due Diligence", item: "https://cinci360.com/due-diligence" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How does LiDAR help with property due diligence?", acceptedAnswer: { "@type": "Answer", text: "LiDAR creates a measured spatial record of an existing building so acquisition, architecture and facilities teams can review dimensions, layout, access, existing conditions and retrofit scope from shared data." } },
      { "@type": "Question", name: "What can Cinci360 deliver for due diligence?", acceptedAnswer: { "@type": "Answer", text: "Depending on scope, deliverables can include a Matterport digital twin, measured floor plans, point clouds, E57 files, CAD drawings, Revit models and photographic documentation." } },
      { "@type": "Question", name: "When should a buyer scan a commercial building during due diligence?", acceptedAnswer: { "@type": "Answer", text: "Reality capture is most useful before acquisition, renovation or repurposing when the team needs a reliable record of dimensions, layout and visible existing conditions to inform scope, budgeting and design." } },
      { "@type": "Question", name: "Can a LiDAR survey help estimate retrofit scope?", acceptedAnswer: { "@type": "Answer", text: "A LiDAR survey can provide measured spatial data, floor plans and a navigable digital record that help architects, owners and estimators understand the building and define where further investigation is needed. It does not replace specialized structural, environmental or engineering inspections." } },
    ],
  },
];

export default function DueDiligencePage() {
  return <main className="service-page landing-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><AnimatedBrand/><nav><Link href="/floor-plans">Floor Plans</Link><Link href="/3d-laser-scanning-cincinnati">3D Scanning</Link><Link href="/projects/estee-lauder-plant">Case Study</Link><Link href="/#contact">Start a project</Link></nav></header>

    <section className="landing-poster">
      <img src="/images/landing/due-diligence-hero.webp" alt="Cinci360 LiDAR surveyor documenting an existing building for acquisition and retrofit due diligence"/>
    </section>

    <section className="service-hero landing-hero">
      <div><p className="eyebrow">Acquisition · Retrofit · Existing conditions</p><h1>Know the building before you buy, renovate or repurpose it.</h1><p className="service-lede">A site can look straightforward during a walkthrough and still hide years of undocumented changes. Cinci360 creates a measured digital record before major capital decisions are made.</p><div className="service-actions"><Link className="button button-gold" href="/#contact">Plan a due-diligence survey</Link><a href="mailto:support@cinci360.com">support@cinci360.com ↗</a></div></div>
      <aside><span>One coordinated survey</span><strong>Document what exists.</strong><strong>Plan what comes next.</strong><dl><div><dt>Document</dt><dd>Existing conditions at scale</dd></div><div><dt>Quantify</dt><dd>Retrofit scope + spatial risk</dd></div><div><dt>Record</dt><dd>Plans · 3D data · imagery</dd></div></dl></aside>
    </section>

    <section className="landing-metrics">
      <article><span>Before acquisition</span><strong>See more</strong><p>Give decision-makers a measurable record beyond photos and a walkthrough.</p></article>
      <article><span>Before retrofit</span><strong>Scope better</strong><p>Architects and estimators can review layouts and conditions remotely.</p></article>
      <article><span>After capture</span><strong>Revisit anytime</strong><p>Keep a digital record that survives ownership changes and project turnover.</p></article>
      <article><span>Field coverage</span><strong>Nationwide</strong><p>Large facilities, complex buildings and multi-site acquisition programs.</p></article>
    </section>

    <section className="service-proof carew-proof"><div><p className="eyebrow">Carew Tower · Cincinnati</p><h2>Due diligence becomes valuable when a building has history.</h2></div><article><span>Complex existing conditions</span><h3>A 55-story building is not a clipboard exercise.</h3><p>Cinci360's Carew Tower work documented a massive existing structure where deferred maintenance and hidden conditions mattered. A spatial record gave the project team something far more useful than scattered site photos.</p></article><article><span>Retrofit decisions</span><h3>Capture the building before assumptions become budgets.</h3><p>Measured plans and a navigable 3D record can help teams understand circulation, dimensions and problem areas before design and renovation decisions are locked in.</p></article></section>

    <section className="carew-tour"><div><p className="eyebrow">A real project record</p><h2>Walk the Carew Tower survey.</h2><p>This Matterport record was captured with earlier-generation equipment appropriate to the original floor-plan scope. Today we would select the capture platform around the due-diligence objective, required accuracy and downstream deliverables.</p></div><iframe title="Carew Tower existing conditions Matterport tour" src="https://my.matterport.com/show/?m=mzpDndv61yD" allowFullScreen allow="autoplay; fullscreen; web-share; xr-spatial-tracking"/></section>

    <section className="service-deliverables"><p className="eyebrow">What the survey can answer</p><h2>Turn an unfamiliar building into a shared source of truth.</h2><div><article><b>01</b><h3>What actually exists?</h3><p>Document layouts, dimensions, openings, circulation, visible conditions and the relationship between spaces before acquisition or design.</p></article><article><b>02</b><h3>What will the retrofit touch?</h3><p>Give architecture, facilities and estimating teams spatial information they can use to define scope, coordinate remotely and identify where more investigation is needed.</p></article><article><b>03</b><h3>What record survives the transaction?</h3><p>Deliver floor plans, point clouds, digital twins and model-ready data that remain useful after the property changes hands.</p></article></div></section>

    <section className="service-proof"><div><p className="eyebrow">Beyond acquisition</p><h2>The same workflow supports major facility change.</h2></div><article><span>Estée Lauder · Long Island</span><h3>Existing conditions for a manufacturing retrofit</h3><p>Cinci360 captured an entire plant for BHDP so the project team could work from a dependable spatial record while planning a clean-room retrofit.</p><Link href="/projects/estee-lauder-plant">Read the case study →</Link></article><article><span>Retail + facility programs</span><h3>Repeatable records across sites</h3><p>The same approach can support portfolio acquisitions, prototype rollouts, facility inventories and retrofit programs where consistent documentation matters from one location to the next.</p><Link href="/floor-plans">Explore measured floor plans →</Link></article></section>

    <section className="landing-faq"><p className="eyebrow">Common questions</p><h2>Building due-diligence FAQs</h2><details><summary>How does LiDAR help with property due diligence?</summary><p>It creates a measured spatial record of the existing building so acquisition, architecture and facilities teams can review layout, dimensions, circulation and visible conditions from shared data.</p></details><details><summary>When should a buyer scan a commercial building?</summary><p>Before acquisition, renovation or repurposing—especially when existing drawings are missing, old or unreliable and the team needs better information before committing to scope and budget.</p></details><details><summary>Can a LiDAR survey help estimate retrofit scope?</summary><p>It can provide measured spatial data, floor plans and a navigable digital record that help teams define retrofit scope and identify where additional investigation is needed. It does not replace structural, environmental or engineering inspections.</p></details><details><summary>What deliverables are available?</summary><p>Depending on scope: measured floor plans, Matterport digital twins, registered point clouds, E57 files, CAD drawings, Revit models and photographic documentation.</p></details></section>
    <section className="service-fit"><div><p className="eyebrow">Before the next capital decision</p><h2>Send us the building before you send a team back to measure it.</h2></div><p>Share the location, approximate square footage, transaction or retrofit timeline and the decisions your team needs to make. We will recommend the capture method and deliverables around that objective.</p><Link className="button button-gold" href="/#contact">Discuss the building</Link></section>

    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>Existing-building due diligence · LiDAR · Floor plans · 3D records</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}