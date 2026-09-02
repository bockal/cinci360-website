import type { Metadata } from "next";
import Link from "next/link";
import "../3d-laser-scanning-cincinnati/service-page.css";

export const metadata: Metadata = {
  title: "3D Modeling Services for Existing Buildings",
  description: "Nationwide architectural 3D modeling for existing buildings from LiDAR and point-cloud data, including as-built Revit models, CAD drawings and digital twins.",
  alternates: { canonical: "https://cinci360.com/3d-modeling-services" },
  openGraph: {
    type: "website",
    url: "https://cinci360.com/3d-modeling-services",
    title: "3D Modeling Services for Existing Buildings | Cinci360",
    description: "As-built 3D models, Revit files and CAD drawings created from accurate field capture for architecture, construction and facilities teams.",
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://cinci360.com/3d-modeling-services#service",
    name: "3D Modeling Services for Existing Buildings",
    serviceType: "Architectural as-built 3D modeling from LiDAR and reality-capture data",
    provider: { "@id": "https://cinci360.com/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    availableChannel: { "@type": "ServiceChannel", serviceUrl: "https://cinci360.com/#contact" },
    url: "https://cinci360.com/3d-modeling-services",
    description: "Architectural 3D modeling, as-built Revit models, CAD drawings and digital twins derived from field-verified reality-capture data.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "3D Modeling Services", item: "https://cinci360.com/3d-modeling-services" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What kind of 3D modeling does Cinci360 provide?", acceptedAnswer: { "@type": "Answer", text: "Cinci360 creates architectural and as-built 3D models of existing buildings from LiDAR, point-cloud and Matterport reality-capture data." } },
      { "@type": "Question", name: "Can Cinci360 deliver Revit and CAD files?", acceptedAnswer: { "@type": "Answer", text: "Yes. Project deliverables can include Revit models, DWG files, PDFs, floor plans, elevations and registered point-cloud files." } },
    ],
  },
];

export default function ModelingServices() {
  return <main className="service-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><Link href="/#contact">Start a project</Link></header>
    <section className="service-hero"><div><p className="eyebrow">Architectural modeling · Nationwide</p><h1>3D modeling grounded in the building that actually exists.</h1><p className="service-lede">Cinci360 turns LiDAR scans, point clouds and reality-capture data into architectural 3D models for projects nationwide, supported by field technicians based in Miami, New York, Cincinnati and Denver.</p><div className="service-actions"><Link className="button button-gold" href="/#contact">Discuss your model</Link><a href="mailto:support@cinci360.com">support@cinci360.com ↗</a></div></div><aside><span>Field data to usable model</span><strong>Measured reality.</strong><strong>Clear digital output.</strong><dl><div><dt>Inputs</dt><dd>LiDAR · E57 · Point cloud</dd></div><div><dt>Models</dt><dd>Revit · BIM · Digital twin</dd></div><div><dt>Drawings</dt><dd>DWG · PDF · Elevations</dd></div></dl></aside></section>
    <section className="service-proof"><div><p className="eyebrow">Experience behind Cinci360</p><h2>One model can answer several teams.</h2></div><article><span>Dayton Art Institute · Existing conditions</span><h3>From field capture to Autodesk</h3><p>Our team’s past work captured the museum in six hours, then produced elevations and measured Autodesk documentation in six days.</p><Link href="/3d-laser-scanning-cincinnati">See our capture process →</Link></article><article><span>Cartridge Brewing · Multi-use data</span><h3>One capture, three stakeholder needs</h3><p>The same 3D map supported the owners’ marketing, investors’ insurance documentation and the architects’ CAD workflow.</p><Link href="/scan-to-bim-revit-cad">Explore model deliverables →</Link></article></section>
    <section className="service-deliverables"><p className="eyebrow">Architectural 3D modeling services</p><h2>The right level of detail for the next team.</h2><div><article><b>01</b><h3>As-built 3D models</h3><p>Models of existing buildings developed from measured field conditions rather than assumptions or outdated plans.</p></article><article><b>02</b><h3>Revit + scan-to-BIM</h3><p>Revit models aligned to registered point clouds for architects, engineers, contractors and owners.</p></article><article><b>03</b><h3>CAD documentation</h3><p>Floor plans, elevations and other 2D drawing outputs delivered in practical DWG and PDF formats.</p></article></div></section>
    <section className="service-fit"><div><p className="eyebrow">Useful beyond the model</p><h2>A shared digital foundation.</h2></div><p>Project teams can use the captured environment to take measurements, add markups, extract coordinates, conduct remote walkthroughs and collaborate without sending every stakeholder back to the property.</p><Link className="button button-gold" href="/#contact">Scope a modeling project</Link></section>
    <section className="service-fit"><div><p className="eyebrow">Common questions</p><h2>Is this product modeling or architectural modeling?</h2></div><p>Cinci360 specializes in buildings and existing conditions. We create as-built architectural 3D models—not character, product or entertainment models—and can deliver Revit, DWG, PDF and point-cloud files.</p><Link className="button button-gold" href="/scan-to-bim-revit-cad">Compare Revit and CAD deliverables</Link></section>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>Architectural 3D modeling · As-built Revit · CAD drawings</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
