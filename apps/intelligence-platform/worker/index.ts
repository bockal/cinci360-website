interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_GBI_MODEL?: string;
  MATTERPORT_SDK_KEY?: string;
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
      "Where are we wasting usable space?",
      "What could become expensive in the next 1–3 years?",
      "What would an insurer, buyer, architect, or contractor flag?",
      "Where could we add storage without disrupting operations?",
      "What parts of this building are undocumented or risky?",
      "What should we know before spending money on this building?"
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
      "What should an event planner know before touring this venue?",
      "Which questions should a caterer or rental vendor ask about this space?",
      "What guest-flow or setup constraints should we plan around?",
      "What should a corporate event buyer verify before booking?",
      "What overlooked building details could affect an event plan?",
      "What could this digital twin answer that would save the sales team time?"
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
      "Will this house work well for two families traveling together?",
      "How should 12 guests divide the sleeping spaces?",
      "What should guests know about lake access before booking?",
      "Which amenities are easy to miss in the listing?",
      "What questions would a cautious guest ask before reserving?",
      "How does this property reduce the friction of a lake weekend?"
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
${JSON.stringify(building.evidence)}

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
</style></head><body><main class="shell"><header><div class="brand"><a href="/">Cinci360 Intelligence</a></div><div class="building-id">${building.id} · ${building.subtitle}</div></header><section class="hero"><div><p class="eyebrow">${building.name}</p><h1>Ask the building.</h1></div><div><p class="hero-copy">${building.intro}</p><div class="badges">${building.badges.map(badge => `<span class="badge">${badge}</span>`).join("")}</div></div></section><section class="main"><article class="card"><div class="card-head"><div><p class="kicker">Live digital twin</p><h2>${building.name}</h2></div><span class="live">${building.useCase}</span></div><div class="viewer"><iframe src="https://my.matterport.com/show/?m=${building.matterportSid}&play=1&qs=1&help=0" title="${building.name} Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" allowfullscreen></iframe></div><div class="strip">${facts}</div></article><aside class="card assistant"><div class="card-head"><div><p class="kicker">Building assistant</p><h2>Intelligence</h2></div><span class="live">Probability-aware</span></div><div class="messages"><div class="message">I know this property from its current building record, published facts, and attached capture evidence. Ask a practical question about this space.</div><div class="message" id="answer">Choose one of the high-value questions below or ask your own.</div></div><div class="ask"><button class="mic" type="button" aria-label="Voice coming soon">🎙</button><textarea id="q" rows="3" placeholder="Ask this building…"></textarea><button class="submit" id="ask" type="button">Ask GBI</button></div><div class="suggestions">${prompts}</div></aside></section><section class="grid"><article class="panel"><p class="kicker">Building signals</p><h3>What the current record already knows</h3><div class="metrics">${signals}</div></article><article class="panel"><p class="kicker">Evidence status</p><h3>What still improves confidence</h3><div class="evidence">${gaps || '<div><strong>Ready</strong><span>No major evidence gaps listed.</span></div>'}</div><p class="note">As MatterPak geometry, panorama analysis, documents, and future scans are attached, answers can move from inferred to observed or measured.</p></article></section><p class="note">${building.id} · Matterport ${building.matterportSid}</p></main><script>
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
    const apiMatch = url.pathname.match(/^\/api\/buildings\/(BLDG-\d{3})(?:\/(ask))?$/);

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
