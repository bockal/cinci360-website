import type { Metadata } from "next";
import Link from "next/link";
import "../3d-laser-scanning-cincinnati/service-page.css";
import "../floor-plans/landing-page.css";

export const metadata: Metadata = {
  title: "Your Building Is Lying to You | Cinci360 Podcast",
  description: "Why existing-condition drawings drift from reality, what that costs during renovation, and how LiDAR reality capture creates a dependable record before design begins.",
  alternates: { canonical: "https://cinci360.com/podcast/your-building-is-lying-to-you" },
  openGraph: {
    type: "article",
    url: "https://cinci360.com/podcast/your-building-is-lying-to-you",
    title: "Your Building Is Lying to You | Cinci360",
    description: "Episode 1: why old drawings fail renovation teams and when reality capture pays for itself.",
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "@id": "https://cinci360.com/podcast/your-building-is-lying-to-you#episode",
    name: "Your Building Is Lying to You",
    episodeNumber: 1,
    description: "Why existing-condition drawings drift from reality, what that costs during renovation, and how reality capture creates a dependable record before design begins.",
    url: "https://cinci360.com/podcast/your-building-is-lying-to-you",
    partOfSeries: { "@type": "PodcastSeries", name: "Inside Existing Conditions", url: "https://cinci360.com/podcast" },
    publisher: { "@id": "https://cinci360.com/#organization" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Inside Existing Conditions", item: "https://cinci360.com/podcast" },
      { "@type": "ListItem", position: 3, name: "Your Building Is Lying to You", item: "https://cinci360.com/podcast/your-building-is-lying-to-you" },
    ],
  },
];

export default function PodcastEpisodeOne() {
  return <main className="service-page landing-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />

    <section className="service-hero landing-hero">
      <div>
        <p className="eyebrow">Inside Existing Conditions · Episode 01</p>
        <h1>Your building is lying to you.</h1>
        <p className="service-lede">Almost every older building has two versions: the building everyone thinks they own, and the building that is actually standing there. In the first Cinci360 podcast episode, we unpack why drawings drift from reality—and what that can cost when a renovation starts from bad information.</p>
        <div className="service-actions">
          <a className="button button-gold" href="#episode">Preview the episode</a>
          <Link href="/#contact">Talk about your building ↗</Link>
        </div>
      </div>
      <aside>
        <span>A Cinci360 field conversation</span>
        <strong>Existing conditions.</strong>
        <strong>Real buildings. Fewer assumptions.</strong>
        <dl>
          <div><dt>01</dt><dd>Why drawings go stale</dd></div>
          <div><dt>02</dt><dd>What reality capture changes</dd></div>
          <div><dt>03</dt><dd>When scanning pays for itself</dd></div>
        </dl>
      </aside>
    </section>

    <section className="landing-metrics" id="episode">
      <article><span>Format</span><strong>25–30 min</strong><p>A practical conversation, not a product webinar.</p></article>
      <article><span>For</span><strong>Owners + AEC</strong><p>Facility teams, architects, contractors, developers and acquisition teams.</p></article>
      <article><span>Core question</span><strong>Can you trust the plans?</strong><p>Know what exists before assumptions become scope and budget.</p></article>
      <article><span>Status</span><strong>Episode 01</strong><p>Audio and video coming soon. This page will become the permanent episode home.</p></article>
    </section>

    <section className="service-proof">
      <div><p className="eyebrow">The premise</p><h2>The drawings are not the building.</h2></div>
      <article><span>Why records drift</span><h3>Buildings change. Documentation often does not.</h3><p>Tenant improvements, field changes, additions, mechanical work and years of renovations can leave owners with drawings that describe an earlier version of the property.</p></article>
      <article><span>Why it matters</span><h3>Bad assumptions become expensive downstream.</h3><p>When design and estimating begin from incomplete existing-condition information, teams can spend time rediscovering the building during the project instead of planning from a shared record.</p></article>
    </section>

    <section className="service-deliverables">
      <p className="eyebrow">Episode roadmap</p>
      <h2>What we will cover.</h2>
      <div>
        <article><b>01</b><h3>The drawings said one thing.</h3><p>How older facilities accumulate undocumented changes and why a site walkthrough rarely captures everything the next team needs.</p></article>
        <article><b>02</b><h3>Capture reality once.</h3><p>How LiDAR, point clouds, Matterport, CAD and Revit turn a physical building into information that multiple stakeholders can revisit.</p></article>
        <article><b>03</b><h3>Know when scanning is worth it.</h3><p>Where reality capture creates leverage—and when a simple field measurement is entirely adequate.</p></article>
      </div>
    </section>

    <section className="service-proof">
      <div><p className="eyebrow">From the field</p><h2>Three kinds of projects. One recurring problem.</h2></div>
      <article><span>Industrial retrofit · Estée Lauder</span><h3>Designing change inside an existing plant</h3><p>Cinci360 captured an existing manufacturing facility so the project team could work from a dependable spatial record while planning a demanding clean-room retrofit.</p><Link href="/projects/estee-lauder-plant">See the case study →</Link></article>
      <article><span>Acquisition + reuse</span><h3>Understand the building before the capital decision</h3><p>For due diligence, the goal is not a prettier model. It is a measurable, navigable record that helps owners, architects and estimators understand what they are actually taking on.</p><Link href="/due-diligence">Explore building due diligence →</Link></article>
    </section>

    <section className="landing-faq">
      <p className="eyebrow">The takeaway</p>
      <h2>One question before your next renovation.</h2>
      <details open><summary>How do we know these drawings represent what is actually there?</summary><p>If the answer is uncertain, reality capture can create a current record before design assumptions become budgets, schedules and change orders.</p></details>
      <details><summary>Does every project need LiDAR?</summary><p>No. Small, straightforward spaces with reliable current drawings may be served perfectly well by conventional field measurement. The value of scanning rises with building size, complexity, uncertainty, travel, stakeholder count and downstream modeling needs.</p></details>
      <details><summary>What can Cinci360 deliver?</summary><p>Depending on the project: Matterport digital twins, measured floor plans, registered point clouds, E57 data, CAD drawings, Revit models and photographic documentation.</p></details>
    </section>

    <section className="service-fit">
      <div><p className="eyebrow">Inside Existing Conditions</p><h2>Real buildings make better stories than technology demos.</h2></div>
      <p>This series starts with the building problem and works backward to the technology. Future episodes will explore acquisition due diligence, scan-to-BIM, dealership renovations, historic buildings, large-facility capture and what a useful digital twin actually looks like.</p>
      <Link className="button button-gold" href="/#contact">Bring us a building</Link>
    </section>
  </main>;
}
