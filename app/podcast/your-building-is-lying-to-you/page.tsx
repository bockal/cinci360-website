import type { Metadata } from "next";
import Link from "next/link";
import "../podcast.css";

const episodeUrl = "https://cinci360.com/podcast/your-building-is-lying-to-you";
const publishDate = "2026-10-05";

export const metadata: Metadata = {
  title: "Podcast: Your Building Is Lying to You",
  description: "Cinci360's first field-expertise podcast episode explains why existing buildings often mislead owners, buyers and design teams until reality capture documents what is really there.",
  alternates: { canonical: episodeUrl },
  openGraph: {
    type: "article",
    url: episodeUrl,
    title: "Your Building Is Lying to You | Cinci360 Podcast",
    description: "A field-expertise episode about due diligence, Matterport, LiDAR surveying and why old drawings and quick walkthroughs can hide costly building assumptions.",
    publishedTime: publishDate,
    authors: ["Cinci360"],
  },
  twitter: {
    card: "summary",
    title: "Your Building Is Lying to You | Cinci360 Podcast",
    description: "Why existing buildings mislead project teams until field reality is captured.",
  },
};

const youtubeTitle = "Your Building Is Lying to You | Cinci360 Tales from the Field Ep. 001";

const youtubeDescription = `Before you buy, renovate, remodel or model an existing building, remember this: the building is probably telling a story that old drawings, quick walkthroughs and inherited assumptions do not fully capture.

In the first Cinci360 Tales from the Field episode, we explain why existing-condition documentation matters for due diligence, facility retrofits, Matterport digital twins, LiDAR surveying, floor plans and scan-to-BIM work.

Topics covered:
- Why legacy drawings drift from reality
- What a walkthrough can miss
- How Matterport and LiDAR help owners, architects and facility teams see the same building
- Why due-diligence scans can reduce scope risk before renovation
- How Cinci360 approaches field capture and practical deliverables

Cinci360 provides national reality capture, LiDAR surveying, Matterport digital twins, measured floor plans, CAD, Revit and scan-to-BIM services from Cincinnati, Ohio.

Plan a project: https://cinci360.com/#contact
Episode page: ${episodeUrl}
Due diligence services: https://cinci360.com/due-diligence
Scan-to-BIM services: https://cinci360.com/scan-to-bim-revit-cad

#RealityCapture #LiDAR #Matterport #ScanToBIM #DigitalTwin #CommercialRealEstate #DueDiligence`;

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "@id": `${episodeUrl}#episode`,
    name: "Your Building Is Lying to You",
    episodeNumber: 1,
    url: episodeUrl,
    datePublished: publishDate,
    inLanguage: "en-US",
    description: "Cinci360's first field-expertise episode explains why existing buildings often mislead owners, buyers and design teams until reality capture documents what is really there.",
    partOfSeries: { "@id": "https://cinci360.com/podcast#series" },
    publisher: { "@id": "https://cinci360.com/#organization" },
    author: { "@id": "https://cinci360.com/#organization" },
    about: [
      "Reality capture",
      "LiDAR surveying",
      "Matterport digital twins",
      "Building due diligence",
      "Existing-condition documentation",
      "Scan-to-BIM",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${episodeUrl}#article`,
    headline: "Your Building Is Lying to You",
    datePublished: publishDate,
    dateModified: publishDate,
    author: { "@id": "https://cinci360.com/#organization" },
    publisher: { "@id": "https://cinci360.com/#organization" },
    mainEntityOfPage: episodeUrl,
    description: "Field notes for Cinci360's first podcast episode about existing-building due diligence and reality capture.",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Podcast", item: "https://cinci360.com/podcast" },
      { "@type": "ListItem", position: 3, name: "Your Building Is Lying to You", item: episodeUrl },
    ],
  },
];

export default function PodcastEpisodePage() {
  return <main className="podcast-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <section className="podcast-hero">
      <div>
        <p className="eyebrow">Tales from the Field · Episode 001</p>
        <h1>Your Building Is Lying to You.</h1>
        <p>Old drawings, quick walkthroughs and inherited assumptions can make an existing building feel understood long before it is actually documented. This episode explains why Cinci360 starts with field reality.</p>
        <div className="service-actions">
          <Link className="button button-gold" href="/#contact">Plan a survey</Link>
          <Link href="/due-diligence">Explore due diligence</Link>
        </div>
      </div>
      <aside className="podcast-panel">
        <span>Episode positioning</span>
        <strong>Answering questions from the field, not reading spec sheets.</strong>
        <ul>
          <li>For owners, buyers, architects and facilities teams.</li>
          <li>Built around real Cinci360 lessons from surveys and digital twins.</li>
          <li>Ready for YouTube now; podcast RSS can follow when an audio file exists.</li>
        </ul>
      </aside>
    </section>

    <section className="podcast-content">
      <article className="podcast-article">
        <div className="podcast-audio-placeholder">
          <strong>Audio status</strong>
          <p>No audio-file URL is published yet, so this page intentionally does not include an audio embed, enclosure or AudioObject schema. Add those only after the final MP3 or podcast-host URL exists.</p>
        </div>
        <h2>Episode premise</h2>
        <p>A building can look simple during a walkthrough and still contain years of undocumented change. Walls move. Tenants improvise. Mechanical rooms evolve. Renovations happen without the drawings catching up. By the time a buyer, architect or facilities team starts planning from old information, the building is already quietly shaping the budget.</p>
        <p>Cinci360&apos;s first episode turns that field lesson into a practical story: before you scope the retrofit, price the acquisition or start the model, capture the reality of the place.</p>
        <h3>Why this matters</h3>
        <ul>
          <li>Existing drawings can be incomplete, outdated or missing entirely.</li>
          <li>Photos help, but they do not create a measured record everyone can revisit.</li>
          <li>Matterport digital twins help distributed teams walk the site remotely.</li>
          <li>LiDAR and point-cloud data support measured floor plans, CAD and Revit deliverables.</li>
          <li>Reality capture gives the next team a shared source of truth before decisions harden into cost.</li>
        </ul>
        <h3>Field examples to reference</h3>
        <p>The episode should connect the concept to Cinci360 work without overclaiming: Estée Lauder&apos;s Long Island plant retrofit for BHDP, Bell Event Centre&apos;s public-facing digital twin, dealership documentation programs, and due-diligence captures where the first value is simply knowing what exists.</p>
        <h3>Suggested close</h3>
        <p>If your building is about to be bought, renovated, repurposed or modeled, do not ask the team to guess from memory and old PDFs. Send Cinci360 the address, approximate square footage, existing drawings if you have them, and the decision you need to make. We will recommend the capture method and deliverables around that decision.</p>
      </article>
      <aside className="podcast-sidebar">
        <Link href="/projects/estee-lauder-plant">Estée Lauder case study</Link>
        <Link href="/scan-to-bim-revit-cad">Scan-to-BIM services</Link>
        <Link href="/floor-plans">Measured floor plans</Link>
        <div className="podcast-note"><p><strong>Production note:</strong> YouTube advanced features are enabled, so this episode can use the full description, outbound links and chapter-style topic list below.</p></div>
      </aside>
    </section>

    <section className="podcast-outline">
      <span>Recording outline</span>
      <h2>A clean run of show for episode one.</h2>
      <ol>
        <li><strong>Hook:</strong> &quot;Your building is lying to you&quot; means the record is usually less current than the building.</li>
        <li><strong>The field problem:</strong> What walkthroughs, photos and inherited drawings miss.</li>
        <li><strong>The Cinci360 answer:</strong> Match Matterport, LiDAR, floor plans, CAD or Revit to the decision being made.</li>
        <li><strong>Proof points:</strong> Dealership programs, Estée Lauder, Bell Event Centre and due-diligence surveys.</li>
        <li><strong>Buyer guidance:</strong> What to send before asking for a quote.</li>
        <li><strong>Close:</strong> Capture first, scope with better information, keep the record for the next team.</li>
      </ol>
    </section>

    <section className="podcast-assets">
      <span>YouTube assets</span>
      <h2>Ready-to-use title and description.</h2>
      <div className="podcast-asset-grid">
        <article>
          <h3>Title</h3>
          <pre>{youtubeTitle}</pre>
        </article>
        <article>
          <h3>Description</h3>
          <pre>{youtubeDescription}</pre>
        </article>
      </div>
    </section>
  </main>;
}
