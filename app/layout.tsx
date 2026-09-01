import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cinci360.com"),
  title: {
    default: "Cinci360 | Reality Capture & Digital Twins",
    template: "%s | Cinci360",
  },
  description: "Cincinnati LiDAR surveying, Matterport reality capture, existing conditions, CAD, Revit and scan-to-BIM services across the Midwest and nationwide.",
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
    description: "Cincinnati LiDAR surveying, Matterport reality capture, existing conditions, CAD, Revit and scan-to-BIM services across the Midwest and nationwide.",
  },
  twitter: {
    card: "summary",
    title: "Cinci360 | Reality Capture & Digital Twins",
    description: "Cincinnati LiDAR surveying, Matterport reality capture, existing conditions, CAD, Revit and scan-to-BIM services.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/favicon.svg" },
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
