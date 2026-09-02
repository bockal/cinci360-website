import type { Metadata } from "next";
import Link from "next/link";
import "../3d-laser-scanning-cincinnati/service-page.css";

export const metadata: Metadata = {
  title: "AI Workflows, Websites & Digital Operations",
  description: "Cinci360 builds AI-assisted workflows, profitable small-business websites, automations and local-search systems, and manages 40 Google Maps listings.",
  alternates: { canonical: "https://cinci360.com/it-services" },
  openGraph: {
    type: "website",
    url: "https://cinci360.com/it-services",
    title: "AI Workflows & Digital Operations | Cinci360",
    description: "AI-assisted workflows, websites, automation, SEO and Google Business Profile management for small businesses.",
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://cinci360.com/it-services#service",
    name: "AI Workflows, Websites and Digital Operations for Small Businesses",
    serviceType: "AI workflow design, website development, business automation, SEO and Google Business Profile management",
    provider: { "@id": "https://cinci360.com/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    availableChannel: { "@type": "ServiceChannel", serviceUrl: "https://cinci360.com/#contact" },
    url: "https://cinci360.com/it-services",
    description: "Practical AI-assisted workflows, websites, automations, local-search systems and digital operations for small businesses and nonprofits.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "IT Services", item: "https://cinci360.com/it-services" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Can Cinci360 build and manage a small-business website?", acceptedAnswer: { "@type": "Answer", text: "Yes. Cinci360 builds streamlined websites for small businesses and nonprofits and can support hosting, content updates, search visibility and ongoing technology needs." } },
      { "@type": "Question", name: "Does Cinci360 manage Google Maps listings?", acceptedAnswer: { "@type": "Answer", text: "Yes. Cinci360 currently manages 40 Google Maps listings through Google Business Profile, including listing information, photos, reviews and local search presence." } },
      { "@type": "Question", name: "Can Cinci360 use AI to improve a small-business workflow?", acceptedAnswer: { "@type": "Answer", text: "Yes. Cinci360 identifies repetitive or disconnected work and designs practical AI-assisted workflows that can reduce administration, improve customer follow-up and support profitable growth." } },
    ],
  },
];

const sites = [
  ["NatrixOne", "https://natrixone.com"],
  ["My Kidzy", "https://mykidzy.com"],
  ["The Performance Project", "https://theperformanceproject.run"],
  ["Walnut Hills Music", "https://walnuthillsmusic.org"],
  ["The Vues at Klinger Lake", "https://vuesmi.com"],
];

export default function ITServices() {
  return <main className="service-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><Link href="/#contact">Start a project</Link></header>
    <section className="workflow-poster" aria-label="AI and digital operations workflow"><img src="/images/workflows/ai-digital-operations-workflow.png" alt="Disconnected small-business tasks flow through an AI-assisted system into a website, local-search presence, automation and profitable growth"/><div><span><b>01</b> Find the friction</span><span><b>02</b> Design the workflow</span><span><b>03</b> Connect the tools</span><span><b>04</b> Measure the return</span></div></section>
    <section className="service-hero"><div><p className="eyebrow">AI · Websites · Digital operations</p><h1>Use AI and better digital tools to make your small business more profitable.</h1><p className="service-lede">Cinci360 builds websites, AI-assisted workflows and practical digital systems that help small businesses attract customers, reduce administrative work and turn everyday processes into measurable results.</p><div className="service-actions"><Link className="button button-gold" href="/#contact">Improve your workflow</Link><a href="mailto:aubrey@cinci360.com">aubrey@cinci360.com ↗</a></div></div><aside><span>Technology tied to an outcome</span><strong>Less repetitive work.</strong><strong>More profitable action.</strong><dl><div><dt>AI</dt><dd>Workflows · Content · Analysis</dd></div><div><dt>Web</dt><dd>Sites · SEO · Transactions</dd></div><div><dt>Growth</dt><dd>Maps · Follow-up · Reporting</dd></div></dl></aside></section>
    <section className="service-deliverables"><p className="eyebrow">Three ways we help</p><h2>Build the digital operation your business actually needs.</h2><div><article><b>01</b><h3>AI + workflow automation</h3><p>We find repetitive, disconnected work and design practical AI-assisted processes for intake, research, content, follow-up, pricing and decision support.</p></article><article><b>02</b><h3>Websites + online transactions</h3><p>Modern websites built around a useful next action—lead generation, registrations, bookings, donations, merchandise or customer self-service.</p></article><article><b>03</b><h3>Local search + visibility</h3><p>Google Business Profile management, technical SEO, Search Console, schema and focused landing pages that help the right customers find you.</p></article></div></section>
    <section className="service-proof"><div><p className="eyebrow">From friction to return</p><h2>Start with the business problem—not the software.</h2></div><article><span>Connect the work</span><h3>Forms, email, calendars and payments</h3><p>We connect the everyday tools around a clear workflow so inquiries move forward, information is reused and fewer tasks depend on manual follow-up.</p></article><article><span>Make it measurable</span><h3>Analytics, pricing and reporting</h3><p>We organize operational data into useful reporting, pricing models and decision support—so technology produces a visible business result.</p></article></section>
    <section className="service-proof"><div><p className="eyebrow">Google expertise</p><h2>Help customers find—and trust—you.</h2></div><article><span>Google Business Profile</span><h3>40 listings under management</h3><p>We help organizations keep their Google Maps presence accurate, active and useful, from core business information and photos to reviews and local-search fundamentals.</p></article><article><span>Community education</span><h3>Several Grow with Google events</h3><p>Our experience includes hosting several <a href="https://community.grow.google/s/create-workshop" target="_blank" rel="noreferrer">Grow with Google Partner workshops</a> that helped business owners put practical digital tools to work. Cinci360 is an independent service provider and is not affiliated with or endorsed by Google.</p></article></section>
    <section className="service-deliverables"><p className="eyebrow">Selected website work</p><h2>Built for real organizations.</h2><div>{sites.map(([name,url], index)=><article key={url}><b>{String(index + 1).padStart(2,"0")}</b><h3>{name}</h3><p>A focused, responsive web presence designed around the organization’s audience and next action.</p><a href={url} target="_blank" rel="noreferrer">Visit {name} ↗</a></article>)}</div></section>
    <section className="service-fit"><div><p className="eyebrow">A practical fit</p><h2>Where is your business losing time or opportunity?</h2></div><p>Show us the repetitive task, disconnected customer journey or underperforming web presence. We’ll recommend the smallest useful system that can improve it.</p><Link className="button button-gold" href="/#contact">Map the opportunity</Link></section>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>AI workflows · Websites · Digital operations</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
