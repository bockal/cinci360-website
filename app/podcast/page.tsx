import type { Metadata } from "next";
import Link from "next/link";
import "./podcast.css";

export const metadata: Metadata = {
  title: "Cinci360 Podcast",
  description: "Field notes from Cinci360 on reality capture, LiDAR surveying, Matterport, floor plans, scan-to-BIM and the lessons learned inside real buildings.",
  alternates: { canonical: "https://cinci360.com/podcast" },
  openGraph: {
    type: "website",
    url: "https://cinci360.com/podcast",
    title: "Cinci360 Podcast | Tales from the Field",
    description: "Practical field-expertise episodes from Cinci360, starting with what buildings reveal when you document existing conditions before design or renovation.",
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "@id": "https://cinci360.com/podcast#series",
    name: "Tales from the Field",
    url: "https://cinci360.com/podcast",
    description: "A Cinci360 field-expertise podcast about reality capture, LiDAR surveying, Matterport digital twins, floor plans, scan-to-BIM and lessons learned inside real buildings.",
    publisher: { "@id": "https://cinci360.com/#organization" },
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Podcast", item: "https://cinci360.com/podcast" },
    ],
  },
];

export default function PodcastPage() {
  return <main className="podcast-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <section className="podcast-hero">
      <div>
        <p className="eyebrow">Tales from the Field</p>
        <h1>Real buildings. Real questions. Field-tested answers.</h1>
        <p>Cinci360 uses the podcast to answer the questions that come up during building surveys, due-diligence walks, dealership programs, facility retrofits and scan-to-BIM projects.</p>
      </div>
      <aside className="podcast-panel">
        <span>First episode</span>
        <strong>Your Building Is Lying to You</strong>
        <ul>
          <li>Why existing drawings age out.</li>
          <li>What owners miss during walkthroughs.</li>
          <li>How reality capture reduces retrofit guesswork.</li>
        </ul>
      </aside>
    </section>
    <section className="podcast-list" aria-label="Podcast episodes">
      <article className="podcast-card">
        <div className="podcast-cover" aria-hidden="true"><div><strong>Your Building Is Lying to You</strong><span>Cinci360</span></div></div>
        <div>
          <span>Episode 001</span>
          <h2>Your Building Is Lying to You</h2>
          <p>The first field-expertise episode frames a simple Cinci360 belief: before you buy, renovate or model an existing building, document what is actually there.</p>
          <div className="podcast-meta"><b>Due diligence</b><b>LiDAR</b><b>Matterport</b><b>Scan-to-BIM</b></div>
        </div>
        <Link href="/podcast/your-building-is-lying-to-you">Open episode</Link>
      </article>
    </section>
  </main>;
}
