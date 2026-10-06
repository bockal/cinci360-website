import type { Metadata } from "next";
import Link from "next/link";
import { episodeAudio } from "../audio";
import "../podcast.css";

const episodeUrl = "https://cinci360.com/podcast/your-building-is-lying-to-you";
const publishDate = "2026-10-05";

const matterportTours = [
  { label: "Carew Tower existing conditions", href: "https://my.matterport.com/show/?m=mzpDndv61yD" },
  { label: "Peter's Cartridge Factory before renovation", href: "https://my.matterport.com/show/?m=9QLaV3JFz5k" },
  { label: "Cartridge Brewing finished space", href: "https://my.matterport.com/show/?m=D3UaD3yFgv7" },
];

const media = {
  carewDamagedRoom: "/images/podcast/episode-001/carew-damaged-room.jpeg",
  carewMarkedDrawings: "/images/podcast/episode-001/carew-marked-drawings.jpeg",
  carewStandingWater: "/images/podcast/episode-001/carew-standing-water.jpeg",
  carewElevatorLobby: "/images/podcast/episode-001/carew-elevator-lobby.jpeg",
  carewRooftopView: "/images/podcast/episode-001/carew-rooftop-view.jpeg",
  carewRooftopSelfie: "/images/podcast/episode-001/carew-rooftop-selfie.jpeg",
  petersExterior: "/images/podcast/episode-001/peters-cartridge-exterior.jpeg",
  petersSmokestack: "/images/podcast/episode-001/peters-cartridge-smokestack.jpeg",
  petersFieldPhoto: "/images/podcast/episode-001/peters-cartridge-field-photo.jpg",
  petersBeforeWide: "/images/podcast/episode-001/peters-cartridge-before-wide.jpg",
  petersBeforeConduit: "/images/podcast/episode-001/peters-cartridge-before-conduit.jpg",
  cartridgeBar: "/images/podcast/episode-001/cartridge-brewery-bar.jpg",
  cartridgeOverlook: "/images/podcast/episode-001/cartridge-brewery-overlook.jpg",
};

const interviewQuestions = [
  { question: "What was the original reason you were brought in to document Carew Tower?", answer: "The current owners were taken to court over the collapse of a ceiling above an occupied swimming pool on the first floor, as you can see in the survey. We were brought in to survey the entire structure, top to bottom, for a new intended buyer renovation." },
  { question: "What did you expect Carew Tower to be like before you got there?", answer: "More occupied. The building is a ghost town at the heart of Cincinnati, a problem that can plague a metropolis with low rents for decades." },
  { question: "What did the building actually tell you once you were inside?", answer: "The profitable parts of the structure, such as the Netherland Plaza Hall of Mirrors and hotel, were still well cared for, displaying the building's Art Deco-era facades and decor." },
  { question: "When you saw the red-marked drawings and old plans, what did they reveal about relying on blueprints?", answer: "Answer to fill in.", media: "Media note: insert red-marked Carew Tower drawings here." },
  { question: "What is the difference between “we have drawings” and “we know the building”?", answer: "Drawings do not show standing water, structural damage, low-quality building materials or vandalism. You would expect a difference between a blueprint and reality over the course of 100 years.", media: "Media note: insert Carew Tower roof water photo here." },
  { question: "What did the standing water on the roof tell you that a drawing could not?", answer: "Cut from final narration, but kept here as an interview workbench prompt." },
  { question: "How do you talk about flaws in a historic building without sounding like you are attacking the building?", answer: "The same way you inspect a home before a purchase: you add them up on a ledger until the dollars and cents make sense to the buyer." },
  { question: "Why is identifying a building's problems actually a form of care?", answer: "Answer to fill in." },
  { question: "What did Carew Tower teach you about public-facing buildings and hidden risk?", answer: "Neglect maintenance for long enough, and you will undoubtedly find your commercial or residential property posing a hazardous lawsuit." },
  { question: "What was the physical experience of scanning Peter's Cartridge Factory?", answer: "It was below freezing in February, probably around 10 degrees first thing in the morning. You were in steel-toed boots and layers. The work was slow and tedious, and eventually the equipment froze. At the time, you were not prepared to be on site for eight-plus hours in those conditions. Today, the equipment and workflow could handle that kind of work better." },
  { question: "What safety or site conditions stood out at Peter's Cartridge?", answer: "The site had a significant environmental history as a former ammunition facility. There were remediation efforts visible around the property, including trees planted to help address lead contamination tied to the site's industrial past." },
  { question: "What did it mean that the owner and investor were present during the survey?", answer: "Answer to fill in." },
  { question: "What did Kyle Hackworth's involvement say about the project?", answer: "Kyle Hackworth was a Boilermaker and part of the ownership/investor side of the project story." },
  { question: "What did the “before” model reveal about Peter's Cartridge that a finished brewery never could?", answer: "The digital twin of the pre-renovation structure made it much easier to evaluate renovation costs with multiple bidders and demolition teams. That is a boon to any investor.", media: "Media note: insert Peter's Cartridge before Matterport tour or still here." },
  { question: "Why does the finished Cartridge Brewing tour matter as much as the before tour?", answer: "Pure digital marketing, especially if your facility is rentable for events.", media: "Media note: insert finished Cartridge Brewing photo here." },
  { question: "What changes when you can share an entire building as a URL?", answer: "With the power of AI, you can imagine your next themed event in the space to its fullest.", media: "Future media note: add an AI-rendered Cartridge Brewing scene decorated for Halloween." },
  { question: "Who benefits from seeing the model before renovation decisions are finalized?", answer: "Answer to fill in." },
  { question: "How is this similar to AI helping screen X-rays for cancer?", answer: "The comparison is not that AI replaces doctors or that scans replace experts. The point is that better visual evidence helps qualified people make better decisions earlier." },
  { question: "When someone says, “We can't afford to scan it,” what do you want them to understand?", answer: "Any time a structure is intended for public use, the risks outweigh the rewards of doing it cheaply. A laser scan does not compromise the budget. It protects it by reducing rework, improving consensus, and giving the team a factual baseline." },
  { question: "What would you say to a developer, public agency, or owner considering reuse of an old building?", answer: "It is worth every penny to get a digital twin and shop around for the right construction team for the project, especially if you are dealing with a historic structure like Peter's Cartridge Factory.", media: "Media note: insert winter exterior of Peter's Cartridge Factory here." },
  { question: "What do you want future generations to understand about this work?", answer: "The goal is not just to document buildings once. It is to repeat and improve the process so better reuse decisions can be made over time." },
  { question: "What is the one sentence you want listeners to remember?", answer: "The drawing is not the building." },
];

function EpisodeImage({ src, alt, caption, tall = false }: { src: string; alt: string; caption: string; tall?: boolean }) {
  return <figure className={tall ? "episode-figure episode-figure-tall" : "episode-figure"}>
    <img src={src} alt={alt} />
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const metadata: Metadata = {
  title: "Your Building Is Lying to You | Cinci360 Podcast",
  description: "Cinci360's first Tales from the Field episode uses Carew Tower and Peter's Cartridge Factory to explain why existing drawings are not due diligence.",
  alternates: { canonical: episodeUrl },
  openGraph: {
    type: "article",
    url: episodeUrl,
    title: "Your Building Is Lying to You | Cinci360 Podcast",
    description: "Carew Tower, Peter's Cartridge Factory and the field case for documenting existing conditions before renovation decisions get expensive.",
    publishedTime: publishDate,
    authors: ["Cinci360"],
  },
  twitter: {
    card: "summary",
    title: "Your Building Is Lying to You | Cinci360 Podcast",
    description: "Why existing drawings are not due diligence.",
  },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "@id": `${episodeUrl}#episode`,
    name: "Your Building Is Lying to You",
    episodeNumber: 1,
    url: episodeUrl,
    datePublished: publishDate,
    inLanguage: "en-US",
    description: "Cinci360's first Tales from the Field episode uses Carew Tower and Peter's Cartridge Factory to explain why existing drawings are not due diligence.",
    partOfSeries: { "@id": "https://cinci360.com/podcast#series" },
    publisher: { "@id": "https://cinci360.com/#organization" },
    author: { "@id": "https://cinci360.com/#organization" },
    about: ["Reality capture", "Matterport digital twins", "Building due diligence", "Existing-condition documentation", "Historic renovation", "Adaptive reuse"],
    image: `https://cinci360.com${media.carewDamagedRoom}`,
    ...(episodeAudio.isReady ? { audio: { "@type": "AudioObject", contentUrl: episodeAudio.absoluteUrl, encodingFormat: episodeAudio.mimeType, duration: episodeAudio.duration || undefined } } : {}),
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${episodeUrl}#article`,
    headline: "Your Building Is Lying to You",
    datePublished: publishDate,
    dateModified: publishDate,
    author: { "@id": "https://cinci360.com/#organization" },
    publisher: { "@id": "https://cinci360.com/#organization" },
    mainEntityOfPage: episodeUrl,
    description: "Field notes and interview prompts for Cinci360's first podcast episode about existing-building due diligence and reality capture.",
    image: `https://cinci360.com${media.carewDamagedRoom}`,
  },
];

export default function PodcastEpisodePage() {
  return <main className="podcast-page episode-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <section className="episode-hero">
      <img src={media.carewDamagedRoom} alt="Matterport camera inside a damaged Carew Tower room with open ceiling tiles and distressed walls." />
      <div className="episode-hero-copy">
        <p className="eyebrow">Tales from the Field · Episode 001</p>
        <h1>Your Building Is Lying to You</h1>
        <p>Blueprints are not reality. They are a record of intent, revision, compromise and sometimes neglect.</p>
        <div className="service-actions">
          <Link className="button button-gold" href="/#contact">Plan a survey</Link>
          <Link href="/due-diligence">Explore due diligence</Link>
        </div>
      </div>
    </section>

    <section className="podcast-content episode-content">
      <article className="podcast-article">
        {episodeAudio.isReady ? <div className="podcast-audio-player"><strong>Listen to the episode</strong><audio controls preload="metadata" src={episodeAudio.src}>Your browser does not support the audio element.</audio></div> : <div className="podcast-audio-placeholder"><strong>Narration status</strong><p>Google Cloud TTS narration is wired. Add the generated MP3 at <code>{episodeAudio.src}</code>, then flip <code>episodeAudio.isReady</code> to true.</p></div>}

        <h2>Why Existing Drawings Aren&apos;t Due Diligence</h2>
        <p>In this first episode of <strong>Cinci360: Tales from the Field</strong>, we look at two Cincinnati-area projects where the real story of the building was not fully visible on paper: <strong>Carew Tower</strong> and <strong>Peter&apos;s Cartridge Factory</strong>, now transformed into Cartridge Brewing.</p>
        <p>Both buildings carried history. Both carried risk. Both had conditions that could not be understood from drawings alone.</p>
        <p>The job of a due diligence survey is to uncover structural flaws for an intended buyer. In doing so, you extend a generational respect for the future plans of a historic place such as Carew Tower.</p>

        <h2>Episode Thesis</h2>
        <p><strong>The drawing is not the building.</strong></p>
        <p>Existing drawings can tell you what someone thought was there, what someone hoped was there, or what was documented at one point in time. But buildings change. Owners defer maintenance. Water finds paths. Materials age. Walls move. Ceilings fail. Mechanical systems get rerouted. Hazardous materials hide behind finished surfaces.</p>
        <p>Reality capture gives owners, architects, engineers, contractors, lenders, preservationists and public stakeholders a shared factual digital baseline.</p>
        <p>It does not replace professional judgment. It makes professional judgment better.</p>

        <div className="episode-image-grid">
          <EpisodeImage src={media.carewMarkedDrawings} alt="Red-marked Carew Tower floor plans pinned to a wall." caption="Plans are a starting point. The red marks are the beginning of finding out what changed." />
          <EpisodeImage src={media.carewStandingWater} alt="Standing water on the Carew Tower roof beside a laser scanner." caption="The roof told a different story than any drawing could: water was staying where it should have moved." />
        </div>

        <h2>Featured Projects</h2>
        <h3>Carew Tower</h3>
        <p>Carew Tower is one of Cincinnati&apos;s most recognizable landmarks. From the skyline, it reads as civic pride. From inside the building, the story becomes more complicated.</p>
        <p>The scan documented conditions that drawings alone could not fully explain: damaged interiors, marked-up plans, roof drainage concerns, standing water, hidden-risk conditions and the gap between a building&apos;s public image and its physical reality.</p>
        <p>A drawing can show where roof drains are supposed to be. Existing conditions show whether the roof is actually draining.</p>
        <div className="episode-image-grid">
          <EpisodeImage src={media.carewElevatorLobby} alt="Elegant Carew Tower elevator lobby with a Matterport camera set up in the center." caption="Carew can be beautiful and still need hard questions. Preservation starts with seeing clearly." />
          <EpisodeImage src={media.carewRooftopView} alt="Wide rooftop view from Carew Tower overlooking downtown Cincinnati." caption="From the skyline, Carew reads as civic pride. From the roof, the building starts telling the maintenance story." />
          <EpisodeImage src={media.carewRooftopSelfie} alt="Aubrey on the Carew Tower rooftop with downtown Cincinnati behind her." caption="Field note: this work happens in real buildings, in real weather, with real risk underfoot." />
        </div>

        <h3>Peter&apos;s Cartridge Factory</h3>
        <p>Peter&apos;s Cartridge Factory was a former ammunition manufacturing site with a complicated environmental history. It was cold, hazardous and physically demanding to document.</p>
        <p>The survey happened in below-freezing February conditions. Steel-toed boots, layers, slow work and eventually equipment affected by the cold. Around the site, trees had been planted as part of environmental remediation efforts, helping address lead contamination tied to the site&apos;s industrial past.</p>
        <p>The finished Cartridge Brewing space makes the transformation look inevitable.</p>
        <p><strong>The before scan proves it was not.</strong></p>

        <div className="episode-image-grid">
          <EpisodeImage src={media.petersExterior} alt="Peter's Cartridge Factory exterior in winter before renovation." caption="Peter&apos;s Cartridge before reuse: a former ammunition site, cold, exposed and full of hard unknowns." />
          <EpisodeImage src={media.petersSmokestack} alt="Peter's Cartridge Factory smokestack and damaged industrial windows." caption="The industrial shell carried both identity and liability." />
          <EpisodeImage src={media.petersFieldPhoto} alt="Snowy field photo of Peter's Cartridge Factory before renovation." caption="The winter survey conditions were part of the story: freezing weather, steel-toed boots and equipment pushed to its limits." />
          <EpisodeImage src={media.petersBeforeWide} alt="Matterport view inside Peter's Cartridge Factory before renovation." caption="Before: a rough industrial interior captured as a navigable model instead of a guess." />
          <EpisodeImage src={media.petersBeforeConduit} alt="Matterport view of unfinished interior conditions at Peter's Cartridge Factory." caption="The before model preserved what the finished brewery can no longer show." />
          <EpisodeImage src={media.cartridgeBar} alt="Finished Cartridge Brewing bar after renovation." caption="After: a finished public space where the reuse story becomes visible." />
          <EpisodeImage src={media.cartridgeOverlook} alt="Overhead finished view of Cartridge Brewing after renovation." caption="The finished tour matters because it completes the arc: risk, documentation, reuse and public life." />
        </div>

        <h2>The Diagnostic Imaging Analogy</h2>
        <p>Reality capture is like diagnostic imaging for buildings.</p>
        <p>A scan does not diagnose asbestos. It does not replace environmental testing. It does not replace structural engineering. It does not make renovation easy.</p>
        <p>But like an X-ray or MRI, it lets more people see the same patient.</p>
        <p>When an entire building can be reduced to a shareable WebGL URL, expertise no longer has to be trapped on-site. Owners, investors, architects, consultants, contractors, public agencies and future users can all examine the same evidence before decisions get expensive.</p>
        <p>That changes the quality of the conversation.</p>
        <p>A building used to be trapped at its address. Reality capture turns it into a conversation.</p>

        <h2>Why This Matters for Public-Use Buildings</h2>
        <p>Any time a structure is intended for public use, the risks outweigh the rewards of doing it cheaply.</p>
        <p>A laser scan does not compromise the budget. It protects it.</p>
        <p>It helps the project operate with fewer reworks, fewer surprises and more stakeholder consensus. If the building will eventually hold employees, visitors, residents, customers, students, patients or the public, guessing is not frugal. It is risky.</p>
        <p><strong>The scan is not the luxury item.</strong></p>
        <p><strong>The rework is.</strong></p>

        <h2>Interview Questions and Notes</h2>
        <p>These are the working interview questions for the episode. Some are answered, some are intentionally left open so the final narration can be filled in from the audio interview.</p>
        <div className="episode-question-list">
          {interviewQuestions.map((item, index) => <section className="episode-question" key={item.question}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.question}</h3><p>{item.answer}</p>{item.media ? <div className="episode-media-placeholder">{item.media}</div> : null}</section>)}
        </div>

        <h2>Visual Storyboard</h2>
        <div className="episode-storyboard">
          <article><h3>Opening Image</h3><p>Matterport camera inside a damaged Carew Tower room, surrounded by failing ceiling conditions, damaged walls and daylight through old windows.</p></article>
          <article><h3>Blueprint Section</h3><p>Red-marked 19th and 20th floor plans pinned to a wall.</p></article>
          <article><h3>Carew Conditions</h3><p>Standing water on the roof, damaged interior conditions and the elegant elevator lobby.</p></article>
          <article><h3>Peter&apos;s Cartridge Before</h3><p>Exterior of the old factory and Matterport views of the unfinished industrial space.</p></article>
          <article><h3>Peter&apos;s Cartridge After</h3><p>Finished Cartridge Brewing views showing that the building did not need to disappear to become useful again.</p></article>
        </div>

        <h2>Working Narration Direction</h2>
        <p>This episode should sound like field notes from someone who has actually been in these buildings.</p>
        <p>Not a sales pitch. Not generic tech optimism. Not &quot;digital transformation&quot; language.</p>
        <ul><li>Existing drawings are not due diligence.</li><li>Cheap documentation can become expensive rework.</li><li>Historic buildings deserve honesty.</li><li>Reality capture does not make renovation easy.</li><li>Reality capture makes renovation honest.</li></ul>

        <h2>Possible Closing</h2>
        <p>Buildings do not lie on purpose.</p><p>They just keep secrets.</p><p>They hide water above ceilings, asbestos behind finishes, rerouted systems inside walls and decades of decisions that never made it back into the drawings.</p><p>Reality capture gives those secrets a place to surface before they become change orders, safety issues or missed opportunities.</p><p><strong>The scan is not the luxury item.</strong></p><p><strong>The rework is.</strong></p>
      </article>
      <aside className="podcast-sidebar episode-sidebar">
        <div className="podcast-note"><p><strong>Episode title:</strong> Your Building Is Lying to You</p></div>
        {matterportTours.map((tour) => <a href={tour.href} target="_blank" rel="noreferrer" key={tour.href}>{tour.label}</a>)}
        <Link href="/due-diligence">Due diligence services</Link>
        <Link href="/scan-to-bim-revit-cad">Scan-to-BIM services</Link>
      </aside>
    </section>
  </main>;
}
