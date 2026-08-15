"use client";

import "./reviews.css";
import Image from "next/image";
import LottieModule from "lottie-react";
import { FormEvent, useEffect, useState } from "react";

const services = [
  ["01", "LiDAR surveying", "Accurate existing-condition surveys, point clouds, Matterport digital twins and site documentation—captured once and ready for every stakeholder.", "Reality capture · Matterport · E57"],
  ["02", "CAD + Revit modeling", "Field data translated into dependable drawings, CAD files and scan-to-BIM models for architects, builders, owners and facilities teams.", "DWG + PDF · Scan-to-BIM · Revit"],
  ["03", "Small-business IT", "Practical websites, Google presence and technology consulting from a partner who has helped local organizations make the web work since 2001.", "Web presence · Google Maps · Workflows"],
];
const projects = [
  ["Nippert Stadium", "Campus-scale reality capture", "/assets/projects/nippert.png"],
  ["Dayton Art Institute", "Scan-to-CAD + Revit", "/assets/projects/dayton-scan-to-cad.png"],
  ["Cincinnati Observatory", "Historic documentation", "/assets/projects/observatory.png"],
  ["Existing Conditions", "Architectural modeling", "/assets/projects/revit-model.jpg"],
];
const people = [
  ["Aubrey", "Founder · Reality Capture", "/assets/team/aubrey.jpg"],
  ["Steve", "Field Operations", "/assets/team/steve.jpg"],
  ["Courtney", "Project Support", "/assets/team/courtney.webp"],
  ["Nolan", "Field Technician", "/assets/team/nolan.jpeg"],
];
const reviews = [
  { quote: "Easy to work with and the finished product was amazing! Well worth the $.", name: "Sarah Hicks" },
  { quote: "Aubrey was amazing to work with. We loved our finished product! She created a virtual tour of The Bell Event Centre, which is extremely helpful for our guests and potential clients. Highly recommend!", name: "Alexis Roark Brickner · Bell Event Centre" },
  { quote: "Cinci360 did a 3D tour of my work and it’s incredible! Aubrey is so talented and it lets you look at the building in a whole new perspective. We are very thankful for her!", name: "Courtney Elizabeth Hust" },
  { quote: "Aubrey did a 360 tour of our shop and warehouse. She was thorough, professional and talented. We are very excited that we now have a virtual 3D tour for our customers!", name: "Baroque Violin Shop" },
  { quote: "Aubrey is such a great person to work with—very helpful and great at answering questions about her process. I will recommend her service to my colleagues.", name: "Ron Biernat" },
];
const logos = ["###80acres.jpg","###84.51.jpg","###8149_fc_cincinnati-alternate-2016.png","###aac-logo-fb.jpg","###Cartridge Brewing.jpg","###change-up.png","###Cincinnati_Observatory_Logo.jpg","###CJRC.jpg","###coreimpact.png","###dwell513.jpg","###kroger.jpg","###lithco restoration.jpg","###LivFul_Logo_trans-01.png","###PAD+LOGO+BLACK.jpg","###PPL-Black_186.png","###VTS_logonowords1739x651.png","###women empowered.png","###1628.png"];
const Lottie = (LottieModule as unknown as { default: typeof LottieModule }).default;

export default function Home() {
  const [desktop, setDesktop] = useState<object>();
  const [mobile, setMobile] = useState<object>();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const loadAnimation = (url: string) => fetch(url).then(r => r.json()).then(data => typeof data === "string" ? JSON.parse(data) : data);
    Promise.all([loadAnimation("/assets/lottie/cincinnati-desktop.json"), loadAnimation("/assets/lottie/cincinnati-mobile.json")]).then(([d,m])=>{setDesktop(d);setMobile(m)});
  }, []);
  function whatsapp(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const d=new FormData(e.currentTarget); const msg=`Hi Cinci360! I’m ${d.get("name")} from ${d.get("company")||"my organization"}.\n\nProject: ${d.get("project")}\nEmail: ${d.get("email")}`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer"); }
  return <main>
    <header className="site-header"><a className="brand" href="#top"><span>Cinci</span><strong>360</strong></a><button className="menu-button" aria-label="Toggle navigation" onClick={()=>setMenu(!menu)}><span/><span/></button><nav className={menu?"open":""}>{["Services","Projects","Team","Reviews"].map(x=><a key={x} href={`#${x.toLowerCase()}`} onClick={()=>setMenu(false)}>{x}</a>)}<a href="/Cinci360-Capability-Statement.pdf" target="_blank">Capability statement ↗</a><span className="social-links"><a href="https://www.instagram.com/cinci360/" target="_blank" rel="noreferrer" aria-label="Cinci360 on Instagram">IG</a><a href="http://linkedin.com/in/aubrey" target="_blank" rel="noreferrer" aria-label="Aubrey Backscheider on LinkedIn">LI</a><a href="https://www.youtube.com/@cinci360" target="_blank" rel="noreferrer" aria-label="Cinci360 on YouTube">YT</a></span></nav><a className="header-cta" href="#contact">Start a project</a></header>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">Reality, captured. Possibility, modeled.</p><h1>We make the<br/><em>built world</em><br/>work smarter.</h1><p className="hero-intro">Cincinnati-based reality capture, LiDAR surveying and scan-to-BIM—delivered across the Midwest and nationwide.</p><div className="hero-actions"><a className="button button-gold" href="#contact">Tell us about your site</a><a className="text-link" href="#projects">Explore recent work ↓</a></div></div><div className="hero-visual"><div className="scan-orbit"><i/><i/><i/><span/></div>{desktop&&<div className="lottie desktop-lottie"><Lottie animationData={desktop} loop/></div>}{mobile&&<div className="lottie mobile-lottie"><Lottie animationData={mobile} loop/></div>}<div className="scan-caption"><b/> Live capture / Cincinnati, OH</div></div><div className="hero-index">39.1031° N&nbsp;&nbsp; 84.5120° W</div></section>
    <section className="intro-band"><p>One field visit.</p><h2>A precise digital foundation for every decision that follows.</h2><a href="/Cinci360-Capability-Statement.pdf" target="_blank">Download our capability statement <span>↗</span></a></section>
    <section id="services" className="section services"><div className="section-heading"><p className="eyebrow">What we do</p><h2>From real space<br/>to useful data.</h2><p>Clear deliverables, responsive communication and enough experience to know what your next team will need.</p></div><div>{services.map(s=><article className="service-card" key={s[0]}><span>{s[0]}</span><div><h3>{s[1]}</h3><p>{s[2]}</p><small>{s[3]}</small></div><b>↗</b></article>)}</div></section>
    <section id="projects" className="section projects"><div className="project-heading"><div><p className="eyebrow">Selected work</p><h2>Step inside<br/>the work.</h2></div><p>Explore current digital twins, then browse a few examples of the field capture and modeling work behind them.</p></div><article className="matterport-feature"><div className="matterport-frame"><iframe src="https://my.matterport.com/show/?m=RRUh81GAFtt" title="Bell Event Centre Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" allowFullScreen/></div><div className="matterport-caption"><span>Live Matterport tour · Cincinnati, Ohio</span><h3>Bell Event Centre</h3><p>Explore two floors and more than 18,000 square feet of this historic Cincinnati landmark in an immersive digital twin.</p></div></article><div className="project-grid compact-projects">{projects.slice(1).map((p,i)=><article className={`project-card p${i+1}`} key={p[0]}><Image src={p[2]} alt={p[0]} fill sizes="(max-width:800px) 100vw, 33vw"/><div><span>{p[1]}</span><h3>{p[0]}</h3><b>Project detail ↗</b></div></article>)}</div></section>
    <section className="clients"><p className="eyebrow">Trusted across Cincinnati and beyond</p><div className="logo-window"><div className="logo-track">{[...logos,...logos].map((x,i)=><div className="logo-item" key={i}><Image src={`/assets/logos/${encodeURIComponent(x)}`} alt={x.slice(3).replace(/\.[^.]+$/,"")} width={220} height={100}/></div>)}</div></div></section>
    <section id="team" className="section team"><div className="team-copy"><p className="eyebrow">The people behind the points</p><h2>Small team.<br/>Wide perspective.</h2><p>We pair hands-on field knowledge with thoughtful technology. You’ll always know who is capturing your site—and who to call when the work moves forward.</p></div><div className="team-grid">{people.map(p=><article key={p[0]}><div className="portrait">{p[2]?<Image src={p[2]} alt={p[0]} fill sizes="300px"/>:<span>SB</span>}</div><h3>{p[0]}</h3><p>{p[1]}</p></article>)}</div></section>
    <section id="reviews" className="reviews"><div className="quote">“</div><div className="review-track" aria-label="Google customer reviews">{reviews.map((item,index)=><article className="review-slide" key={item.name}><blockquote>“{item.quote}”</blockquote><div className="review-meta"><span aria-label="5 out of 5 stars">★★★★★</span><p>{item.name} · Google review</p></div><small>{String(index+1).padStart(2,"0")} / {String(reviews.length).padStart(2,"0")}</small></article>)}</div><p className="review-hint">Scroll to read more reviews →</p><a className="google-reviews-link" href="https://maps.app.goo.gl/mYDW7y2nWVpwUXXT9Yeah" target="_blank" rel="noreferrer">See all reviews on Google Maps ↗</a></section>
    <section id="contact" className="contact"><div><p className="eyebrow">Let’s capture what’s next</p><h2>Have a building<br/>in mind?</h2><p>Share a few details and continue the conversation directly in WhatsApp. Plans, photos and addresses are welcome.</p><a href="mailto:hello@cinci360.com">hello@cinci360.com ↗</a></div><form onSubmit={whatsapp}><label>Your name<input name="name" required placeholder="Jane Smith"/></label><label>Email address<input name="email" type="email" required placeholder="jane@company.com"/></label><label>Company <span>Optional</span><input name="company" placeholder="Organization"/></label><label>Tell us about the project<textarea name="project" required placeholder="Building type, location, approximate size and deliverables…"/></label><button className="button button-gold">Continue in WhatsApp ↗</button><small>WhatsApp will open with your project details ready to send.</small></form></section>
    <footer><div className="footer-main"><a className="brand" href="#top"><span>Cinci</span><strong>360</strong></a><p>Reality capture · CAD + Revit · Small-business technology</p><div><a href="#services">Services</a><a href="#projects">Projects</a><a href="#team">Team</a><a href="/Cinci360-Capability-Statement.pdf" target="_blank">Capability statement</a></div></div><a className="throwback" href="https://web.archive.org/web/20010624120530/http://www.purdue.edu/odos/" target="_blank" rel="noreferrer"><Image src="/assets/purdue-train.jpg" alt="Dean of Students train from Aubrey's first website" width={554} height={50}/><span>Since 2001: technology work spanning three decades. See where the journey began ↗</span></a><div className="footer-bottom"><span>© 2026 Cinci360. Cincinnati, Ohio.</span><span>Built for the real world.</span></div></footer>
  </main>;
}
