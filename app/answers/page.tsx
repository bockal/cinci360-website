import type { Metadata } from "next";
import Link from "next/link";
import "../3d-laser-scanning-cincinnati/service-page.css";
import "./answers.css";

export const metadata: Metadata = {
  title: "3D Laser Scanning & Scan-to-BIM Answers",
  description: "Practical answers about 3D laser scanning, LiDAR, Matterport, point clouds, scan-to-BIM, Revit, CAD deliverables, accuracy, cost and project planning.",
  alternates: { canonical: "https://cinci360.com/answers" },
  openGraph: {
    type: "article",
    url: "https://cinci360.com/answers",
    title: "3D Laser Scanning & Scan-to-BIM Answers | Cinci360",
    description: "Straight answers for architects, builders, owners and facilities teams planning a reality-capture project.",
  },
};

const answers = [
  {
    id: "what-is-3d-laser-scanning",
    question: "What is 3D laser scanning for buildings?",
    answer: "3D laser scanning uses LiDAR to measure an existing building or site and create a dense, dimensionally useful point cloud. Project teams use that spatial record to understand current conditions, take measurements and produce CAD drawings or BIM models without relying on incomplete legacy plans.",
  },
  {
    id: "what-is-scan-to-bim",
    question: "What is scan-to-BIM?",
    answer: "Scan-to-BIM is the process of translating registered laser-scan or point-cloud data into a structured building information model, commonly in Autodesk Revit. The model scope should be agreed before capture so the field survey and final level of detail support the intended design or facilities workflow.",
  },
  {
    id: "deliverables",
    question: "What does a 3D laser scanning survey deliver?",
    answer: "Depending on scope, deliverables can include registered point clouds, E57 files, Matterport digital twins, Revit models, DWG drawings, PDF floor plans, elevations and sections. Cinci360 defines the handoff around the software and decisions the downstream team needs to make.",
  },
  {
    id: "matterport-vs-lidar",
    question: "What is the difference between Matterport and LiDAR scanning?",
    answer: "Matterport is especially useful for an intuitive, photographic walkthrough that stakeholders can open in a browser. Construction-grade LiDAR is selected when the priority is a registered point cloud and controlled geometric documentation. Some projects benefit from both: a visual digital twin for remote context and LiDAR data for CAD or BIM production.",
  },
  {
    id: "accuracy",
    question: "How accurate is 3D laser scanning and scan-to-BIM?",
    answer: "Accuracy is not one universal number. It depends on the scanner, distance, site conditions, registration method and how the model is produced. A responsible proposal states the capture method, required tolerance and model scope for the project’s intended use rather than promising the same accuracy for every building.",
  },
  {
    id: "cost",
    question: "How much does 3D laser scanning or scan-to-BIM cost?",
    answer: "Cost is driven by square footage, building complexity, access, travel, required field time, capture method and final deliverables. A point-cloud-only survey costs less than a coordinated package that also includes a Revit model, CAD drawings or a digital twin. An address, approximate area, existing plans and required file types are usually enough to begin a useful estimate.",
  },
  {
    id: "time",
    question: "How long does a building scan and BIM model take?",
    answer: "Field capture may take hours or several days depending on size, access and complexity. Processing and modeling follow the visit and depend on the required outputs. Cinci360 plans the schedule from the delivery date backward and identifies access or scope decisions that could affect turnaround.",
  },
  {
    id: "preparation",
    question: "How should a building be prepared for laser scanning?",
    answer: "Confirm the areas in scope, site access, working hours, safety requirements and any sensitive spaces. Open required rooms where possible and share existing drawings even if they may be outdated. The site usually does not need to be empty, but movement, blocked surfaces and changing conditions can affect the capture plan.",
  },
  {
    id: "architects",
    question: "How do architects use existing-condition scans?",
    answer: "Architects use point clouds, Revit models, floor plans and elevations to begin renovation or adaptive-reuse design from a measured record of the building. The data can reduce manual measuring, expose conflicts earlier and give consultants a common reference for remote coordination.",
  },
  {
    id: "facilities",
    question: "How do owners and facilities teams use digital twins?",
    answer: "A digital twin can provide remote visual access, measurement context and a shareable record of equipment, rooms and existing conditions. Its value depends on the operating workflow: some teams need an intuitive Matterport tour, while others need CAD, BIM or point-cloud data connected to their documentation process.",
  },
  {
    id: "choose-provider",
    question: "How should I choose a 3D scanning or scan-to-BIM provider?",
    answer: "Start with the required decision and deliverable, then ask who performs the field work, what capture system will be used, how registration and quality control are handled, who produces the model and what is explicitly included. Relevant project examples and clear exclusions matter more than a long equipment list.",
  },
  {
    id: "service-area",
    question: "Where does Cinci360 provide reality-capture services?",
    answer: "Cinci360 is based in Cincinnati and supports projects across Ohio, the Midwest and nationwide, with field technicians based in Cincinnati, Miami, New York and Denver. Both one-off buildings and coordinated multi-site programs can be scoped through one team.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://cinci360.com/answers#faq",
    mainEntity: answers.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://cinci360.com/" },
      { "@type": "ListItem", position: 2, name: "Answers", item: "https://cinci360.com/answers" },
    ],
  },
];

export default function AnswersPage() {
  return <main className="service-page answers-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="service-nav"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><nav><Link href="/projects/trek-waterloo">Trek case study</Link><Link href="/#contact">Start a project</Link></nav></header>
    <section className="answer-hero"><div><p className="eyebrow">Reality capture · Explained</p><h1>Clear answers before anyone enters the building.</h1><p>Practical guidance for architects, builders, owners and facilities teams planning 3D laser scanning, LiDAR, Matterport, CAD, Revit or scan-to-BIM work.</p></div><aside><p>Start with the decision you need to make.</p><strong>Then choose the capture and deliverables that support it.</strong></aside></section>
    <section className="answer-index" aria-label="Answer topics"><p className="eyebrow">12 common questions</p><div>{answers.map((item, index) => <a href={`#${item.id}`} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</a>)}</div></section>
    <section className="answer-list">{answers.map((item, index) => <article id={item.id} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{item.question}</h2><p>{item.answer}</p>{item.id === "deliverables" && <Link href="/projects/trek-waterloo">See the Trek facility case study →</Link>}{item.id === "what-is-scan-to-bim" && <Link href="/scan-to-bim-revit-cad">Explore Cinci360 scan-to-BIM services →</Link>}</div></article>)}</section>
    <section className="service-fit"><div><p className="eyebrow">Still defining the scope?</p><h2>Send us the building—not a perfect brief.</h2></div><p>An address, approximate square footage, existing plans and desired files are enough to start a practical conversation.</p><Link className="button button-gold" href="/#contact">Ask about your project</Link></section>
    <footer className="service-footer"><Link className="brand" href="/"><span>Cinci</span><strong>360</strong></Link><p>Reality capture · Scan-to-BIM · Practical answers</p><span>© 2026 Cinci360 · Cincinnati, Ohio</span></footer>
  </main>;
}
