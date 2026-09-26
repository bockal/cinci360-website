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
      <Link className="global-mobile-cta" href="/#contact" onClick={()=>setOpen(false)}>Start a project</Link>
    </nav>
    <Link className="global-header-cta" href="/#contact">Start a project</Link>
  </header>;
}

export function SiteFooter() {
  return <footer className="global-footer compact-footer">
    <div className="compact-footer-main">
      <span>© 2026 Cinci360 · Cincinnati, Ohio · Nationwide</span>
      <nav aria-label="Footer navigation">
        <Link href="/answers">FAQ</Link>
        <Link className="footer-project-cta" href="/#contact">Start a project</Link>
      </nav>
    </div>
  </footer>;
}
