"use client";

import Link from "next/link";
import { useState } from "react";
import AnimatedBrand from "./animated-brand";
import "./site-chrome.css";

const primaryNav = [
  ["Case Study", "/projects/estee-lauder-plant"],
  ["Scan2BIM", "/scan-to-bim-revit-cad"],
  ["Floor Plans", "/floor-plans"],
  ["Due Diligence", "/due-diligence"],
  ["LiDAR", "/3d-laser-scanning-cincinnati"],
  ["IT Services", "/it-services"],
] as const;

export function SiteHeader() {
  const [open,setOpen]=useState(false);
  return <header className="global-header">
    <AnimatedBrand/>
    <button className={open?"global-menu-button open":"global-menu-button"} aria-label="Toggle site navigation" aria-expanded={open} onClick={()=>setOpen(!open)}><span/><span/></button>
    <nav className={open?"global-nav open":"global-nav"} aria-label="Primary navigation">
      {primaryNav.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="global-footer">
    <div className="global-footer-top">
      <AnimatedBrand/>
      <p>Reality capture · Scan-to-BIM · Measured floor plans · Existing-building due diligence · Digital operations</p>
    </div>
    <nav className="global-footer-nav" aria-label="Footer navigation">
      {primaryNav.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}
      <Link href="/answers">FAQ</Link>
    </nav>
    <div className="global-footer-contact">
      <a href="mailto:support@cinci360.com">support@cinci360.com</a>
      <a href="/#contact">Start a project</a>
    </div>
    <div className="global-footer-bottom"><span>© 2026 Cinci360 · Cincinnati, Ohio</span><span>Nationwide field coverage</span></div>
  </footer>;
}
