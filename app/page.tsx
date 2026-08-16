"use client";

import "./reviews.css";
import "./brand.css";
import "./site-updates.css";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

const services = [
  ["01", "LiDAR surveying", "Accurate existing-condition surveys, point clouds, Matterport digital twins and site documentation—captured once and ready for every stakeholder.", "Reality capture · Matterport · E57"],
  ["02", "CAD + Revit modeling", "Field data translated into dependable drawings, CAD files and scan-to-BIM models for architects, builders, owners and facilities teams.", "DWG + PDF · Scan-to-BIM · Revit"],
  ["03", "Small-business IT", "Practical websites, Google presence and technology consulting from a partner who has helped local organizations make the web work since 2001.", "Web presence · Google Maps · Workflows"],
];
const people = [
  ["Aubrey", "Founder · Reality Capture", "/assets/team/aubrey.jpg"],
  ["Steve", "Field Operations", "/assets/team/steve.jpg"],
  ["Courtney", "Project Support", "/assets/team/courtney.jpg"],
  ["Nolan", "Field Technician", "/assets/team/nolan.jpeg"],
];
const reviews = [
  { quote: "Easy to work with and the finished product was amazing! Well worth the $.", name: "Sarah Hicks" },
  { quote: "Aubrey was amazing to work with. We loved our finished product! She created a virtual tour of The Bell Event Centre, which is extremely helpful for our guests and potential clients. Highly recommend!", name: "Alexis Roark Brickner · Bell Event Centre" },
  { quote: "Cinci360 did a 3D tour of my work and it’s incredible! Aubrey is so talented and it lets you look at the building in a whole new perspective. We are very thankful for her!", name: "Courtney Elizabeth Hust" },
  { quote: "Aubrey did a 360 tour of our shop and warehouse. She was thorough, professional and talented. We are very excited that we now have a virtual 3D tour for our customers!", name: "Baroque Violin Shop" },
  { quote: "Aubrey is such a great person to work with—very helpful and great at answering questions about her process. I will recommend her service to my colleagues.", name: "Ron Biernat" },
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
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const loadAnimation = (url: string) => fetch(url).then(r => r.json()).then(data => typeof data === "string" ? JSON.parse(data) : data);
    Promise.all([loadAnimation("/assets/lottie/cincinnati-desktop.json"), loadAnimation("/assets/lottie/cincinnati-mobile.json"), loadAnimation("/assets/lottie/skyscraper-construction-timelapse.json")]).then(([d,m,s])=>{setDesktop(d);setMobile(m);setSkyscraper(makeBlack(s))});
  }, []);
  function whatsapp(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const d=new FormData(e.currentTarget); const msg=`Hi Cinci360! I’m ${d.get("name")} from ${d.get("company")||"my organization"}.\n\nProject: ${d.get("project")}\nEmail: ${d.get("email")}`; window.open(`https://wa.me/cinci360?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer"); }
  return <main>
    <header className="site-header"><a className="brand" href="#top" aria-label="Cinci360 home"><span>Cinci</span><strong>360</strong></a><button className="menu-button" aria-label="Toggle navigation" onClick={()=>setMenu(!menu)}><span/><span/></button><nav className={menu?"open":""}>{["Services","Projects","Team","Reviews"].map(x=><a key={x} href={`#${x.toLowerCase()}`} onClick={()=>setMenu(false)}>{x}</a>)}<a href="/Cinci360-Capability-Statement.pdf" target="_blank">Capability statement ↗</a><span className="social-links"><a href="https://discover.matterport.com/account/jyfRo6mvuYG" target="_blank" rel="noreferrer" aria-label="Cinci360 on Matterport Discover"><SocialIcon name="matterport"/></a><a href="https://github.com/Cinci360-LLC" target="_blank" rel="noreferrer" aria-label="Cinci360 on GitHub"><SocialIcon name="github"/></a><a href="http://linkedin.com/in/aubrey" target="_blank" rel="noreferrer" aria-label="Aubrey Backscheider on LinkedIn"><SocialIcon name="linkedin"/></a><a href="https://www.youtube.com/@cinci360" target="_blank" rel="noreferrer" aria-label="Cinci360 on YouTube"><SocialIcon name="youtube"/></a><a href="https://www.instagram.com/cinci360/" target="_blank" rel="noreferrer" aria-label="Cinci360 on Instagram"><SocialIcon name="instagram"/></a></span></nav><a className="header-cta" href="#contact">Start a project</a></header>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">Reality, captured. Possibility, modeled.</p><h1>We make the<br/><em>built world</em><br/>work smarter.</h1><p className="hero-intro">Cincinnati-based reality capture, LiDAR surveying and scan-to-BIM—delivered across the Midwest and nationwide.</p><div className="hero-actions"><a className="button button-gold" href="#contact">Tell us about your site</a><a className="text-link" href="#projects">Explore recent work ↓</a></div></div><div className="hero-visual"><div className="scan-orbit"><i/><i/><i/><span/></div>{desktop&&<div className="lottie desktop-lottie"><Lottie animationData={desktop} pingPong/></div>}{mobile&&<div className="lottie mobile-lottie"><Lottie animationData={mobile} pingPong/></div>}<div className="scan-caption"><b/> Live capture / Cincinnati, OH</div></div><div className="hero-index">39.1031° N&nbsp;&nbsp; 84.5120° W</div></section>
    <section className="intro-band"><p>One field visit.</p><h2>A precise digital foundation for every decision that follows.</h2><a href="/Cinci360-Capability-Statement.pdf" target="_blank">Download our capability statement <span>↗</span></a></section>
    <section id="services" className="section services"><div className="section-heading"><p className="eyebrow">What we do</p><h2>From real space<br/>to useful data.</h2><p>Clear deliverables, responsive communication and enough experience to know what your next team will need.</p>{skyscraper&&<div className="service-lottie"><Lottie animationData={skyscraper} pingPong/></div>}</div><div>{services.map(s=><article className="service-card" key={s[0]}><span>{s[0]}</span><div><h3>{s[1]}</h3><p>{s[2]}</p><small>{s[3]}</small></div><b>↗</b></article>)}</div></section>
    <section id="projects" className="section projects"><div className="project-heading"><div><p className="eyebrow">Selected work</p><h2>Step inside<br/>the work.</h2></div><p>Explore two recent digital twins captured and delivered by Cinci360.</p></div><div className="matterport-gallery"><article className="matterport-feature"><div className="matterport-frame"><iframe src="https://my.matterport.com/show/?m=RRUh81GAFtt&amp;play=1&amp;qs=1" title="Bell Event Centre Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen/></div><div className="matterport-caption"><span>Live Matterport tour · Cincinnati, Ohio</span><h3>Bell Event Centre</h3><p>Explore two floors and more than 18,000 square feet of this historic Cincinnati landmark in an immersive digital twin.</p></div></article><article className="matterport-feature"><div className="matterport-frame"><iframe src="https://my.matterport.com/show/?m=Zsm68ghVsMh&amp;play=1&amp;qs=1" title="Recent Cinci360 Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen/></div><div className="matterport-caption"><span>Live Matterport tour · Recent project</span><h3>Featured Digital Twin</h3><p>Move through the space, switch viewpoints and experience the detail captured in a Cinci360 site survey.</p></div></article></div></section>
    <section className="clients"><p className="eyebrow">Trusted across Cincinnati and beyond</p><div className="logo-window"><div className="logo-track">{[...logos,...logos].map(([file,name],i)=><div className="logo-item" key={`${file}-${i}`}><img src={`/assets/logos/${file}`} alt={name} decoding="async"/></div>)}</div></div></section>
    <section id="team" className="section team"><div className="team-copy"><p className="eyebrow">Better field coverage than Roy Kent</p><h2>National reach.<br/>Field-proven expertise.</h2><p>Our experienced LiDAR specialists bring national coverage, disciplined capture standards and hands-on knowledge across architecture, construction, insurance and manufacturing.</p></div><div className="team-grid">{people.map(p=><article key={p[0]}><div className="portrait">{p[2]?<Image src={p[2]} alt={p[0]} fill sizes="300px"/>:<span>SB</span>}</div><h3>{p[0]}</h3><p>{p[1]}</p></article>)}</div></section>
    <section id="reviews" className="reviews"><div className="quote">“</div><div className="review-track" aria-label="Google customer reviews">{reviews.map((item,index)=><article className="review-slide" key={item.name}><blockquote>“{item.quote}”</blockquote><div className="review-meta"><span aria-label="5 out of 5 stars">★★★★★</span><p>{item.name} · Google review</p></div><small>{String(index+1).padStart(2,"0")} / {String(reviews.length).padStart(2,"0")}</small></article>)}</div><p className="review-hint">Scroll to read more reviews →</p><a className="google-reviews-link" href="https://maps.app.goo.gl/mYDW7y2nWVpwUXXT9Yeah" target="_blank" rel="noreferrer">See all reviews on Google Maps ↗</a></section>
    <section id="contact" className="contact"><div><p className="eyebrow">Let’s capture what’s next</p><h2>Have a building<br/>in mind?</h2><p>Share a few details and continue the conversation directly in WhatsApp. Plans, photos and addresses are welcome.</p><a href="mailto:support@cinci360.com">support@cinci360.com ↗</a></div><form onSubmit={whatsapp}><label>Your name<input name="name" required placeholder="Jane Smith"/></label><label>Email address<input name="email" type="email" required placeholder="jane@company.com"/></label><label>Company <span>Optional</span><input name="company" placeholder="Organization"/></label><label>Tell us about the project<textarea name="project" required placeholder="Building type, location, approximate size and deliverables…"/></label><button className="button button-gold">Continue in WhatsApp ↗</button><small>WhatsApp will open with your project details ready to send.</small></form></section>
    <footer><div className="footer-main"><a className="brand" href="#top"><span>Cinci</span><strong>360</strong></a><p>Reality capture · CAD + Revit · Small-business technology</p><div><a href="#services">Services</a><a href="#projects">Projects</a><a href="#team">Team</a><a href="/Cinci360-Capability-Statement.pdf" target="_blank">Capability statement</a></div></div><a className="throwback" href="https://web.archive.org/web/20010624120530/http://www.purdue.edu/odos/" target="_blank" rel="noreferrer"><span>Since 2001: technology work spanning three decades. See where the journey began ↗</span></a><div className="footer-bottom"><span>© 2026 Cinci360. Cincinnati, Ohio.</span><span>Cinci360.com online since 2017</span><span>Built for the real world.</span></div></footer>
  </main>;
}
