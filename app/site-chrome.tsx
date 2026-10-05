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
  ["Podcast", "/podcast"],
  ["IT Services", "/it-services"],
] as const;

const socialLinks = [
  ["Matterport", "https://my.matterport.com/show/?m=RRUh81GAFtt", "M"],
  ["GitHub", "https://github.com/Cinci360-LLC", "github"],
  ["LinkedIn", "https://www.linkedin.com/in/aubrey", "linkedin"],
  ["YouTube", "https://www.youtube.com/@cinci360", "youtube"],
  ["Instagram", "https://www.instagram.com/cinci360/", "instagram"],
] as const;

function SocialIcon({ icon }: { icon: (typeof socialLinks)[number][2] }) {
  if (icon === "github") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.6 2.5 3.3 1.8.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.6 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.5.1-3 0 0 .9-.3 3.1 1.1.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.1-1.1 3.1-1.1.6 1.5.2 2.7.1 3 .8.8 1.2 1.8 1.2 3 0 4.3-2.7 5.3-5.3 5.6.4.4.8 1.1.8 2.2V22c0 .4.2.7.8.6A11.2 11.2 0 0 0 12 .8Z" /></svg>;
  if (icon === "linkedin") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.9 7.8H1.5V22h3.4V7.8ZM3.2 2a2 2 0 1 0 0 4.1 2 2 0 0 0 0-4.1ZM22.5 14.1c0-4.2-2.2-6.2-5.2-6.2-2.4 0-3.5 1.3-4.1 2.3h-.1V7.8H9.8V22h3.4v-7c0-1.9.4-3.7 2.7-3.7 2.2 0 2.2 2.1 2.2 3.8V22h3.4v-7.9Z" /></svg>;
  if (icon === "youtube") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.3 7.1a3 3 0 0 0-2.1-2.2C19.3 4.4 12 4.4 12 4.4s-7.3 0-9.2.5A3 3 0 0 0 .7 7.1 31 31 0 0 0 .2 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.2c1.9.5 9.2.5 9.2.5s7.3 0 9.2-.5a3 3 0 0 0 2.1-2.2 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9ZM9.6 15.3V8.7l6.3 3.3-6.3 3.3Z" /></svg>;
  if (icon === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm4.8 3.8a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm0 2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm5-2.7a1 1 0 1 1 0 2.1 1 1 0 0 1 0-2.1Z" /></svg>;
  return <span aria-hidden="true">{icon}</span>;
}

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
      <span>© 2026 Cinci360 · Woman-owned business · Cincinnati, Ohio · Nationwide · City of Cincinnati Vendor Code: VS1000024091</span>
      <nav aria-label="Footer navigation">
        <Link href="/podcast">Podcast</Link>
        <Link href="/answers">FAQ</Link>
        <Link className="footer-project-cta" href="/#contact">Start a project</Link>
      </nav>
      <nav className="compact-footer-social" aria-label="Social links">
        {socialLinks.map(([label,href,icon])=><a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Cinci360 on ${label}`} title={label}><SocialIcon icon={icon}/></a>)}
      </nav>
    </div>
  </footer>;
}
