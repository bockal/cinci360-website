"use client";

import "./reviews.css";
import "./brand.css";
import "./site-updates.css";
import Image from "next/image";
import { Fragment, FormEvent, useEffect, useRef, useState } from "react";

const services = [
  ["01", "LiDAR surveying", "Accurate existing-condition surveys, point clouds, Matterport digital twins and site documentation—captured once and ready for every stakeholder.", "Reality capture · Matterport · E57", "/3d-laser-scanning-cincinnati"],
  ["02", "Architectural 3D modeling", "Field data translated into dependable as-built 3D models, CAD drawings and Revit files for architects, builders, owners and facilities teams.", "DWG + PDF · Scan-to-BIM · Revit", "/scan-to-bim-revit-cad"],
  ["03", "Small-business IT", "Practical websites, Google Business Profile management and technology consulting from a team that has helped organizations make the web work since 2001.", "Websites · Google Maps · Workflows", "/it-services"],
];
const people = [
  ["Aubrey", "Founder · Reality Capture", "/assets/team/aubrey.jpg"],
  ["Steve", "Field Operations", "/assets/team/steve.jpg"],
  ["Courtney", "Project Support", "/assets/team/courtney.jpg"],
  ["Nolan", "Field Technician", "/assets/team/nolan.jpeg"],
];
const reviews = [
  { quote: "Aubrey was amazing to work with. We loved our finished product! She created a virtual tour of The Bell Event Centre, which is extremely helpful for our guests and potential clients. Highly recommend!", name: "Alexis Brickner · Bell Event Centre" },
  { quote: "Aubrey did a 360 tour of our shop and warehouse. She was thorough, professional and talented. We are very excited that we now have a virtual 3D tour for our customers!", name: "Baroque Violin Shop" },
  { quote: "Aubrey is such a great person to work with—very helpful and great at answering questions about her process. I will recommend her service to my colleagues.", name: "Ron Biernat" },
];
const reviewPhotos = [
  { src: "/assets/reviews/field-review-1.jpg", alt: "Cinci360 project team with a survey camera at an Estée Lauder facility", caption: "Project team · Cinci360", position: "center" },
  { src: "/assets/reviews/field-review-2.jpg", alt: "Cinci360 technician operating a Matterport camera outside a Kia dealership", caption: "Retail capture · Cinci360", position: "center" },
  { src: "/assets/reviews/field-review-dayton.jpg", alt: "Reality-capture survey of the Dayton Art Institute", caption: "Dayton Art Institute · Cinci360", position: "center" },
  { src: "/assets/reviews/field-review-nippert.jpg", alt: "Reality-capture survey of Nippert Stadium in Cincinnati", caption: "Nippert Stadium · Cinci360", position: "center" },
];
const homeSchema = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://cinci360.com/#website",
    url: "https://cinci360.com/",
    name: "Cinci360",
    publisher: { "@id": "https://cinci360.com/#organization" },
    inLanguage: "en-US",
  },
];
const logos = [
  ["80acres.jpg", "80 Acres Farms"], ["84-51.jpg", "84.51°"], ["fc-cincinnati.png", "FC Cincinnati"],
  ["aac.jpg", "AAC"], ["cartridge-brewing.jpg", "Cartridge Brewing"], ["change-up.png", "ChangeUp"],
  ["cincinnati-observatory.jpg", "Cincinnati Observatory"], ["cjrc.jpg", "Cincinnati Junior Rowing Club"],
  ["core-impact.png", "Core Impact"], ["dwell513.jpg", "Dwell513"], ["kroger.jpg", "Kroger"],
  ["lithco-restoration.jpg", "Lithco Restoration"], ["livful.png", "LivFul"], ["pad.jpg", "PAD"],
  ["ppl.png", "PPL"], ["vts.png", "VTS"], ["women-empowered.png", "Women Empowered"], ["1628.png", "1628"],
];
type LottieAnimation = {
  destroy: () => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: 1 | -1) => void;
  play: () => void;
  addEventListener: (event: "complete", handler: () => void) => void;
  removeEventListener: (event: "complete", handler: () => void) => void;
};

function Lottie({ animationData, loop = true, speed = 1, pingPong = false }: { animationData: object; loop?: boolean; speed?: number; pingPong?: boolean }) {
  const container = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    let animation: LottieAnimation | undefined;

    let onComplete: (() => void) | undefined;

    import("lottie-web/build/player/lottie_light").then(module => {
      if (cancelled || !container.current) return;
      const lottie = (module.default ?? module) as unknown as {
        loadAnimation: (options: object) => LottieAnimation;
      };
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: "svg",
        loop: pingPong ? false : loop,
        autoplay: true,
        animationData,
      });
      animation.setSpeed(speed);
      if (pingPong) {
        let direction: 1 | -1 = 1;
        onComplete = () => {
          if (!animation) return;
          direction = direction === 1 ? -1 : 1;
          animation.setDirection(direction);
          animation.play();
        };
        animation.addEventListener("complete", onComplete);
      }
    });

    return () => {
      cancelled = true;
      if (animation && onComplete) animation.removeEventListener("complete", onComplete);
      animation?.destroy();
    };
  }, [animationData, loop, speed, pingPong]);

  return <span ref={container} className="lottie-player" aria-hidden="true" />;
}

function makeBlack(animation: object) {
  const copy = structuredClone(animation) as Record<string, unknown>;
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if ((node.ty === "st" || node.ty === "fl") && node.c && typeof node.c === "object") {
      const color = node.c as Record<string, unknown>;
      color.a = 0;
      color.k = [0, 0, 0, 1];
    }
    Object.values(node).forEach(visit);
  };
  visit(copy);
  return copy;
}

function SocialIcon({ name }: { name: "instagram" | "linkedin" | "youtube" | "matterport" | "github" }) {
  if (name === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.8" r=".8" className="icon-fill"/></svg>;
  if (name === "linkedin") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><circle cx="8" cy="8" r="1" className="icon-fill"/><path d="M8 11v6M12 17v-6m0 2.5c.7-1.7 4-2 4 1V17"/></svg>;
  if (name === "youtube") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3Z"/></svg>;
  if (name === "matterport") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/><circle cx="12" cy="12" r="2.2" className="icon-fill"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 19.5c-4.2 1.3-4.2-2.1-5.9-2.6M14.5 21v-3.3c0-1 .1-1.5-.5-2.1 3.1-.3 6.4-1.5 6.4-6.8a5.3 5.3 0 0 0-1.4-3.7 4.9 4.9 0 0 0-.1-3.7s-1.1-.4-3.8 1.4a12.7 12.7 0 0 0-6.8 0C5.7 1 4.6 1.4 4.6 1.4a4.9 4.9 0 0 0-.1 3.7 5.3 5.3 0 0 0-1.4 3.7c0 5.3 3.2 6.5 6.4 6.8-.5.5-.6 1.1-.6 2.1V21"/></svg>;
}

export default function Home() {
  const [desktop, setDesktop] = useState<object>();
  const [mobile, setMobile] = useState<object>();
  const [skyscraper, setSkyscraper] = useState<object>();
  const [tripodMark, setTripodMark] = useState<object>();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const loadAnimation = (url: string) => fetch(url).then(r => r.json()).then(data => typeof data === "string" ? JSON.parse(data) : data);
    Promise.all([loadAnimation("/assets/lottie/cincinnati-desktop.json"), loadAnimation("/assets/lottie/cincinnati-mobile.json"), loadAnimation("/assets/lottie/skyscraper-construction-timelapse.json"), loadAnimation("/assets/lottie/tripod-mark.json")]).then(([d,m,s,t])=>{setDesktop(d);setMobile(m);setSkyscraper(makeBlack(s));setTripodMark(t)});
  }, []);
  function emailProject(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const d=new FormData(e.currentTarget); const subject=`Cinci360 project inquiry from ${d.get("name")}`; const body=`Hi Aubrey,\n\nI’m ${d.get("name")} from ${d.get("company")||"my organization"}.\n\nProject: ${d.get("project")}\n\nMy email: ${d.get("email")}`; window.location.href=`mailto:aubrey@cinci360.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; }
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema).replace(/</g, "\\u003c") }} />
    <header className="site-header"><a className="brand animated-brand" href="#top" aria-label="Cinci360 home"><span>Cinci</span><strong>360</strong>{tripodMark&&<span className="brand-tripod"><Lottie animationData={tripodMark} pingPong speed={.9}/></span>}</a><button className="menu-button" aria-label="Toggle navigation" onClick={()=>setMenu(!menu)}><span/><span/></button><nav className={menu?"open":""}>{["Services","Projects","Team","Reviews"].map(x=><a key={x} href={`#${x.toLowerCase()}`} onClick={()=>setMenu(false)}>{x}</a>)}<a href="/Cinci360-Capability-Statement.pdf" target="_blank">Capability statement ↗</a><span className="social-links"><a href="https://discover.matterport.com/account/jyfRo6mvuYG" target="_blank" rel="noreferrer" aria-label="Cinci360 on Matterport Discover"><SocialIcon name="matterport"/></a><a href="https://github.com/Cinci360-LLC" target="_blank" rel="noreferrer" aria-label="Cinci360 on GitHub"><SocialIcon name="github"/></a><a href="http://linkedin.com/in/aubrey" target="_blank" rel="noreferrer" aria-label="Aubrey Backscheider on LinkedIn"><SocialIcon name="linkedin"/></a><a href="https://www.youtube.com/@cinci360" target="_blank" rel="noreferrer" aria-label="Cinci360 on YouTube"><SocialIcon name="youtube"/></a><a href="https://www.instagram.com/cinci360/" target="_blank" rel="noreferrer" aria-label="Cinci360 on Instagram"><SocialIcon name="instagram"/></a></span></nav><a className="header-cta" href="#contact">Start a project</a></header>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">Reality, captured. Possibility, modeled.</p><h1>We make the<br/><em>built world</em><br/>work smarter.</h1><p className="hero-intro">National reality capture, LiDAR surveying and scan-to-BIM—delivered by field technicians based in Miami, New York, Cincinnati and Denver.</p><div className="hero-actions"><a className="button button-gold" href="#contact">Tell us about your site</a><a className="text-link" href="#projects">Explore recent work ↓</a></div></div><div className="hero-visual hero-poster"><Image src="/images/workflows/cinci360-tenure-hero.webp" alt="Cinci360 field scanning flows into a precise building model and connected digital business operations" fill priority sizes="(max-width: 900px) 93vw, 54vw"/><div className="hero-poster-caption"><span><b>Since 2017</b> Reality capture</span><span><b>Since 2001</b> Practical technology</span></div></div><div className="hero-index">Measure · Model · Automate · Grow</div></section>
    <section className="intro-band"><p>One field visit.</p><h2>A precise digital foundation for every decision that follows.</h2><a href="/Cinci360-Capability-Statement.pdf" target="_blank">Download our capability statement <span>↗</span></a></section>
    <section id="services" className="section services"><div className="section-heading"><p className="eyebrow">What we do</p><h2>From real space<br/>to useful data.</h2><p>Clear deliverables, responsive communication and enough experience to know what your next team will need.</p>{skyscraper&&<div className="service-lottie"><Lottie animationData={skyscraper} pingPong/></div>}</div><div>{services.map(s=><article className="service-card" key={s[0]}><span>{s[0]}</span><div><h3>{s[1]}</h3><p>{s[2]}</p><a className="service-keyword-link" href={s[4]} aria-label={`Explore ${s[1]} services`}>{s[3]} <span>↗</span></a></div><b>↗</b></article>)}</div></section>
    <section id="projects" className="section projects"><div className="project-heading"><div><p className="eyebrow">Selected work</p><h2>Step inside<br/>the work.</h2></div><p>Explore two recent digital twins captured and delivered by Cinci360.</p></div><div className="matterport-gallery"><article className="matterport-feature"><div className="matterport-frame"><iframe src="https://my.matterport.com/show/?m=RRUh81GAFtt&amp;play=1&amp;qs=1" title="Bell Event Centre Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen/></div><div className="matterport-caption"><span>Live Matterport tour · Cincinnati, Ohio</span><h3>Bell Event Centre</h3><p>Explore two floors and more than 18,000 square feet of this historic Cincinnati landmark in an immersive digital twin.</p></div></article><article className="matterport-feature"><div className="matterport-frame"><iframe src="https://my.matterport.com/show/?m=Zsm68ghVsMh&amp;play=1&amp;qs=1" title="Recent Cinci360 Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen/></div><div className="matterport-caption"><span>Live Matterport tour · Recent project</span><h3>Featured Digital Twin</h3><p>Move through the space, switch viewpoints and experience the detail captured in a Cinci360 site survey.</p></div></article></div></section>
    <section className="clients"><p className="eyebrow">Trusted across Cincinnati and beyond</p><div className="logo-window"><div className="logo-track">{[...logos,...logos].map(([file,name],i)=><div className="logo-item" key={`${file}-${i}`}><img src={`/assets/logos/${file}`} alt={name} decoding="async"/></div>)}</div></div></section>
    <section id="team" className="section team"><div className="team-copy"><p className="eyebrow">Better field coverage than Roy Kent</p><h2>National reach.<br/>Field-proven expertise.</h2><p>With technicians based in Miami, New York, Cincinnati and Denver, our team supports multi-site and one-off projects nationwide using consistent capture standards across architecture, construction, insurance and manufacturing.</p></div><div className="team-grid">{people.map(p=><article key={p[0]}><div className="portrait">{p[2]?<Image src={p[2]} alt={p[0]} fill sizes="300px"/>:<span>SB</span>}</div><h3>{p[0]}</h3><p>{p[1]}</p></article>)}</div></section>
    <section id="reviews" className="reviews"><div className="reviews-heading"><div><p className="eyebrow">Five stars on Google</p><h2>5.0 · Google reviews</h2><p>Customer stories and field photos from Cinci360.</p></div><a className="google-reviews-link" href="https://www.google.com/maps/place/Cinci360+3D+Laser+Survey+%26+Blueprint+Provider" target="_blank" rel="noreferrer">Read the reviews on Google ↗</a></div><div className="review-track" aria-label="Google reviews and Cinci360 field photos">{reviewPhotos.map((photo,index)=><Fragment key={photo.src}><figure className="review-photo"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 82vw, 350px" style={{objectPosition: photo.position}}/><figcaption>{photo.caption}</figcaption></figure>{reviews[index]&&<article className="review-card"><span className="review-stars" aria-label="5 out of 5 stars">★★★★★</span><blockquote>“{reviews[index].quote}”</blockquote><div className="review-meta"><p>{reviews[index].name}</p><a href="https://www.google.com/maps/place/Cinci360+3D+Laser+Survey+%26+Blueprint+Provider" target="_blank" rel="noreferrer">Verified on Google ↗</a></div></article>}</Fragment>)}</div><p className="review-hint">Scroll to see more →</p></section>
    <section id="contact" className="contact"><div><p className="eyebrow">Let’s capture what’s next</p><h2>Have a building<br/>in mind?</h2><p>Share a few details and send them directly to Aubrey. Plans, photos and addresses are welcome.</p><a href="mailto:aubrey@cinci360.com">aubrey@cinci360.com ↗</a></div><form onSubmit={emailProject}><label>Your name<input name="name" required placeholder="Jane Smith"/></label><label>Email address<input name="email" type="email" required placeholder="jane@company.com"/></label><label>Company <span>Optional</span><input name="company" placeholder="Organization"/></label><label>Tell us about the project<textarea name="project" required placeholder="Building type, location, approximate size and deliverables…"/></label><button className="button button-gold">Email Aubrey ↗</button><small>Your email app will open with the project details ready to send.</small></form></section>
    <footer><div className="footer-skyline" aria-hidden="true">{desktop&&<div className="footer-skyline-desktop"><Lottie animationData={desktop} pingPong/></div>}{mobile&&<div className="footer-skyline-mobile"><Lottie animationData={mobile} pingPong/></div>}</div><div className="footer-main"><a className="brand" href="#top"><span>Cinci</span><strong>360</strong></a><p>Reality capture · CAD + Revit · Small-business technology</p><div><a href="/3d-laser-scanning-cincinnati">3D laser scanning</a><a href="/scan-to-bim-revit-cad">3D modeling + Scan-to-BIM</a><a href="/it-services">IT services</a><a href="#projects">Projects</a><a href="/Cinci360-Capability-Statement.pdf" target="_blank">Capability statement</a></div></div><a className="throwback" href="https://web.archive.org/web/20010624120530/http://www.purdue.edu/odos/" target="_blank" rel="noreferrer"><span>Since 2001: technology work spanning three decades. See where the journey began ↗</span></a><div className="footer-bottom"><span>© 2026 Cinci360. Cincinnati, Ohio.</span><span>Cinci360.com online since 2017</span><span>Built for the real world.</span></div></footer>
  </main>;
}
