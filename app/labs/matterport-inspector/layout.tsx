import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matterport Inspector Prototype",
  description: "Internal Cinci360 R&D prototype for programmatic Matterport sweep traversal and evidence capture.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MatterportInspectorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
