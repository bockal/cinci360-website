import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px", minHeight: "70vh" }}>
      <Link href="/" className="brand" aria-label="Cinci360 home"><span>Cinci</span><strong>360</strong></Link>
      <p className="eyebrow" style={{ marginTop: 56 }}>404 � Page not found</p>
      <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1.15 }}>Looking for Cinci360?</h1>
      <p style={{ fontSize: "1.125rem", lineHeight: 1.7, margin: "24px 0" }}>This page may have moved or been retired. Explore our current services, or contact us if you need help finding an earlier project or tour.</p>
      <nav aria-label="Find a current page" style={{ display: "grid", gap: 20, fontSize: "1.125rem" }}>
        <Link href="/3d-laser-scanning-cincinnati">3D laser scanning and digital twins</Link>
        <Link href="/scan-to-bim-revit-cad">Scan-to-BIM, Revit and CAD</Link>
        <Link href="/it-services">Websites and small-business IT</Link>
        <Link href="/answers">Answers to common questions</Link>
        <Link href="/#contact">Contact Cinci360</Link>
      </nav>
    </main>
  );
}
