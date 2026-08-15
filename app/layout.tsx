import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinci360 | Reality Capture & Digital Twins",
  description: "Cincinnati LiDAR surveying, Matterport reality capture, existing conditions, CAD, Revit and scan-to-BIM services across the Midwest and nationwide.",
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
