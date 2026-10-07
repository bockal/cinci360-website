import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GBI Proof of Concept | Cinci360",
  description: "Cinci360 Geometry + Building Intelligence proof of concept for the Cincinnati Rowing Club digital twin.",
  robots: { index: false, follow: false },
};

export default function GbiLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
