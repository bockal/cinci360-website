import type { Metadata } from "next";
import Link from "next/link";
import "./service-page.css";
import "../service-nav.css";

export const metadata: Metadata = {
  title: "3D Laser Scanning Cincinnati, OH",
  description: "Cincinnati 3D laser scanning, LiDAR surveys and 3D site surveys for existing conditions, point clouds, Matterport, CAD drawings and Revit models.",
  alternates: { canonical: "https://cinci360.com/3d-laser-scanning-cincinnati" },
  openGraph: {
    type: "website",
    url: "https://cinci360.com/3d-laser-scanning-cincinnati",
    title: "3D Laser Scanning Cincinnati, OH | Cinci360",
    description: "Cincinnati 3D laser scanning and LiDAR reality capture for existing conditions, point clouds, Matterport digital twins, CAD drawings and Revit models.",
  },
};

const serviceSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://cinci360.com/3d-laser-scanning-cincinnati#service",
    name: "3D Laser Scanning in Cincinnati",
    serviceType: "3D laser scanning and LiDAR reality capture",
    provider: { "@id": "https://cinci360.com/#organization" },
    areaServed: { "@type": "City", name: "Cincinnati" },
    availableChannel: { "@type": "ServiceChannel", serviceUrl: "https://cinci360.com/#contact" },
    url: "https://cinci360.com/3d-laser-scanning-cincinnati",
    description: "LiDAR and 3D site survey services for existing-condition documentation, point clouds, Matterport digital twins, CAD drawings and Revit models.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "3D Laser Scanning Cincinnati", item: "https://cinci360.com/3d-laser-scanning-cincinnati" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What does a 3D laser scanning survey deliver?", acceptedAnswer: { "@type": "Answer", text: "Deliverables can include registered point clouds, E57 files, Matterport digital twins, 2D CAD drawings, PDFs and Revit models, depending on the project team's needs." } },
      { "@type": "Question", name: "Where does Cinci360 provide LiDAR surveys?", acceptedAnswer: { "@type": "Answer", text: "Cinci360 is based in Cincinnati and serves projects across Ohio, the Midwest and nationwide." } },
    ],
  },
];

export default function CincinnatiLaserScanning() {
  return <main className="service-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><nav><Link href="/projects/estee-lauder-plant">Case Study</Link><Link href="/answers">FAQ</Link><Link href="/#contact">Start a project</Link></nav></header>
    <section className="workflow-poster" aria-label="3D laser scanning workflow"><picture><source media="(max-width: 560px)" srcSet="/images/workflows/laser-scanning-workflow-mobile.webp"/><img src="/images/workflows/laser-scanning-workflow.webp" alt="A field technician scans an existing building, producing a point cloud and a precise digital building model"/></picture><div><span><b>01</b> Plan the site</span><span><b>02</b> Capture reality</span><span><b>03</b> Register the data</span><span><b>04</b> Deliver usable files</span></div></section>
    <section className="service-hero"><div><p className="eyebrow">Cincinnati, Ohio · Reality capture</p><h1>3D laser scanning for buildings that need to be understood—not revisited.</h1><p className="service-lede">Cinci360 performs LiDAR surveys and 3D site surveys in Cincinnati, across the Midwest and nationwide, then delivers the point clouds, digital twins, CAD drawings and Revit models your project team can actually use.</p><div className="service-actions"><Link className="button button-gold" href="/#contact">Discuss your site</Link><a href="mailto:support@cinci360.com">support@cinci360.com ↗</a></div></div><aside><span>One coordinated field visit</span><strong>Capture once.</strong><strong>Build from better information.</strong><dl><div><dt>Capture</dt><dd>LiDAR · Matterport</dd></div><div><dt>Data</dt><dd>Point cloud · E57</dd></div><div><dt>Models</dt><dd>DWG · PDF · Revit</dd></div></dl></aside></section>
    <section className="service-proof"><div><p className="eyebrow">Large-scale field work</p><h2>Proven inside complex facilities.</h2></div><article><span>BHDP · Estée Lauder plant</span><h3>Existing conditions for a clean-room retrofit</h3><p>Cinci360 scanned an entire Estée Lauder plant on Long Island, giving BHDP a reliable spatial record for a retrofit to Asian clean-room manufacturing standards.</p><Link href="/projects/estee-lauder-plant">Read the facility case study →</Link></article><article><span>Complete-facility capture</span><h3>One record for every stakeholder</h3><p>The digital twin and scan-to-Revit workflow let the project team revisit conditions, coordinate remotely and design from a shared understanding of the plant.</p><Link href="/projects/estee-lauder-plant">Explore the project record →</Link></article></section>
    <section className="service-deliverables"><p className="eyebrow">What your team receives</p><h2>From the site to the next decision.</h2><div><article><b>01</b><h3>Existing-condition capture</h3><p>Interior and exterior documentation built around the space, access requirements and intended downstream use.</p></article><article><b>02</b><h3>Shareable spatial data</h3><p>Point clouds, E57 files and Matterport digital twins that let stakeholders revisit the building without another trip.</p></article><article><b>03</b><h3>CAD + Revit outputs</h3><p>Field data translated into dependable drawings and scan-to-BIM models for architects, builders, owners and facilities teams.</p></article></div></section>
    <section className="service-proof"><div><p className="eyebrow">A simpler field-to-file process</p><h2>Capture. Process. Deliver.</h2></div><article><span>Capture + process</span><h3>A coordinated 3D site survey</h3><p>We document the agreed interior and exterior conditions, register the spatial data and organize it around your downstream use.</p></article><article><span>Deliver + share</span><h3>One source for every stakeholder</h3><p>Architects, owners and facilities teams can measure distances, add markups, review coordinates and walk the property remotely from shareable project data.</p></article></section>
    <section className="service-fit"><div><p className="eyebrow">Common questions</p><h2>What comes from a LiDAR survey?</h2></div><p>Deliverables can include registered point clouds, E57 files, Matterport digital twins, 2D CAD drawings, PDFs and Revit models. Cinci360 is based in Cincinnati and supports projects across Ohio, the Midwest and nationwide.</p><Link className="button button-gold" href="/answers">Explore the answer hub</Link></section>
    <section className="service-fit"><div><p className="eyebrow">A practical fit</p><h2>Planning a renovation, rollout or facility update?</h2></div><p>Send the building location, approximate square footage and the files your team needs. We’ll help define a capture plan that avoids unnecessary return visits.</p><Link className="button button-gold" href="/#contact">Tell us about the project</Link></section>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>3D laser scanning · LiDAR reality capture · CAD + Revit</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
