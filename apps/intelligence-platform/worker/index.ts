import { analyzeVisualCaptures, loadPersistedVisualEvidence, persistVisualBatch } from "./visual-ingest";

interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_GBI_MODEL?: string;
  MATTERPORT_SDK_KEY?: string;
  BUILDING_DATA?: any;
}

type Building = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  matterportSid: string;
  useCase: string;
  intro: string;
  badges: string[];
  facts: Array<{ label: string; value: string }>;
  signals: Array<{ label: string; value: string }>;
  prompts: string[];
  evidence: Record<string, unknown>;
};

const BUILDINGS: Record<string, Building> = {
  "BLDG-001": {
    id: "BLDG-001",
    slug: "crc",
    name: "Cincinnati Rowing Club",
    subtitle: "Facility + asset intelligence",
    matterportSid: "qM1n2tF3CAQ",
    useCase: "Long-term facility intelligence",
    intro: "A digital twin with spatial geometry, observed building evidence, and an intelligence layer for risk, capacity, maintenance, renovation planning, and change over time.",
    badges: ["Matterport baseline live", "OBJ geometry ready", "Exterior enrichment pending"],
    facts: [
      { label: "Capture", value: "Pro3 interior baseline" },
      { label: "Geometry", value: "MatterPak OBJ indexed" },
      { label: "Next scan", value: "Exterior + rear entrance" }
    ],
    signals: [
      { label: "Model length", value: "161.5 ft" },
      { label: "Model width", value: "70.1 ft" },
      { label: "Model height", value: "30.2 ft" },
      { label: "Surface voxels", value: "18,547" }
    ],
    prompts: [
      "How many rowing shells are stored here, and what types are visible?",
      "What is the longest shell, and which rack positions can fit it?",
      "Where could we add rack capacity without narrowing circulation?",
      "What is the clearest path for moving shells through the building?",
      "Which visible assets belong in an equipment inventory?",
      "What maintenance or building-condition issues deserve a closer look?"
    ],
    evidence: {
      building: { id: "BLDG-001", name: "Cincinnati Rowing Club", matterportSid: "qM1n2tF3CAQ", scan: "SCAN-001 interior Pro3 baseline" },
      geometry: {
        source: "Matterport MatterPak OBJ",
        screeningOnly: true,
        extentsFeet: { length: 161.49, width: 70.14, height: 30.19 },
        vertexCount: 266255,
        faceCount: 508700,
        surfaceVoxelCount: 18547,
        voxelSizeMeters: 0.5
      },
      observedClasses: ["rowing shells", "boat storage racks", "outboard motors and support equipment", "lighting and visible structure", "doors and access paths (partial)"],
      knownGaps: ["full exterior", "current rear entrance configuration", "site circulation", "exterior drainage", "exterior utilities"]
    }
  },
  "BLDG-002": {
    id: "BLDG-002",
    slug: "bell",
    name: "Bell Event Centre",
    subtitle: "Event-planning + venue-sales intelligence",
    matterportSid: "RRUh81GAFtt",
    useCase: "Sell and plan the venue",
    intro: "Turn the venue tour into a planning assistant for couples, planners, vendors, and corporate clients before they ever step onsite.",
    badges: ["Historic venue", "MatterPak geometry ready", "Event-planning intelligence"],
    facts: [
      { label: "Published size", value: "18,160 sq ft" },
      { label: "Measured model envelope", value: "215.3 × 201.4 × 78.8 ft" },
      { label: "Published capacity", value: "250 ceremony + reception / 300 reception-only" }
    ],
    signals: [
      { label: "Model length", value: "215.25 ft" },
      { label: "Model width", value: "201.38 ft" },
      { label: "Model height", value: "78.84 ft" },
      { label: "Mesh", value: "291,536 vertices · 568,820 faces" }
    ],
    prompts: [
      "Can we seat 200 guests and still have room for a dance floor?",
      "Where would vendors load in, and what is the path to the event floor?",
      "How many restrooms are visible, and where are they relative to the main hall?",
      "Where could a band, DJ, photo booth, and bar fit without blocking guest flow?",
      "What should a caterer know about kitchen, staging, and service paths?",
      "What should a planner verify before signing a contract for this venue?"
    ],
    evidence: {
      building: { id: "BLDG-002", name: "Bell Event Centre", matterportSid: "RRUh81GAFtt" },
      geometry: {
        source: "Matterport MatterPak OBJ",
        screeningOnly: true,
        extentsFeet: { length: 215.25, width: 201.38, height: 78.84 },
        extentsMeters: { length: 65.609003, width: 61.382001, height: 24.029 },
        vertexCount: 291536,
        faceCount: 568820,
        surfaceAreaM2: 10808.12,
        surfaceVoxelCount: 37262,
        voxelSizeMeters: 0.5
      },
      publishedFacts: {
        sizeSquareFeet: 18160,
        floors: 2,
        built: 1850,
        formerUse: "St. Paul's Catholic Church",
        currentUses: ["weddings", "corporate events", "social gatherings"],
        capacity: { ceremonyAndReception: 250, receptionOnlyOrCorporate: 300 },
        operations: ["catering handled by venue", "bar services handled by venue", "day-of event coordinator provided", "free parking available", "wedding suites included for 3 hours before the event"],
        architecturalFeatures: ["vaulted ceilings", "stained glass windows", "hand-painted murals", "marble and terrazzo flooring"]
      },
      knownGaps: ["persistent panorama-derived visual index pending", "object-level segmentation is not yet attached, so exact dimensions of a specific chair/table/fixture should not be called measured yet", "event-layout recommendations should distinguish published capacity from geometry-derived screening"]
    }
  },
  "BLDG-003": {
    id: "BLDG-003",
    slug: "vues",
    name: "The Vues at Klinger Lake",
    subtitle: "Guest + booking intelligence",
    matterportSid: "EoSVoDF7wqa",
    useCase: "Sell the stay and answer guest questions",
    intro: "Turn the rental walkthrough into a 24/7 property concierge that helps guests understand fit, sleeping arrangements, amenities, lake access, and what to expect before they book.",
    badges: ["Sleeps 12", "MatterPak geometry ready", "Guest intelligence"],
    facts: [
      { label: "Sleeping", value: "4 bedrooms + loft · sleeps 12" },
      { label: "Measured model envelope", value: "279.4 × 179.3 × 96.2 ft" },
      { label: "Waterfront", value: "100 ft private shoreline + dock" }
    ],
    signals: [
      { label: "Model length", value: "279.39 ft" },
      { label: "Model width", value: "179.28 ft" },
      { label: "Model height", value: "96.22 ft" },
      { label: "Mesh", value: "276,941 vertices · 524,644 faces" }
    ],
    prompts: [
      "Can two families stay here comfortably, and who should sleep where?",
      "Which bedrooms are closest to bathrooms?",
      "Can we park two cars and charge an EV at the same time?",
      "What lake gear is included, and where is it stored?",
      "What should parents of young children know before booking?",
      "What should guests bring that the house does not appear to provide?"
    ],
    evidence: {
      building: { id: "BLDG-003", name: "The Vues at Klinger Lake", matterportSid: "EoSVoDF7wqa" },
      geometry: {
        source: "Matterport MatterPak OBJ",
        screeningOnly: true,
        extentsFeet: { length: 279.39, width: 179.28, height: 96.22 },
        extentsMeters: { length: 85.159008, width: 54.646002, height: 29.328002 },
        vertexCount: 276941,
        faceCount: 524644,
        surfaceAreaM2: 12388.94
      },
      publishedFacts: {
        guests: 12,
        bedrooms: "4 bedrooms + loft sleeping area",
        bathrooms: 3,
        shorelineFeet: 100,
        deckSquareFeet: 1021,
        amenities: ["private dock / pier", "kayaks included", "pontoon or jet-ski rental may be requested for $100/day, subject to approval and availability", "universal electric vehicle charger", "reverse-osmosis drinking water tap", "full kitchen", "high-speed Wi-Fi", "central air conditioning", "washer and dryer", "2 driveway spaces plus off-street parking"],
        checkIn: "after 4:00 p.m.",
        checkOut: "by 10:00 a.m."
      },
      knownGaps: ["persistent panorama-derived visual index pending", "object-level segmentation is not yet attached, so exact dimensions of a specific bed, table, dock element, or fixture should not be called measured yet", "guest-fit recommendations should distinguish published property facts from geometry-derived screening"]
    }
  }
};

const BUILDINGS_BY_SLUG = Object.values(BUILDINGS).reduce<Record<string, Building>>((all, building) => {
  all[building.slug] = building;
  return all;
}, {});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function outputText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  return (payload?.output ?? [])
    .flatMap((item: any) => item.content ?? [])
    .filter((part: any) => part.type === "output_text" && typeof part.text === "string")
    .map((part: any) => part.text)
    .join("\n");
}

async function reasonAboutBuilding(building: Building, question: string, env: Env) {
  const model = env.OPENAI_GBI_MODEL || "gpt-6-luna";
  const persistedVisual = await loadPersistedVisualEvidence(building, env);
  const combinedEvidence = persistedVisual ? { ...building.evidence, visualInventory: persistedVisual } : building.evidence;
  const prompt = `You are Cinci360 Building Intelligence for ${building.id}, ${building.name}.

Commercial use case: ${building.useCase}.

Use the supplied evidence to give the most useful answer possible. Distinguish:
- MEASURED: geometry-derived facts
- OBSERVED: directly supported by supplied visual or published evidence
- INFERRED: reasonable interpretation, clearly qualified
- ADVISED: recommendation with assumptions

Always answer the question. When direct evidence is incomplete, give the best evidence-based estimate rather than stopping at "insufficient." Attach an explicit confidence percentage and explain what would raise or lower confidence.

Do not fabricate exact dimensions, hidden conditions, code compliance, ages, costs, serial numbers, market value, or unseen facts. If no OBJ geometry is attached, never call an exact physical dimension "measured." You may make a qualified estimate from building type, published facts, current evidence, and common patterns, but label it INFERRED.

Building evidence:
${JSON.stringify(combinedEvidence)}

User question:
${question}

Respond in concise plain language:
CLASSIFICATION — CONFIDENCE%
Answer: <best useful answer>
Why: <short evidence-based reasoning>
What would confirm it: <one short sentence when confidence is below 90%>`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      store: false
    })
  });

  const payload: any = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Reasoning service failed with HTTP ${response.status}.`);
  const answer = outputText(payload).trim();
  if (!answer) throw new Error("Reasoning service returned no answer.");
  return answer;
}


type CostSegItem = {
  component: string;
  quantity: string;
  evidenceBasis: string;
  replacementCostLow: number | null;
  replacementCostHigh: number | null;
  proposedClass: string;
  confidence: number;
};

type CostSegSection = {
  title: string;
  sectionConfidence: number;
  items: CostSegItem[];
};

type GeneratedCostSegStudy = {
  buildingId: string;
  buildingName: string;
  overallConfidence: number;
  executiveSummary: string;
  totalReplacementCostLow: number | null;
  totalReplacementCostHigh: number | null;
  sections: CostSegSection[];
  missingInputs: string[];
  caveats: string[];
};

function parseJsonObject(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Cost segregation model did not return JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generateCostSegStudy(building: Building, env: Env): Promise<GeneratedCostSegStudy> {
  const model = env.OPENAI_GBI_MODEL || "gpt-6-luna";
  const persistedVisual = await loadPersistedVisualEvidence(building, env);
  const combinedEvidence = persistedVisual ? { ...building.evidence, visualInventory: persistedVisual } : building.evidence;
  const prompt = `You are Cinci360 Building Intelligence generating a COST SEGREGATION SCREENING STUDY.

TEST RULE: Use ONLY the property-specific data inside BUILDING_EVIDENCE below. Do not use web search, prior knowledge about this named property, owner documents, prior cost segregation reports, or any property-specific facts not present in BUILDING_EVIDENCE.

You may use general professional knowledge to:
- identify plausible depreciable component categories implied by the evidence,
- propose broad MACRS-style recovery classes for CPA review,
- estimate broad replacement-cost RANGES when a quantity or property fact in the evidence supports a reasonable estimate.

Do not invent quantities, counts, square footage, equipment, finishes, systems, ages, or conditions that are not in the evidence. If an asset category is merely plausible but not evidenced, omit it rather than fabricate it.

Evidence labels:
- MEASURED = directly from attached MatterPak/OBJ geometry
- OBSERVED = explicitly listed in evidence
- PUBLISHED = explicitly supplied in the building record
- INFERRED = model interpretation from those facts

For cost ranges:
- return null when current evidence is too weak to support even a screening range.
- otherwise make the range intentionally broad and explain the evidence basis.
- do not allocate tax basis. Replacement-cost screening is not taxpayer basis.

For proposed classes:
- use plain labels such as "5-year candidate", "7-year candidate", "15-year candidate", "39-year building candidate", "Mixed / CPA review", or "Insufficient evidence".
- This is a screening hypothesis, not tax advice.

BUILDING_EVIDENCE:
${JSON.stringify(combinedEvidence)}

Return ONLY valid JSON with exactly this shape:
{
  "buildingId": "${building.id}",
  "buildingName": "${building.name}",
  "overallConfidence": 0,
  "executiveSummary": "",
  "totalReplacementCostLow": null,
  "totalReplacementCostHigh": null,
  "sections": [
    {
      "title": "",
      "sectionConfidence": 0,
      "items": [
        {
          "component": "",
          "quantity": "",
          "evidenceBasis": "",
          "replacementCostLow": null,
          "replacementCostHigh": null,
          "proposedClass": "",
          "confidence": 0
        }
      ]
    }
  ],
  "missingInputs": [],
  "caveats": []
}

Confidence values are integers 0-100. Include 3-6 useful sections when evidence supports them. Keep the study concise enough for a web page but detailed enough to evaluate whether the app can produce a useful first-pass study.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      store: false
    })
  });

  const payload: any = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Cost segregation generation failed with HTTP ${response.status}.`);
  const raw = outputText(payload).trim();
  const parsed = parseJsonObject(raw) as GeneratedCostSegStudy;
  parsed.buildingId = building.id;
  parsed.buildingName = building.name;
  return parsed;
}

function generatedCostSegHtml(building: Building) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#111618"><title>Cinci360 Intelligence · Cost Segregation Test · ${building.name}</title><style>
*{box-sizing:border-box}body{margin:0;background:#f1eee7;color:#111618;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.shell{width:min(1260px,calc(100% - 28px));margin:0 auto;padding:24px 0 70px}header{display:flex;justify-content:space-between;gap:16px;align-items:center}.brand a,.back{color:inherit;text-decoration:none;font-weight:850}.back{font-size:13px}.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:end;padding:62px 0 26px}.eyebrow{font-size:12px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.hero h1{font-family:Georgia,serif;font-size:clamp(48px,7vw,86px);font-weight:400;letter-spacing:-.05em;line-height:.92;margin:10px 0 16px}.lede{max-width:760px;font-size:18px;line-height:1.6;color:#535956}.test-box{background:#e8f0e9;border:1px solid #c9d8ca;border-radius:16px;padding:16px;line-height:1.55;font-size:13px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0 24px}.metric{background:#fff;border:1px solid #d7d2c9;border-radius:18px;padding:18px}.metric span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#747a76}.metric strong{display:block;font-family:Georgia,serif;font-size:28px;font-weight:400;margin-top:8px}.status{background:#111618;color:#fff;border-radius:18px;padding:18px;margin:16px 0}.status button{border:0;border-radius:999px;background:#fff;color:#111618;padding:10px 14px;font-weight:850;cursor:pointer}.study{display:grid;gap:16px}.schedule{background:#fff;border:1px solid #d7d2c9;border-radius:20px;overflow:hidden}.schedule-head{display:flex;justify-content:space-between;gap:20px;padding:20px 22px;border-bottom:1px solid #e6e1d8}.schedule-head h2{font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0}.schedule-head span{font-size:12px;color:#6b716e}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:900px}th,td{text-align:left;padding:12px 14px;border-bottom:1px solid #eee9e1;font-size:12px;vertical-align:top}th{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#747a76;background:#faf9f6}.money{font-weight:800}.notes{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}.note-card{background:#fff;border:1px solid #d7d2c9;border-radius:18px;padding:18px}.note-card h3{margin:0 0 10px}.note-card ul{padding-left:18px;margin:0}.note-card li{margin:7px 0;line-height:1.45}.muted{font-size:12px;color:#6b716e;line-height:1.55}.evidence-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:18px 22px}.evidence-item{border:1px solid #e4dfd6;border-radius:14px;padding:13px;background:#faf9f6}.evidence-item strong{display:block;margin-bottom:5px}.evidence-meta{font-size:11px;color:#6b716e;line-height:1.45}.evidence-empty{padding:18px 22px}.evidence-empty a{display:inline-block;margin-top:8px;background:#111618;color:#fff;text-decoration:none;border-radius:999px;padding:10px 13px;font-weight:800;font-size:12px}.error{background:#fff0ee;border:1px solid #e3bdb7;color:#7c251c;border-radius:16px;padding:14px}@media(max-width:850px){.hero{grid-template-columns:1fr}.summary{grid-template-columns:1fr 1fr}.notes{grid-template-columns:1fr}.schedule-head{flex-direction:column}}@media(max-width:520px){.summary{grid-template-columns:1fr}}
</style></head><body><main class="shell"><header><div class="brand"><a href="/">Cinci360 Intelligence</a></div><a class="back" href="/${building.slug}">← Back to ${building.id}</a></header><section class="hero"><div><p class="eyebrow">${building.id} · app-data-only test</p><h1>Cost segregation screening.</h1><p class="lede">This study is generated from the evidence already inside the Building Intelligence app for ${building.name}. No owner cost-segregation report is supplied to the generator.</p></div><div class="test-box"><strong>Blind test</strong><br>Property-specific inputs are restricted to this building's current app record and MatterPak-derived geometry. Replacement-cost ranges and proposed recovery classes are screening estimates for review, not tax basis or tax advice.</div></section><section class="summary"><div class="metric"><span>Building</span><strong>${building.id}</strong></div><div class="metric"><span>MatterPak</span><strong>Ready</strong></div><div class="metric"><span>Generator source</span><strong>App data</strong></div><div class="metric"><span>Tax status</span><strong>Screening</strong></div></section><section class="status"><div id="statusText">Generating a blind first-pass study from current app evidence…</div><p><button id="regen" type="button">Regenerate test</button></p></section><div id="study" class="study"></div><section class="schedule" style="margin-top:16px"><div class="schedule-head"><div><h2>Visual evidence used</h2><p class="muted">Assets and building components already extracted from Matterport panoramas for this building.</p></div><span id="evidenceCount">Checking evidence…</span></div><div id="visualEvidence"></div></section></main><script>
const studyEl=document.getElementById("study"),statusText=document.getElementById("statusText"),regen=document.getElementById("regen"),visualEvidence=document.getElementById("visualEvidence"),evidenceCount=document.getElementById("evidenceCount");
const usd=n=>n==null?"—":new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const esc=v=>String(v==null?"":v).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
function render(data){
  let sections="";
  (data.sections||[]).forEach((s,i)=>{
    let rows="";
    (s.items||[]).forEach(item=>{
      rows += "<tr><td><strong>"+esc(item.component)+"</strong></td><td>"+esc(item.quantity||"—")+"</td><td>"+esc(item.evidenceBasis)+"</td><td class='money'>"+usd(item.replacementCostLow)+" – "+usd(item.replacementCostHigh)+"</td><td>"+esc(item.proposedClass)+"</td><td>"+esc(item.confidence ?? 0)+"%</td></tr>";
    });
    sections += "<section class='schedule'><div class='schedule-head'><h2>"+String(i+1).padStart(2,"0")+" · "+esc(s.title||"Section")+"</h2><span>Section confidence: "+esc(s.sectionConfidence ?? 0)+"%</span></div><div class='table-wrap'><table><thead><tr><th>Component</th><th>Qty / extent</th><th>Evidence basis</th><th>Replacement-cost range</th><th>Proposed class</th><th>Confidence</th></tr></thead><tbody>"+rows+"</tbody></table></div></section>";
  });
  let missing="";
  (data.missingInputs||[]).forEach(x=>{ missing += "<li>"+esc(x)+"</li>"; });
  let caveats="";
  (data.caveats||[]).forEach(x=>{ caveats += "<li>"+esc(x)+"</li>"; });
  studyEl.innerHTML = "<section class='schedule'><div class='schedule-head'><div><h2>Executive screening</h2><p class='muted'>"+esc(data.executiveSummary||"")+"</p></div><span>Overall confidence: "+esc(data.overallConfidence ?? 0)+"%</span></div><div style='padding:18px 22px'><strong>Estimated replacement-cost range represented by supported items: "+usd(data.totalReplacementCostLow)+" – "+usd(data.totalReplacementCostHigh)+"</strong><p class='muted'>This is a replacement-cost screening range, not tax basis.</p></div></section>"+sections+"<section class='notes'><div class='note-card'><h3>Missing inputs</h3><ul>"+(missing||"<li>None listed.</li>")+"</ul></div><div class='note-card'><h3>Caveats</h3><ul>"+(caveats||"<li>None listed.</li>")+"</ul></div></section>";
}
async function load(){
  regen.disabled=true;statusText.textContent="Generating a blind first-pass study from current app evidence…";studyEl.innerHTML="";
  try{
    const r=await fetch("/api/buildings/${building.id}/cost-seg",{method:"POST"});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||"Generation failed.");
    statusText.textContent="Generated from current Building Intelligence evidence only.";
    render(data.study);
  }catch(e){
    statusText.textContent="The screening study could not be generated.";
    studyEl.innerHTML="<div class='error'>"+esc(e && e.message ? e.message : "Unknown error")+"</div>";
  }finally{regen.disabled=false}
}
async function loadEvidence(){
  try{
    const r=await fetch("/api/buildings/${building.id}/evidence",{cache:"no-store"});
    const data=await r.json();
    const items=data.visualInventory&&Array.isArray(data.visualInventory.items)?data.visualInventory.items:[];
    evidenceCount.textContent=items.length+" visual observations";
    if(!items.length){
      visualEvidence.innerHTML="<div class='evidence-empty'>No persisted panorama-derived visual inventory exists yet for this building.<br><a href='/${building.slug}/ingest'>Build visual evidence →</a></div>";
      return;
    }
    visualEvidence.innerHTML="<div class='evidence-grid'>"+items.map(item=>{
      const sweeps=(item.evidenceSweepIds||[]).join(", ");
      return "<div class='evidence-item'><strong>"+esc(item.visibleName||item.category||"Observed asset")+"</strong><div>"+esc(item.description||"")+"</div><div class='evidence-meta'>Category: "+esc(item.category||"")+" · Qty: "+esc(item.quantity??"—")+" · Confidence: "+Math.round(Number(item.confidence||0)*100)+"%<br>Evidence sweeps: "+esc(sweeps||"not listed")+"<br>"+esc(item.notes||"")+"</div></div>";
    }).join("")+"</div>";
  }catch(e){
    evidenceCount.textContent="Evidence unavailable";
    visualEvidence.innerHTML="<div class='evidence-empty'>Visual evidence could not be loaded.</div>";
  }
}
regen.addEventListener("click",load);load();loadEvidence();
</script></body></html>`;
}

function ingestionHtml(building: Building, sdkKey: string) {
  const key = JSON.stringify(sdkKey || "");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cinci360 · Visual ingestion · ${building.name}</title><style>
body{font-family:Inter,system-ui,sans-serif;background:#f1eee7;color:#111618;margin:0}.shell{max-width:1180px;margin:auto;padding:24px}.head{display:flex;justify-content:space-between;gap:20px;align-items:center}.card{background:#fff;border:1px solid #d8d3ca;border-radius:18px;padding:18px;margin:14px 0}.viewer{height:520px;background:#111;border-radius:14px;overflow:hidden}.viewer iframe{width:100%;height:100%;border:0}button{border:0;border-radius:999px;padding:12px 16px;font-weight:850;background:#111618;color:#fff;cursor:pointer}button:disabled{opacity:.5}.progress{height:12px;background:#e5e1d9;border-radius:999px;overflow:hidden}.progress span{display:block;height:100%;background:#111618;width:0}.mono{font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;white-space:pre-wrap;line-height:1.5;max-height:360px;overflow:auto}.pill{font-size:12px;border:1px solid #d8d3ca;border-radius:999px;padding:7px 10px;background:#fff}.muted{color:#666d69}.actions{display:flex;gap:10px;flex-wrap:wrap}
</style></head><body><main class="shell"><div class="head"><div><div class="pill">${building.id} · ingestion</div><h1>${building.name}</h1><p class="muted">Capture Matterport sweeps, analyze visible building evidence, and persist the result to Cloudflare R2.</p></div><a href="/${building.slug}">Back to building</a></div><div class="card"><div class="viewer"><iframe id="mp" src="https://my.matterport.com/show/?m=${building.matterportSid}&play=1&qs=1&help=0&applicationKey=${encodeURIComponent(sdkKey)}" allow="autoplay; fullscreen; web-share; xr-spatial-tracking"></iframe></div></div><div class="card"><div id="keyPanel" style="display:none;margin-bottom:14px"><label for="sdkInput" style="display:block;font-weight:800;margin-bottom:6px">Matterport SDK application key</label><div class="actions"><input id="sdkInput" type="password" autocomplete="off" placeholder="Paste SDK key for this browser" style="flex:1;min-width:280px;border:1px solid #d8d3ca;border-radius:12px;padding:11px 12px;font:inherit"><button id="saveKey" type="button">Use this key</button></div><p class="muted" style="font-size:12px">Stored only in this browser's localStorage for the ingestion console. It is not written to GitHub or R2. Ingestion is resume-safe: already persisted sweeps are skipped on restart.</p></div><div class="actions"><button id="run">Start visual ingestion</button><button id="stop" disabled>Stop</button></div><p id="status">Ready.</p><div class="progress"><span id="bar"></span></div><div id="log" class="mono"></div></div></main><script type="module">
const SDK_BOOTSTRAP="https://api.matterport.com/sdk/bootstrap/3.0.0-0-g0517b8d76c/sdk.es6.js";
let sdkKey=${key} || localStorage.getItem("cinci360:matterport-sdk-key") || "";
const iframe=document.getElementById("mp"),run=document.getElementById("run"),stop=document.getElementById("stop"),status=document.getElementById("status"),bar=document.getElementById("bar"),log=document.getElementById("log"),keyPanel=document.getElementById("keyPanel"),sdkInput=document.getElementById("sdkInput"),saveKey=document.getElementById("saveKey");
if(!sdkKey)keyPanel.style.display="block";
saveKey.onclick=()=>{const v=sdkInput.value.trim();if(!v)return;sdkKey=v;localStorage.setItem("cinci360:matterport-sdk-key",v);keyPanel.style.display="none";say("Matterport SDK key loaded for this browser.");};
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let stopped=false;
function say(s){status.textContent=s;log.textContent+=s+"\\n";log.scrollTop=log.scrollHeight}
stop.onclick=()=>{stopped=true;say("Stop requested…")};
run.onclick=async()=>{
  if(!sdkKey){keyPanel.style.display="block";say("Matterport SDK key is not configured. Paste it above for this browser.");return}
  stopped=false;run.disabled=true;stop.disabled=false;
  try{
    say("Connecting to Matterport…");
    const nextSrc="https://my.matterport.com/show/?m=${building.matterportSid}&play=1&qs=1&help=0&applicationKey="+encodeURIComponent(sdkKey);
    if(!iframe.src.includes("applicationKey="+encodeURIComponent(sdkKey))){iframe.src=nextSrc;await sleep(1200);}
    const mod=await import(SDK_BOOTSTRAP+"?applicationKey="+encodeURIComponent(sdkKey));
    const sdk=await mod.connect(iframe);
    await sdk.App.state.waitUntil(s=>s.phase===sdk.App.Phase.PLAYING);
    const model=await sdk.Model.getData();
    const sweeps=model.sweeps||[];
    say("Connected: "+sweeps.length+" sweeps.");

    let doneSet=new Set();
    try{
      const er=await fetch("/api/buildings/${building.id}/evidence",{cache:"no-store"});
      const et=await er.text();
      const ed=JSON.parse(et);
      const vi=ed.visualInventory||null;
      const explicit=vi&&Array.isArray(vi.processedSweepIds)?vi.processedSweepIds:[];
      const inferred=vi&&Array.isArray(vi.items)?vi.items.flatMap(item=>Array.isArray(item.evidenceSweepIds)?item.evidenceSweepIds:[]):[];
      doneSet=new Set([...explicit,...inferred]);
    }catch{}
    const pending=sweeps.filter(s=>!doneSet.has(s.sid));
    say("Resume check: "+doneSet.size+" sweeps already persisted; "+pending.length+" remaining.");
    bar.style.width=Math.round((doneSet.size/Math.max(sweeps.length,1))*100)+"%";
    if(!pending.length){say("All sweeps are already persisted.");return;}

    const batchSize=4;
    for(let i=0;i<pending.length&&!stopped;i+=batchSize){
      const batch=pending.slice(i,i+batchSize),captures=[];
      for(const sweep of batch){
        if(stopped)break;
        await sdk.Sweep.moveTo(sweep.sid,{rotation:{x:0,y:0},transition:sdk.Sweep.Transition.INSTANT,transitionTime:0});
        await sleep(300);
        captures.push({sweepId:sweep.sid,floor:typeof sweep.floor==="number"?sweep.floor:null,position:sweep.position||null,imageDataUri:await sdk.Renderer.takeEquirectangular()});
      }
      if(!captures.length)break;
      const first=i+1,last=Math.min(i+captures.length,pending.length);
      say("Analyzing remaining sweeps "+first+"-"+last+"…");
      const r=await fetch("/api/buildings/${building.id}/ingest-visual",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({captures})});
      const raw=await r.text();
      let data=null;
      try{data=JSON.parse(raw)}catch{}
      if(!r.ok){
        const msg=data&&data.error?data.error:("Ingestion API returned HTTP "+r.status+(raw.startsWith("<")?" (HTML error page)":""));
        throw new Error(msg);
      }
      if(!data)throw new Error("Ingestion API returned a non-JSON response.");
      captures.forEach(x=>doneSet.add(x.sweepId));
      say("Batch complete: "+(data.batchItems||0)+" observations; persistent total "+(data.itemCount??"unknown")+"; sweeps saved "+doneSet.size+"/"+sweeps.length);
      bar.style.width=Math.round((doneSet.size/Math.max(sweeps.length,1))*100)+"%";
    }
    say(stopped?"Ingestion stopped.":"Visual ingestion complete.");
  }catch(e){say("ERROR: "+(e&&e.message?e.message:String(e)))}finally{run.disabled=false;stop.disabled=true}
};
</script></body></html>`;
}


const VUES_COST_SEG = {
  prepared: "June 2026",
  status: "Benchmark prototype",
  sourceNote: "Seeded from the existing owner-prepared cost segregation estimate so Building Intelligence can be benchmarked against a known study. This page is not claiming the current scan generated these values yet.",
  sections: [
    {
      title: "Building envelope",
      replacementValue: 404712,
      recovery: "Source study: 15-year treatment proposed",
      items: [
        ["Siding & roof", "3,300 sq ft", 27000, "15-year proposed"],
        ["Framing & paint", "3,300 sq ft", 75000, "15-year proposed"],
        ["Outside walls", "3,300 sq ft", 17165, "15-year proposed"],
        ["Hardwood flooring", "848 sq ft", 22468, "15-year proposed"],
        ["Luxury vinyl plank", "1,406 sq ft", 12802, "15-year proposed"],
        ["Tile flooring", "228 sq ft", 2192, "15-year proposed"],
        ["Carpet", "489 sq ft", 2898, "15-year proposed"],
        ["Doors", "28", 14000, "15-year proposed"],
        ["Windows", "53", 53000, "15-year proposed"],
        ["Lights", "58", 17400, "15-year proposed"],
        ["Outlets", "53", 5300, "15-year proposed"],
        ["Plumbing fixtures", "28", 28000, "15-year proposed"]
      ]
    },
    {
      title: "Dock & waterfront",
      replacementValue: 96920,
      recovery: "Source study: 15-year land improvements + 5/7-year personal property",
      items: [
        ["Main dock structure", "1", 42000, "15-year proposed"],
        ["Aluminum dock frame & posts", "1", 9500, "15-year proposed"],
        ["Dock ladder", "2", 600, "15-year proposed"],
        ["Dock lighting", "6", 900, "15-year proposed"],
        ["Dock seating", "1", 5000, "15-year proposed"],
        ["Boat lift", "1", 3500, "15-year proposed"],
        ["Jet ski lift", "1", 1500, "15-year proposed"],
        ["Dock cleats", "4", 300, "15-year proposed"],
        ["2006 Bennington pontoon boat", "1", 18000, "5/7-year proposed"],
        ["1997 Larson runabout boat", "1", 6000, "5/7-year proposed"],
        ["Yamaha Wave Raider", "1", 5000, "5/7-year proposed"],
        ["Sunfish sailboat", "1", 1200, "5/7-year proposed"],
        ["Kayaks", "3", 1500, "5/7-year proposed"],
        ["Innertubes", "6", 720, "5/7-year proposed"],
        ["Waterskis", "4 pairs", 1200, "5/7-year proposed"]
      ]
    },
    {
      title: "Kitchen",
      replacementValue: 73400,
      recovery: "Source study: improvements + 5/7-year personal property",
      items: [
        ["KraftMaid cabinetry", "1 set", 26000, "15-year proposed"],
        ["Quartz countertops", "1 set", 9500, "15-year proposed"],
        ["Farm sink & faucet", "1 set", 1400, "15-year proposed"],
        ["Tile backsplash", "1 set", 2000, "15-year proposed"],
        ["Kitchen appliances", "1 set", 14000, "5-year proposed"],
        ["Dining sets", "3 sets", 5500, "7-year proposed"],
        ["Pots & pans", "1 set", 3000, "5-year proposed"],
        ["Dinnerware", "1 set", 2500, "5-year proposed"],
        ["Glassware", "1 lot", 2200, "5-year proposed"],
        ["Mugs & coffee cups", "1 lot", 800, "5-year proposed"],
        ["Small appliances", "1 lot", 2000, "7-year proposed"],
        ["Food processor / countertop appliances", "1 lot", 2000, "7-year proposed"],
        ["Bakeware", "1 lot", 1000, "5-year proposed"],
        ["Serving pieces", "1 lot", 1500, "5-year proposed"],
        ["Pantry / kitchen accessories", "1 lot", 1000, "5-year proposed"]
      ]
    },
    {
      title: "Utilities, mechanical & waterproofing",
      replacementValue: 29000,
      recovery: "Source study: 5-year and 15-year proposed classes",
      items: [
        ["Furnace & air handler", "1 set", 6000, "5-year proposed"],
        ["Ductwork", "1 lot", 2000, "15-year proposed"],
        ["Thermostat & controls", "1", 400, "5-year proposed"],
        ["Return / supply vents & registers", "1 lot", 600, "5-year proposed"],
        ["Water heater", "1", 1600, "5-year proposed"],
        ["Primary sump pump", "1", 900, "5-year proposed"],
        ["Secondary / backup sump pump", "1", 900, "5-year proposed"],
        ["Discharge piping & check valves", "1 lot", 400, "15-year proposed"],
        ["Crawlspace waterproofing system", "1 lot", 12800, "15-year proposed"],
        ["Electrical panel", "1", 1400, "5-year proposed"],
        ["Universal EV charger", "1", 1000, "5-year proposed"]
      ]
    },
    {
      title: "Living areas & outdoor entertaining",
      replacementValue: 51750,
      recovery: "Source study: mostly 7-year personal property + selected improvements",
      items: [
        ["Living room furniture & decor", "Room group", 5600, "7-year proposed"],
        ["Second living room furniture & decor", "Room group", 4000, "7-year proposed"],
        ["Dining room furnishings", "Room group", 4350, "7-year proposed"],
        ["Bathroom remodel contents", "Room group", 4800, "Mixed"],
        ["Laundry room equipment & storage", "Room group", 3150, "7-year proposed"],
        ["Outdoor deck furniture / grill / canopy", "Room group", 4650, "7-year proposed"],
        ["Built-in kitchen-side cabinetry", "1 set", 1800, "15-year proposed"]
      ]
    },
    {
      title: "Upper level sleeping areas & bathrooms",
      replacementValue: 58940,
      recovery: "Source study: 7-year personal property + 15-year improvements",
      items: [
        ["Bedroom 1", "Room group", 6550, "Mixed"],
        ["Bedroom 2", "Room group", 4550, "7-year proposed"],
        ["Bedroom 3", "Room group", 3250, "7-year proposed"],
        ["Bedroom 4", "Room group", 4350, "7-year proposed"],
        ["Hall bathroom", "Room group", 2200, "Mixed"],
        ["Primary bathroom", "Room group", 4100, "Mixed"],
        ["Closets / hallway linens & storage", "Room group", 3940, "7-year proposed"]
      ]
    }
  ]
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function costSegHtml() {
  const building = BUILDINGS["BLDG-003"];
  const total = VUES_COST_SEG.sections.reduce((sum, section) => sum + section.replacementValue, 0);
  const sectionCards = VUES_COST_SEG.sections.map((section, index) => {
    const rows = section.items.map(item => `<tr><td>${item[0]}</td><td>${item[1]}</td><td>${money(item[2] as number)}</td><td>${item[3]}</td></tr>`).join("");
    return `<section class="schedule"><div class="schedule-head"><div><span class="section-no">0${index + 1}</span><h2>${section.title}</h2><p>${section.recovery}</p></div><div class="section-total"><span>Replacement value</span><strong>${money(section.replacementValue)}</strong></div></div><div class="table-wrap"><table><thead><tr><th>Asset / component</th><th>Qty</th><th>Replacement value</th><th>Source-study class</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#111618"><title>Cinci360 Intelligence · Cost Segregation · The Vues</title><style>
*{box-sizing:border-box}body{margin:0;background:#f1eee7;color:#111618;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.shell{width:min(1260px,calc(100% - 28px));margin:0 auto;padding:24px 0 70px}header{display:flex;justify-content:space-between;gap:16px;align-items:center}.brand a,.back{color:inherit;text-decoration:none;font-weight:850}.back{font-size:13px}.hero{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:end;padding:62px 0 28px}.eyebrow{font-size:12px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.hero h1{font-family:Georgia,serif;font-size:clamp(48px,7vw,88px);font-weight:400;letter-spacing:-.05em;line-height:.92;margin:10px 0 16px}.lede{max-width:760px;font-size:18px;line-height:1.6;color:#535956}.prototype{background:#fff7d8;border:1px solid #e5d89a;border-radius:16px;padding:16px;line-height:1.5;font-size:13px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0 26px}.metric{background:#fff;border:1px solid #d7d2c9;border-radius:18px;padding:18px}.metric span{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#737975}.metric strong{display:block;font-family:Georgia,serif;font-weight:400;font-size:30px;margin-top:8px}.workflow{background:#111618;color:#fff;border-radius:20px;padding:20px;margin-bottom:18px}.workflow h2{margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:30px}.flow{display:flex;flex-wrap:wrap;gap:8px}.flow span{border:1px solid #3a4142;border-radius:999px;padding:8px 11px;font-size:12px}.schedule{background:#fff;border:1px solid #d7d2c9;border-radius:20px;margin-top:16px;overflow:hidden}.schedule-head{display:flex;justify-content:space-between;gap:20px;padding:20px 22px;border-bottom:1px solid #e6e1d8}.schedule-head h2{font-family:Georgia,serif;font-size:30px;font-weight:400;margin:2px 0 4px}.schedule-head p{margin:0;color:#686e6b;font-size:13px}.section-no{font-size:11px;letter-spacing:.12em;color:#7b817d}.section-total{text-align:right;min-width:180px}.section-total span{display:block;font-size:11px;color:#747a76;text-transform:uppercase;letter-spacing:.08em}.section-total strong{display:block;font-size:24px;margin-top:6px}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:760px}th,td{text-align:left;padding:12px 16px;border-bottom:1px solid #eee9e1;font-size:13px}th{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#747a76;background:#faf9f6}td:nth-child(3){font-weight:800}.footer-note{font-size:12px;line-height:1.6;color:#6b716e;margin:20px 4px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.button{display:inline-block;background:#111618;color:#fff;text-decoration:none;border-radius:999px;padding:12px 16px;font-weight:800;font-size:13px}.button.secondary{background:#fff;color:#111618;border:1px solid #d7d2c9}@media(max-width:850px){.hero{grid-template-columns:1fr}.summary{grid-template-columns:1fr 1fr}.schedule-head{flex-direction:column}.section-total{text-align:left}}@media(max-width:520px){.summary{grid-template-columns:1fr}}
</style></head><body><main class="shell"><header><div class="brand"><a href="/">Cinci360 Intelligence</a></div><a class="back" href="/vues">← Back to Building 003</a></header><section class="hero"><div><p class="eyebrow">Building 003 · The Vues at Klinger Lake</p><h1>Cost segregation intelligence.</h1><p class="lede">A product prototype showing how the building record can become an asset inventory, quantity takeoff, replacement-cost schedule, and tax-review workpaper.</p></div><div class="prototype"><strong>${VUES_COST_SEG.status}</strong><br>${VUES_COST_SEG.sourceNote}</div></section><section class="summary"><div class="metric"><span>Study schedules represented</span><strong>6</strong></div><div class="metric"><span>Replacement value represented</span><strong>${money(total)}</strong></div><div class="metric"><span>MatterPak geometry</span><strong>Ready</strong></div><div class="metric"><span>Next automation target</span><strong>Asset extraction</strong></div></section><section class="workflow"><h2>Target generated workflow</h2><div class="flow"><span>Matterport capture</span><span>OBJ geometry</span><span>Object detection</span><span>Measured quantities</span><span>Replacement-cost model</span><span>Proposed recovery class</span><span>Owner basis + invoices</span><span>CPA review package</span></div></section><div class="actions"><a class="button" href="/vues">Ask the building</a><a class="button secondary" href="https://my.matterport.com/show/?m=${building.matterportSid}" target="_blank" rel="noopener">Open source capture ↗</a></div>${sectionCards}<p class="footer-note"><strong>Important:</strong> this prototype preserves the classifications and estimates from the June 2026 owner study as benchmark data. It is not tax advice, a certified appraisal, or a claim that the current scan independently produced these values. The product goal is to regenerate the physical inventory and quantities from capture evidence, then reconcile them with owner-supplied basis, invoices, placed-in-service dates, and CPA review.</p></main></body></html>`;
}

function indexHtml() {
  const cards = Object.values(BUILDINGS).map(building => `
    <a class="demo-card" href="/${building.slug}">
      <span class="demo-id">${building.id}</span>
      <h2>${building.name}</h2>
      <p>${building.subtitle}</p>
      <span class="demo-open">Open building →</span>
    </a>
  `).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#111618"><title>Cinci360 Intelligence · Demo Buildings</title><style>
*{box-sizing:border-box}body{margin:0;background:#f1eee7;color:#111618;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.shell{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:28px 0 72px}header{display:flex;justify-content:space-between;align-items:center}.brand{font-weight:850}.hero{padding:84px 0 48px}.eyebrow{font-size:12px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.hero h1{font-family:Georgia,serif;font-size:clamp(52px,9vw,112px);font-weight:400;letter-spacing:-.06em;line-height:.88;margin:12px 0 24px}.hero p{max-width:760px;font-size:19px;line-height:1.6;color:#505653}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.demo-card{display:block;background:#fff;border:1px solid #d7d2c9;border-radius:20px;padding:22px;color:inherit;text-decoration:none;min-height:240px}.demo-card:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(0,0,0,.06)}.demo-id{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#707673}.demo-card h2{font-family:Georgia,serif;font-size:31px;font-weight:400;margin:26px 0 8px}.demo-card p{color:#626864;line-height:1.45}.demo-open{display:block;margin-top:30px;font-weight:800;font-size:13px}@media(max-width:800px){.grid{grid-template-columns:1fr}.hero{padding-top:54px}}
</style></head><body><main class="shell"><header><div class="brand">Cinci360 Intelligence</div><div>3 live demos</div></header><section class="hero"><p class="eyebrow">Reality capture evolved</p><h1>Ask the building.</h1><p>One capture can do more than market or document a space. Cinci360 turns digital twins into persistent intelligence for facilities, event venues, rentals, and transactions.</p></section><section class="grid">${cards}</section></main></body></html>`;
}

function buildingHtml(building: Building) {
  const facts = building.facts.map(item => `<div><strong>${item.label}</strong><span>${item.value}</span></div>`).join("");
  const signals = building.signals.map(item => `<div class="metric"><strong>${item.value}</strong><span>${item.label}</span></div>`).join("");
  const prompts = building.prompts.map(prompt => `<button type="button">${prompt}</button>`).join("");
  const gaps = ((building.evidence.knownGaps as string[] | undefined) ?? []).slice(0, 3).map(gap => `<div><strong>Gap</strong><span>${gap}</span></div>`).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#111618"><title>Cinci360 Intelligence · ${building.name}</title><style>
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f1eee7;color:#111618}.shell{width:min(1540px,calc(100% - 32px));margin:0 auto;padding:24px 0 56px}header{display:flex;justify-content:space-between;align-items:center;padding:4px 2px 20px}.brand{font-weight:850}.brand a{color:inherit;text-decoration:none}.building-id{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:#6d726f}.hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:22px;align-items:end;margin:16px 0 22px}.eyebrow,.kicker{font-size:12px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;margin:0 0 8px}.hero h1{font-family:Georgia,serif;font-size:clamp(48px,7vw,96px);font-weight:400;letter-spacing:-.055em;line-height:.9;margin:0}.hero-copy{font-size:17px;line-height:1.55;color:#4f5552;margin:0 0 6px}.badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.badge{border:1px solid #d4d0c7;background:#fff;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:700}.main{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(360px,.6fr);gap:18px}.card{background:#fff;border:1px solid #d7d2c9;border-radius:20px;overflow:hidden}.card-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 18px}.card-head h2{font-size:20px;margin:0}.live{font-size:12px;font-weight:750;border:1px solid #d7d2c9;border-radius:999px;padding:7px 10px}.viewer{aspect-ratio:16/10;background:#111}.viewer iframe{display:block;width:100%;height:100%;border:0}.strip{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #ece8df}.strip>div{padding:14px 16px}.strip>div+div{border-left:1px solid #ece8df}.strip strong{display:block;font-size:13px}.strip span{font-size:12px;color:#6a706d}.assistant{display:flex;flex-direction:column;min-height:680px}.messages{flex:1;padding:14px;background:#f6f4ef}.message{border:1px solid #e2ded5;background:#fff;border-radius:15px;padding:13px 14px;line-height:1.5;white-space:pre-wrap}.message+.message{margin-top:10px}.ask{padding:12px;border-top:1px solid #e2ded5;display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center}.ask textarea{font:inherit;border:1px solid #d8d4ca;border-radius:13px;padding:10px 12px;resize:none;min-width:0}.ask button{border:0;background:#111618;color:#fff;border-radius:999px;font-weight:800;min-height:46px;padding:0 15px}.mic{width:46px;padding:0!important;font-size:20px}.suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 13px}.suggestions button{border:1px solid #d9d4cb;background:#fff;border-radius:999px;padding:7px 10px;font-weight:700;font-size:12px;color:#111618}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.panel{background:#fff;border:1px solid #d7d2c9;border-radius:18px;padding:18px}.panel h3{font-size:20px;margin:0 0 12px}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px}.metric{background:#f6f4ef;border-radius:12px;padding:12px}.metric strong{display:block;font-size:18px}.metric span{font-size:12px;color:#676d6a}.evidence{display:grid;gap:8px}.evidence div{border-left:3px solid #111618;padding:8px 0 8px 10px}.evidence strong{display:block;font-size:13px}.evidence span{font-size:12px;color:#6b716e}.note{margin-top:18px;font-size:12px;color:#6b716e}@media(max-width:1050px){.hero,.main{grid-template-columns:1fr}.assistant{min-height:540px}}@media(max-width:680px){.shell{width:calc(100% - 20px);padding-top:16px}.grid{grid-template-columns:1fr}.strip{grid-template-columns:1fr}.strip>div+div{border-left:0;border-top:1px solid #ece8df}.ask{grid-template-columns:auto 1fr}.ask .submit{grid-column:1/-1}.viewer{aspect-ratio:4/3}}
</style></head><body><main class="shell"><header><div class="brand"><a href="/">Cinci360 Intelligence</a></div><div class="building-id">${building.id} · ${building.subtitle}</div></header><section class="hero"><div><p class="eyebrow">${building.name}</p><h1>Ask the building.</h1></div><div><p class="hero-copy">${building.intro}</p><div class="badges">${building.badges.map(badge => `<span class="badge">${badge}</span>`).join("")}</div></div></section><section class="main"><article class="card"><div class="card-head"><div><p class="kicker">Live digital twin</p><h2>${building.name}</h2></div><span class="live">${building.useCase}</span></div><div class="viewer"><iframe src="https://my.matterport.com/show/?m=${building.matterportSid}&play=1&qs=1&help=0" title="${building.name} Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" allowfullscreen></iframe></div><div class="strip">${facts}</div></article><aside class="card assistant"><div class="card-head"><div><p class="kicker">Building assistant</p><h2>Intelligence</h2></div><span class="live">Probability-aware</span></div><div class="messages"><div class="message">Ask the questions a real buyer, planner, guest, or facility manager would ask before making a decision. I will separate what is measured, observed, inferred, and still missing.</div><div class="message" id="answer">Choose one of the high-value questions below or ask your own.</div></div><div class="ask"><button class="mic" type="button" aria-label="Voice coming soon">🎙</button><textarea id="q" rows="3" placeholder="Ask this building…"></textarea><button class="submit" id="ask" type="button">Ask GBI</button></div><div class="suggestions">${prompts}</div></aside></section><section class="grid"><article class="panel"><p class="kicker">Building signals</p><h3>What the current record already knows</h3><div class="metrics">${signals}</div></article><article class="panel"><p class="kicker">Evidence status</p><h3>What still improves confidence</h3><div class="evidence">${gaps || '<div><strong>Ready</strong><span>No major evidence gaps listed.</span></div>'}</div><p class="note">As MatterPak geometry, panorama analysis, documents, and future scans are attached, answers can move from inferred to observed or measured.</p></article></section>${building.id === "BLDG-003" ? '<div class="actions" style="margin-top:18px"><a href="/vues/cost-seg" style="display:inline-block;background:#111618;color:#fff;text-decoration:none;border-radius:999px;padding:12px 16px;font-weight:800;font-size:13px">Open Cost Segregation Intelligence →</a></div>' : '<div class="actions" style="margin-top:18px"><a href="/' + building.slug + '/cost-seg" style="display:inline-block;background:#111618;color:#fff;text-decoration:none;border-radius:999px;padding:12px 16px;font-weight:800;font-size:13px">Generate Cost Segregation Test →</a></div>'}<p class="note">${building.id} · Matterport ${building.matterportSid}</p></main><script>
const q=document.getElementById("q"),answer=document.getElementById("answer"),ask=document.getElementById("ask");
document.querySelectorAll(".suggestions button").forEach(b=>b.addEventListener("click",()=>{q.value=b.textContent||"";q.focus()}));
ask.addEventListener("click",async()=>{const question=q.value.trim();if(!question)return;answer.textContent="Checking building evidence…";try{const r=await fetch("/api/buildings/${building.id}/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question})});const data=await r.json();answer.textContent=data.answer||data.error||"No answer returned."}catch{answer.textContent="The building service could not be reached."}});
</script></body></html>`;
}

function findBuilding(pathname: string) {
  const normalized = pathname.replace(/^\/+|\/+$/g, "");
  if (!normalized) return null;
  if (BUILDINGS[normalized]) return BUILDINGS[normalized];
  return BUILDINGS_BY_SLUG[normalized] || null;
}

const appWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const ingestVisualApiMatch = url.pathname.match(/^\/api\/buildings\/(BLDG-\d{3})\/ingest-visual$/);
    const evidenceApiMatch = url.pathname.match(/^\/api\/buildings\/(BLDG-\d{3})\/evidence$/);
    const costSegApiMatch = url.pathname.match(/^\/api\/buildings\/(BLDG-\d{3})\/cost-seg$/);
    const apiMatch = url.pathname.match(/^\/api\/buildings\/(BLDG-\d{3})(?:\/(ask))?$/);

    if (ingestVisualApiMatch && request.method === "POST") {
      const building = BUILDINGS[ingestVisualApiMatch[1]];
      if (!building) return json({ error: "Building not found." }, 404);
      const body = await request.json().catch(() => null) as any;
      const captures = Array.isArray(body?.captures) ? body.captures.slice(0, 8) : [];
      if (!captures.length) return json({ error: "At least one panorama capture is required." }, 400);
      try {
        const inventory = await analyzeVisualCaptures(building, captures, env);
        const persistence = await persistVisualBatch(building, captures, inventory, env);
        return json({ summary: inventory.summary, batchItems: inventory.items?.length || 0, ...persistence });
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "Visual ingestion failed." }, 502);
      }
    }

    if (evidenceApiMatch && request.method === "GET") {
      const building = BUILDINGS[evidenceApiMatch[1]];
      if (!building) return json({ error: "Building not found." }, 404);
      const persisted = await loadPersistedVisualEvidence(building, env);
      return json({ buildingId: building.id, r2Configured: Boolean(env.BUILDING_DATA), visualInventory: persisted });
    }

    if (costSegApiMatch && request.method === "POST") {
      const building = BUILDINGS[costSegApiMatch[1]];
      if (!building) return json({ error: "Building not found." }, 404);
      if (!env.OPENAI_API_KEY) return json({ error: "Reasoning service is not configured." }, 503);
      try {
        return json({ study: await generateCostSegStudy(building, env) });
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "Cost segregation screening failed." }, 502);
      }
    }

    if (apiMatch) {
      const building = BUILDINGS[apiMatch[1]];
      if (!building) return json({ error: "Building not found." }, 404);

      if (!apiMatch[2] && request.method === "GET") {
        return json({
          id: building.id,
          slug: building.slug,
          name: building.name,
          subtitle: building.subtitle,
          matterportSid: building.matterportSid,
          useCase: building.useCase
        });
      }

      if (apiMatch[2] === "ask" && request.method === "POST") {
        const body = await request.json().catch(() => null) as { question?: string } | null;
        const question = body?.question?.trim();
        if (!question) return json({ error: "Ask a building question." }, 400);
        if (!env.OPENAI_API_KEY) return json({ answer: `${building.name} is connected, but the reasoning service has not been configured for this deployment yet.` });

        try {
          return json({ answer: await reasonAboutBuilding(building, question, env) });
        } catch (error) {
          return json({ error: error instanceof Error ? error.message : "The reasoning service could not answer that question." }, 502);
        }
      }

      return json({ error: "Method not allowed." }, 405);
    }

    if (url.pathname === "/api/config-status" && request.method === "GET") {
      return json({
        matterportSdkConfigured: Boolean(env.MATTERPORT_SDK_KEY),
        openAiConfigured: Boolean(env.OPENAI_API_KEY),
        r2Configured: Boolean(env.BUILDING_DATA)
      });
    }

    if (url.pathname === "/manifest.webmanifest") {
      return new Response(JSON.stringify({
        name: "Cinci360 Intelligence",
        short_name: "Cinci360",
        start_url: "/",
        display: "standalone",
        background_color: "#f1eee7",
        theme_color: "#111618"
      }), { headers: { "content-type": "application/manifest+json" } });
    }

    const ingestPageMatch = url.pathname.match(/^\/(crc|bell|vues)\/ingest$/);
    if (ingestPageMatch) {
      const building = BUILDINGS_BY_SLUG[ingestPageMatch[1]];
      return new Response(ingestionHtml(building, env.MATTERPORT_SDK_KEY || ""), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }

    if (url.pathname === "/crc/cost-seg" || url.pathname === "/crc/cost-segregation") {
      return new Response(generatedCostSegHtml(BUILDINGS["BLDG-001"]), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }

    if (url.pathname === "/bell/cost-seg" || url.pathname === "/bell/cost-segregation") {
      return new Response(generatedCostSegHtml(BUILDINGS["BLDG-002"]), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }

    if (url.pathname === "/vues/cost-seg" || url.pathname === "/vues/cost-segregation") {
      return new Response(costSegHtml(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }

    if (url.pathname === "/") {
      return new Response(indexHtml(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }

    const building = findBuilding(url.pathname);
    if (building) {
      return new Response(buildingHtml(building), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }

    return new Response("Not found", { status: 404 });
  }
};

export default appWorker;
