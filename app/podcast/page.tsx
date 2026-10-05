import type { Metadata } from "next";
import Link from "next/link";
import "../3d-laser-scanning-cincinnati/service-page.css";
import "../floor-plans/landing-page.css";

export const metadata: Metadata = {
  title: "Inside Existing Conditions | Cinci360 Podcast",
  description: "Field stories about existing buildings, reality capture, LiDAR, scan-to-BIM, due diligence and the decisions that depend on knowing what is actually there.",
  alternates: { canonical: "https://cinci360.com/podcast" },
};

export default function PodcastPage() {
  return <main className="service-page landing-page">
    <section className="service-hero landing-hero">
      <div><p className="eyebrow">The Cinci360 podcast</p><h1>Inside Existing Conditions.</h1><p className="service-lede">Real buildings, field lessons and practical conversations about the gap between the plans on file and the space that is actually standing there.</p></div>
      <aside><span>Reality capture without the sales deck</span><strong>Measure what exists.</strong><strong>Understand what changes.</strong></aside>
    </section>
    <section className="service-proof">
      <div><p className="eyebrow">Episode 01</p><h2>Your building is lying to you.</h2></div>
      <article><span>Coming soon</span><h3>Why existing-condition drawings are usually wrong—and what that costs when you renovate.</h3><p>We start with the problem rather than the scanner: how buildings drift away from their documentation and when reality capture becomes worth the investment.</p><Link href="/podcast/your-building-is-lying-to-you">Preview episode 01 →</Link></article>
    </section>
  </main>;
}
