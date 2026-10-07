import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Building Intelligence Portal",
  description:
    "Explore Cinci360's proof-of-concept building intelligence portal: a Matterport digital twin with AI-assisted visual and spatial facility reasoning.",
  alternates: { canonical: "/intelligence-portal" },
  openGraph: {
    title: "Cinci360 Building Intelligence Portal",
    description:
      "Ask a digital twin about facility assets, layout, clearances, condition, and planning decisions.",
    url: "/intelligence-portal",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function IntelligencePortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
