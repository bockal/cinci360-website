import type { Metadata } from "next";
import Link from "next/link";
import AnimatedBrand from "../animated-brand";
import "../3d-laser-scanning-cincinnati/service-page.css";
import "../service-nav.css";

export const metadata: Metadata = {
  title: "Architectural 3D Modeling, Scan-to-BIM, Revit & CAD",
  description: "Nationwide architectural 3D modeling and scan-to-BIM services converting LiDAR point clouds into Revit models, CAD drawings, floor plans and elevations.",
  alternates: { canonical: "https://cinci360.com/scan-to-bim-revit-cad" },
  openGraph: {
    type: "website",
    url: "https://cinci360.com/scan-to-bim-revit-cad",
    title: "Architectural 3D Modeling & Scan-to-BIM | Cinci360",
    description: "Convert measured existing conditions into coordinated Revit models, CAD drawings, floor plans and elevations.",
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://cinci360.com/scan-to-bim-revit-cad#service",
    name: "Architectural 3D Modeling, Scan-to-BIM, Revit and CAD Services",
    serviceType: "Architectural 3D modeling, scan-to-BIM and existing-condition documentation",
    provider: { "@id": "https://cinci360.com/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    availableChannel: { "@type": "ServiceChannel", serviceUrl: "https://cinci360.com/#contact" },
    url: "https://cinci360.com/scan-to-bim-revit-cad",
    description: "Registered LiDAR and point-cloud data converted into Revit models, CAD drawings, floor plans, elevations and as-built documentation.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Scan-to-BIM, Revit and CAD", item: "https://cinci360.com/scan-to-bim-revit-cad" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is scan-to-BIM?", acceptedAnswer: { "@type": "Answer", text: "Scan-to-BIM converts registered laser-scan or point-cloud data from an existing building into a structured digital model, commonly in Revit." } },
      { "@type": "Question", name: "Which files can Cinci360 deliver?", acceptedAnswer: { "@type": "Answer", text: "Depending on scope, Cinci360 can deliver E57 point clouds, Revit models, DWG files, PDF floor plans, elevations and Matterport digital twins." } },
    ],
  },
];

export default function ScanToBim() {
  return <main className="service-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><AnimatedBrand/><nav><Link href="/projects/estee-lauder-plant">Case Study</Link><Link href="/answers">FAQ</Link><Link href="/#contact">Start a project</Link></nav></header>
    <section className="workflow-poster" aria-label="Scan-to-BIM workflow"><picture><source media="(max-width: 560px)" srcSet="/images/workflows/scan-to-bim-workflow-mobile.webp"/><img src="/images/workflows/scan-to-bim-workflow.webp" alt="An architectural point cloud becomes a detailed BIM model, floor plan, elevation and section"/></picture><div><span><b>01</b> Point cloud</span><span><b>02</b> BIM model</span><span><b>03</b> CAD drawings</span><span><b>04</b> Design-ready handoff</span></div></section>
    <section className="service-hero"><div><p className="eyebrow">3D modeling · Scan-to-BIM · Revit · CAD · Nationwide</p><h1>Existing-condition models your design team can build from.</h1><p className="service-lede">Cinci360 converts registered LiDAR scans and point clouds into architectural 3D models, Revit models, CAD drawings, floor plans and elevations for projects nationwide, with field coverage from Miami, New York, Cincinnati and Denver.</p><div className="service-actions"><Link className="button button-gold" href="/#contact">Define your deliverables</Link><a href="mailto:support@cinci360.com">support@cinci360.com ↗</a></div></div><aside><span>Capture-to-document workflow</span><strong>Point cloud in.</strong><strong>Useful files out.</strong><dl><div><dt>Source</dt><dd>LiDAR · E57 · Matterport</dd></div><div><dt>BIM</dt><dd>Revit · As-built model</dd></div><div><dt>CAD</dt><dd>DWG · PDF · Plans</dd></div></dl></aside></section>
    <section className="service-proof"><div><p className="eyebrow">Experience behind Cinci360</p><h2>Measured once. Useful in several workflows.</h2></div><article><span>Dayton Art Institute · Existing conditions</span><h3>Six-hour capture, six-day documentation</h3><p>Our team’s past work captured the museum in six hours and translated the survey into measured Autodesk elevations and documentation in six days.</p><Link href="/#contact">Discuss an architectural model →</Link></article><article><span>Cartridge Brewing · Shared project data</span><h3>Owners, investors and architects</h3><p>A single 3D map supported marketing, insurance documentation and CAD needs—giving three stakeholder groups a common view of the property.</p><Link href="/3d-laser-scanning-cincinnati">Explore LiDAR scanning →</Link></article></section>
    <section className="service-deliverables"><p className="eyebrow">Deliverables</p><h2>Choose the outputs your workflow needs.</h2><div><article><b>01</b><h3>Registered point clouds</h3><p>Clean spatial data in E57 or another agreed format, ready to support measurement, coordination and modeling.</p></article><article><b>02</b><h3>Revit models</h3><p>As-built BIM developed to the agreed scope and level of detail for design, planning and documentation.</p></article><article><b>03</b><h3>CAD + PDF drawings</h3><p>Floor plans, elevations and drawing sets for stakeholders who need dependable 2D documentation.</p></article></div></section>
    <section className="service-proof"><div><p className="eyebrow">Field-to-file workflow</p><h2>Capture. Process. Deliver.</h2></div><article><span>01 · Capture + register</span><h3>Document the current conditions</h3><p>We plan the field visit around access, building complexity and the files your downstream team expects.</p></article><article><span>02 · Model + hand over</span><h3>Translate the data for action</h3><p>We organize the point cloud, create the agreed Revit or CAD outputs and deliver shareable files for remote review and collaboration.</p></article></section>
    <section className="service-fit"><div><p className="eyebrow">Common questions</p><h2>What is scan-to-BIM?</h2></div><p>Scan-to-BIM converts laser-scan or point-cloud data from an existing building into a structured digital model, commonly in Revit. Cinci360 can pair the model with DWG drawings, PDF plans, elevations and a Matterport digital twin.</p><Link className="button button-gold" href="/#contact">Plan the capture and model</Link></section>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>Scan-to-BIM · Revit modeling · CAD documentation</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
