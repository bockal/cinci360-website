import type { Metadata } from "next";
import Link from "next/link";
import "../../3d-laser-scanning-cincinnati/service-page.css";
import "./estee.css";

export const metadata: Metadata = {
  title: "Estée Lauder Plant Scan-to-Revit Case Study",
  description: "How Cinci360 captured an operating Estée Lauder plant for BHDP to support a retrofit to Asian clean-room manufacturing standards.",
  alternates: { canonical: "https://cinci360.com/projects/estee-lauder-plant" },
  openGraph: { type: "article", url: "https://cinci360.com/projects/estee-lauder-plant", title: "Estée Lauder Plant Scan-to-Revit Case Study | Cinci360", description: "A facility-wide spatial record for planning a complex clean-room manufacturing retrofit." },
};

const schema = [
  { "@context": "https://schema.org", "@type": "Article", "@id": "https://cinci360.com/projects/estee-lauder-plant#case-study", headline: "Retrofitting an Estée Lauder plant for clean-room manufacturing", description: "Cinci360 captured an Estée Lauder plant on Long Island for BHDP, creating a reliable existing-condition record for a complex manufacturing retrofit.", mainEntityOfPage: "https://cinci360.com/projects/estee-lauder-plant", author: { "@id": "https://cinci360.com/#organization" }, publisher: { "@id": "https://cinci360.com/#organization" }, about: ["3D laser scanning", "reality capture", "existing conditions", "scan-to-Revit", "clean-room manufacturing"], contentLocation: { "@type": "Place", name: "Estée Lauder plant, Long Island, New York" } },
  { "@context": "https://schema.org", "@type": "3DModel", "@id": "https://cinci360.com/projects/estee-lauder-plant#digital-twin", name: "Estée Lauder plant digital twin", description: "Interactive Matterport digital twin from Cinci360's full-facility survey of an Estée Lauder plant for BHDP.", encoding: { "@type": "MediaObject", embedUrl: "https://my.matterport.com/show/?m=QtjFgkR1NsT", contentUrl: "https://my.matterport.com/show/?m=QtjFgkR1NsT" } },
  { "@context": "https://schema.org", "@type": "ImageObject", "@id": "https://cinci360.com/projects/estee-lauder-plant#facility-plan", name: "Annotated Estée Lauder plant facility plan", description: "A BHDP first-floor plan showing clean-room classifications, circulation and manufacturing zones across the plant documented by Cinci360.", contentUrl: "https://cinci360.com/images/case-studies/estee-lauder-facility-plan-v2.webp", width: 1769, height: 1189 },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" }, { "@type": "ListItem", position: 2, name: "Projects", item: "https://cinci360.com/#projects" }, { "@type": "ListItem", position: 3, name: "Estée Lauder plant", item: "https://cinci360.com/projects/estee-lauder-plant" }] },
];

export default function EsteeLauderCaseStudy() {
  return <main className="service-page case-study-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="service-nav print-hide"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><nav><Link href="/answers">Answers</Link><Link href="/#contact">Start a project</Link></nav></header>
    <article>
      <section className="case-poster" aria-label="Estée Lauder plant scan-to-Revit case study">
        <div className="poster-visual" aria-hidden="true"><span className="scan-layer"/><span className="plan-layer"/><span className="revit-layer"/></div>
        <div className="poster-copy"><p>Case study · Industrial reality capture</p><h1>From operating plant<br/>to retrofit-ready model.</h1><span>Estée Lauder · Long Island, New York</span></div>
        <div className="poster-steps"><span><b>01</b> Laser scan</span><span><b>02</b> Existing conditions</span><span><b>03</b> Revit handoff</span></div>
      </section>
      <section className="case-opening page-section">
        <div className="case-intro"><p className="eyebrow">The assignment</p><h2>A precise foundation for a high-stakes manufacturing retrofit.</h2><p className="lead">BHDP needed to understand an entire operating Estée Lauder plant before redesigning it to meet Asian clean-room manufacturing standards. Cinci360 created the spatial record the project team could use after leaving the site.</p></div>
        <aside className="at-a-glance"><p>At a glance</p><dl><div><dt>Client team</dt><dd>BHDP</dd></div><div><dt>Facility</dt><dd>Estée Lauder plant</dd></div><div><dt>Location</dt><dd>Long Island, New York</dd></div><div><dt>Scope</dt><dd>Complete facility</dd></div><div><dt>Services</dt><dd>Reality capture · Scan-to-Revit</dd></div></dl></aside>
      </section>
      <section className="case-challenge page-section">
        <div><p className="eyebrow">The challenge</p><h2>The existing building had to support a more exacting future.</h2></div>
        <div className="story-copy"><p>The retrofit was not simply a space-planning exercise. Clean-room manufacturing depends on controlled movement, separations and coordinated building systems. The team needed a dependable view of what already existed before it could decide what had to change.</p><p>Inside a large, active plant, isolated measurements would leave too much room for gaps. Every missed condition could reappear later as redesign, another site visit or a coordination conflict.</p><blockquote>When the standard changes, the value of knowing the existing building precisely goes up.</blockquote></div>
      </section>
      <figure className="facility-plan page-section"><div className="plan-frame"><img src="/images/case-studies/estee-lauder-facility-plan-v2.webp" width="1769" height="1189" alt="BHDP first-floor plan of the Estée Lauder plant showing manufacturing zones, clean classifications, circulation paths and retrofit notes"/></div><figcaption><span>The planning problem, on one sheet</span><p>The facility plan shows how manufacturing areas, laboratories, storage, personnel routes and clean classifications interact across the building. That complexity is why a complete existing-condition record mattered.</p></figcaption></figure>
      <section className="case-approach page-section">
        <div className="section-heading"><p className="eyebrow">The approach</p><h2>Capture once. Revisit every condition.</h2></div>
        <div className="approach-grid"><article><span>01</span><h3>Plan the coverage</h3><p>The field plan treated the plant as one connected environment, accounting for production spaces, circulation and the transitions between controlled zones.</p></article><article><span>02</span><h3>Capture the facility</h3><p>Cinci360 scanned the complete plant, creating a navigable spatial record with the visual context and measurements needed for remote review.</p></article><article><span>03</span><h3>Translate for design</h3><p>The captured conditions gave the design team a reliable basis for Revit documentation and retrofit coordination—without relying on memory or disconnected field notes.</p></article></div>
      </section>
      <section className="digital-twin page-section">
        <div><p className="eyebrow">The captured facility</p><h2>Walk the plant after the site visit.</h2><p>The digital twin lets stakeholders return to the documented environment, inspect context and align conversations around the same view of the building.</p><a className="viewer-link" href="https://my.matterport.com/show/?m=QtjFgkR1NsT" target="_blank" rel="noreferrer">Open the digital twin full screen ↗</a></div>
        <div className="matterport-frame print-hide"><iframe src="https://my.matterport.com/show/?m=QtjFgkR1NsT" title="Estée Lauder plant digital twin captured by Cinci360" loading="lazy" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" allowFullScreen/></div>
        <div className="print-model-link print-only"><strong>Interactive project record</strong><p>Explore the Estée Lauder plant digital twin at my.matterport.com/show/?m=QtjFgkR1NsT</p></div>
      </section>
      <section className="case-resolution page-section">
        <div><p className="eyebrow">The resolution</p><h2>One shared record for the decisions that followed.</h2></div>
        <div className="result-list"><article><h3>Less uncertainty</h3><p>The team could ground retrofit decisions in captured conditions instead of incomplete drawings or assumptions.</p></article><article><h3>Remote access</h3><p>Stakeholders could revisit the plant without treating every open question as another field visit.</p></article><article><h3>Design-ready context</h3><p>The reality-capture record supported a coordinated scan-to-Revit workflow for a demanding clean-room program.</p></article></div>
      </section>
      <section className="case-takeaway page-section"><p className="eyebrow">What this proves</p><p className="takeaway">Large-facility scanning is most valuable when the deliverable is designed around the decision ahead—not merely the building behind.</p><Link className="button button-gold print-hide" href="/#contact">Discuss a facility survey</Link></section>
    </article>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>Reality capture · Existing conditions · Scan-to-Revit</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
