import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cinci360.com"),
  title: {
    default: "Cinci360 | Reality Capture & Digital Twins",
    template: "%s | Cinci360",
  },
  description: "National 3D laser scanning, LiDAR reality capture, existing-condition surveys, CAD, Revit and scan-to-BIM, with field teams across the United States.",
  alternates: { canonical: "/" },
  applicationName: "Cinci360",
  keywords: ["3D laser scanning Cincinnati", "LiDAR surveying", "reality capture", "Matterport", "scan to BIM", "existing conditions survey", "CAD", "Revit"],
  authors: [{ name: "Cinci360", url: "https://cinci360.com" }],
  creator: "Cinci360",
  publisher: "Cinci360",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Cinci360",
    title: "Cinci360 | Reality Capture & Digital Twins",
    description: "National 3D laser scanning, LiDAR reality capture, existing-condition surveys, CAD, Revit and scan-to-BIM, with field teams across the United States.",
  },
  twitter: {
    card: "summary",
    title: "Cinci360 | Reality Capture & Digital Twins",
    description: "National LiDAR surveying, Matterport reality capture, existing conditions, CAD, Revit and scan-to-BIM services.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "Organization"],
  "@id": "https://cinci360.com/#organization",
  name: "Cinci360",
  url: "https://cinci360.com/",
  logo: {
    "@type": "ImageObject",
    url: "https://cinci360.com/favicon.svg",
    contentUrl: "https://cinci360.com/favicon.svg",
    width: 128,
    height: 128,
  },
  email: "support@cinci360.com",
  telephone: "+1-513-800-7366",
  description: "National provider of 3D laser scanning, LiDAR reality capture, existing-condition surveys, architectural 3D modeling, CAD, Revit and scan-to-BIM services, with field technicians based in Miami, New York, Cincinnati and Denver.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1116 Fuller Street",
    addressLocality: "Cincinnati",
    addressRegion: "OH",
    postalCode: "45202",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "Country", name: "United States" },
    { "@type": "City", name: "Miami" },
    { "@type": "City", name: "New York" },
    { "@type": "City", name: "Cincinnati" },
    { "@type": "City", name: "Denver" },
  ],
  knowsAbout: ["3D laser scanning", "LiDAR surveying", "reality capture", "Matterport digital twins", "existing conditions surveys", "point clouds", "architectural 3D modeling", "CAD drafting", "Revit modeling", "scan-to-BIM", "website development", "Google Business Profile management", "small-business technology consulting"],
  sameAs: [
    "https://discover.matterport.com/account/jyfRo6mvuYG",
    "https://github.com/Cinci360-LLC",
    "https://www.linkedin.com/in/aubrey",
    "https://www.youtube.com/@cinci360",
    "https://www.instagram.com/cinci360/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
