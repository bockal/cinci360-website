import type { Metadata } from "next";
import Link from "next/link";
import "../3d-laser-scanning-cincinnati/service-page.css";
import "./landing-page.css";

export const metadata: Metadata = {
  title: "Measured Floor Plans from LiDAR | Nationwide Facility Surveys",
  description: "Accurate measured floor plans for facilities nationwide. Cinci360 uses LiDAR reality capture to document existing conditions, with typical 7-business-day turnaround for facilities under 50,000 sq ft.",
  alternates: { canonical: "https://cinci360.com/floor-plans" },
  openGraph: {
    type: "website",
    url: "https://cinci360.com/floor-plans",
    title: "Accurate Floor Plans for Any Facility | Cinci360",
    description: "LiDAR capture, measured floor plans and nationwide field coverage for architects, facility managers and multi-site programs.",
    images: [{ url: "https://cinci360.com/images/workflows/floor-plans-hero.webp", width: 1800, height: 695, alt: "Cinci360 LiDAR surveyor creating accurate measured floor plans for commercial facilities" }],
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://cinci360.com/floor-plans#service",
    name: "Measured Floor Plans from LiDAR",
    serviceType: "LiDAR floor plan surveys and existing-condition documentation",
    provider: { "@id": "https://cinci360.com/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    url: "https://cinci360.com/floor-plans",
    availableChannel: { "@type": "ServiceChannel", serviceUrl: "https://cinci360.com/#contact" },
    image: "https://cinci360.com/images/workflows/floor-plans-hero.webp",
    description: "Nationwide LiDAR capture and measured floor plans for commercial facilities, architecture teams, facility managers and multi-site programs.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Measured Floor Plans", item: "https://cinci360.com/floor-plans" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How long does it take to capture a facility?", acceptedAnswer: { "@type": "Answer", text: "A facility under 100,000 square feet can often be captured in a day. As a planning benchmark, approximately 50,000 square feet may be captured in about six hours, depending on layout, access and complexity." } },
      { "@type": "Question", name: "How quickly are floor plans delivered?", acceptedAnswer: { "@type": "Answer", text: "For facilities under 50,000 square feet, typical floor-plan turnaround is seven business days after capture, depending on scope and complexity." } },
      { "@type": "Question", name: "What files can Cinci360 deliver?", acceptedAnswer: { "@type": "Answer", text: "Deliverables can include dimensioned PDF floor plans, DWG files, registered point clouds, Matterport digital twins and Revit models depending on the project scope." } },
      { "@type": "Question", name: "Does Cinci360 travel for floor-plan surveys?", acceptedAnswer: { "@type": "Answer", text: "Yes. Cinci360 supports single facilities and multi-location programs nationwide." } },
      { "@type": "Question", name: "Can LiDAR create as-built floor plans for an existing commercial building?", acceptedAnswer: { "@type": "Answer", text: "Yes. LiDAR reality capture can document existing walls, openings, circulation and dimensions so measured as-built floor plans can be produced for renovation, facility records, test fits and planning." } },
      { "@type": "Question", name: "Who uses measured commercial floor plans?", acceptedAnswer: { "@type": "Answer", text: "Architects, facility managers, owners, retailers, automotive programs, manufacturers and multi-site teams use measured floor plans when reliable existing-condition drawings are missing or outdated." } },
    ],
  },
];

export default function FloorPlansPage() {
  return <main className="service-page landing-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <section className="landing-poster">
      <img src="/images/workflows/floor-plans-hero.webp" alt="Cinci360 LiDAR surveyor creating accurate measured floor plans for commercial facilities"/>
    </section>

    <section className="service-hero landing-hero">
      <div><p className="eyebrow">Measured floor plans · LiDAR · Nationwide</p><h1>Accurate floor plans without sending your design team back to measure.</h1><p className="service-lede">Cinci360 captures existing facilities with LiDAR and turns the field data into dependable, dimensioned floor plans for architects, facility managers, owners and rollout teams.</p><div className="service-actions"><Link className="button button-gold" href="/#contact">Request a floor-plan survey</Link><a href="mailto:support@cinci360.com">support@cinci360.com ↗</a></div></div>
      <aside><span>Fast field coverage</span><strong>Facilities under 100,000 sq ft</strong><strong>can often be captured in a day.</strong><dl><div><dt>Benchmark</dt><dd>~50,000 sq ft · ~6 hours*</dd></div><div><dt>Turnaround</dt><dd>7 business days typical</dd></div><div><dt>Coverage</dt><dd>Nationwide</dd></div></dl><small>*Capture time varies with layout, access and complexity.</small></aside>
    </section>

    <section className="landing-metrics">
      <article><span>Starting at</span><strong>$0.10/SF</strong><p>Volume pricing for large facilities and multi-site programs.</p></article>
      <article><span>Field capture</span><strong>1 day</strong><p>Many facilities under 100,000 sq ft can be documented in one visit.</p></article>
      <article><span>Typical delivery</span><strong>7 business days</strong><p>For floor-plan scopes under 50,000 sq ft.</p></article>
      <article><span>Program reach</span><strong>Nationwide</strong><p>One facility or a coordinated multi-location rollout.</p></article>
    </section>

    <section className="service-proof"><div><p className="eyebrow">Built for existing buildings</p><h2>Field data that becomes useful documentation.</h2></div><article><span>Architects + facility teams</span><h3>Measure once. Design from reliable conditions.</h3><p>LiDAR captures walls, openings, circulation and spatial relationships quickly, reducing the manual measurement burden and giving downstream teams a common reference.</p></article><article><span>Multi-site programs</span><h3>A repeatable survey standard across locations.</h3><p>For retail, automotive, manufacturing and facility portfolios, we can apply a consistent capture and deliverable workflow across multiple sites.</p></article></section>

    <section className="service-deliverables"><p className="eyebrow">Choose the deliverables</p><h2>Floor plans can be the beginning—not the limit.</h2><div><article><b>01</b><h3>Dimensioned floor plans</h3><p>Clear measured plans in PDF and, when requested, editable DWG format for planning, test fits and facility records.</p></article><article><b>02</b><h3>Point clouds + digital twins</h3><p>Registered spatial data and remote visual access let stakeholders revisit conditions without another trip to the facility.</p></article><article><b>03</b><h3>Revit + existing-condition models</h3><p>When the project needs more than 2D drawings, the same capture can support scan-to-BIM and architectural modeling.</p></article></div></section>

    <section className="service-fit"><div><p className="eyebrow">A practical fit</p><h2>Need plans for a facility your team does not have time to measure?</h2></div><p>Send the location, approximate square footage and the files you need. We will define the field scope, capture strategy and delivery schedule before anyone travels.</p><Link className="button button-gold" href="/#contact">Tell us about the facility</Link></section>

    <section className="landing-faq"><p className="eyebrow">Common questions</p><h2>Floor-plan survey FAQs</h2><details><summary>How long does capture take?</summary><p>As a planning benchmark, approximately 50,000 sq ft can often be captured in about six hours. Layout complexity, access restrictions, occupied areas and exterior scope can change field time.</p></details><details><summary>How fast are floor plans delivered?</summary><p>For facilities under 50,000 sq ft, seven business days is a typical turnaround for a standard floor-plan scope.</p></details><details><summary>What do we receive?</summary><p>Depending on scope: PDF plans, DWG files, registered point clouds, a Matterport digital twin, elevations or a Revit model.</p></details><details><summary>Do you travel?</summary><p>Yes. Cinci360 supports projects nationwide and is particularly well suited to multi-site programs that need consistent documentation.</p></details><details><summary>Can LiDAR create as-built floor plans for an existing commercial building?</summary><p>Yes. LiDAR reality capture documents existing walls, openings, circulation and dimensions so measured as-built floor plans can be produced for renovation, test fits, facility records and planning.</p></details><details><summary>Who uses measured commercial floor plans?</summary><p>Architects, facility managers, owners, retailers, automotive programs, manufacturers and multi-site teams use them when dependable existing-condition drawings are missing or outdated.</p></details></section>
  </main>;
}