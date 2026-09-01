import type { Metadata } from "next";
import Link from "next/link";
import "./service-page.css";

export const metadata: Metadata = {
  title: "3D Laser Scanning Cincinnati, OH",
  description: "Cincinnati 3D laser scanning and LiDAR reality capture for existing conditions, point clouds, Matterport digital twins, CAD drawings and Revit models.",
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
    description: "LiDAR reality capture for existing-condition documentation, point clouds, Matterport digital twins, CAD drawings and Revit models.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "3D Laser Scanning Cincinnati", item: "https://cinci360.com/3d-laser-scanning-cincinnati" },
    ],
  },
];

export default function CincinnatiLaserScanning() {
  return <main className="service-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><Link href="/#contact">Start a project</Link></header>
    <section className="service-hero"><div><p className="eyebrow">Cincinnati, Ohio · Reality capture</p><h1>3D laser scanning for buildings that need to be understood—not revisited.</h1><p className="service-lede">Cinci360 captures existing conditions in Cincinnati and across the Midwest, then delivers the point clouds, digital twins, CAD drawings and Revit models your project team can actually use.</p><div className="service-actions"><Link className="button button-gold" href="/#contact">Discuss your site</Link><a href="mailto:support@cinci360.com">support@cinci360.com ↗</a></div></div><aside><span>One coordinated field visit</span><strong>Capture once.</strong><strong>Build from better information.</strong><dl><div><dt>Capture</dt><dd>LiDAR · Matterport</dd></div><div><dt>Data</dt><dd>Point cloud · E57</dd></div><div><dt>Models</dt><dd>DWG · PDF · Revit</dd></div></dl></aside></section>
    <section className="service-proof"><div><p className="eyebrow">Large-scale field work</p><h2>Proven inside complex facilities.</h2></div><article><span>ChangeUp · Trek facility</span><h3>Full-facility survey for Trek</h3><p>Cinci360 surveyed the entire Trek facility for ChangeUp, capturing the existing building at the scale required for a major commercial project.</p><Link href="/#contact">Plan a multi-site survey →</Link></article><article><span>BHDP · Toyota plant</span><h3>Industrial survey for Toyota</h3><p>Cinci360 surveyed a Toyota manufacturing plant for BHDP, documenting a complex operating environment for the project team’s downstream work.</p><Link href="/#contact">Discuss an industrial site →</Link></article></section>
    <section className="service-deliverables"><p className="eyebrow">What your team receives</p><h2>From the site to the next decision.</h2><div><article><b>01</b><h3>Existing-condition capture</h3><p>Interior and exterior documentation built around the space, access requirements and intended downstream use.</p></article><article><b>02</b><h3>Shareable spatial data</h3><p>Point clouds, E57 files and Matterport digital twins that let stakeholders revisit the building without another trip.</p></article><article><b>03</b><h3>CAD + Revit outputs</h3><p>Field data translated into dependable drawings and scan-to-BIM models for architects, builders, owners and facilities teams.</p></article></div></section>
    <section className="service-fit"><div><p className="eyebrow">A practical fit</p><h2>Planning a renovation, rollout or facility update?</h2></div><p>Send the building location, approximate square footage and the files your team needs. We’ll help define a capture plan that avoids unnecessary return visits.</p><Link className="button button-gold" href="/#contact">Tell us about the project</Link></section>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>3D laser scanning · LiDAR reality capture · CAD + Revit</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
