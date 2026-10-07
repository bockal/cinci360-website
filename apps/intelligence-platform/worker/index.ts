interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_GBI_MODEL?: string;
  MATTERPORT_SDK_KEY?: string;
}


const CRC_EVIDENCE = {
  building: {
    id: "BLDG-001",
    name: "Cincinnati Rowing Club",
    matterportSid: "qM1n2tF3CAQ",
    scan: "SCAN-001 interior Pro3 baseline",
  },
  geometry: {
    source: "Matterport MatterPak OBJ",
    screeningOnly: true,
    extentsFeet: { length: 161.49, width: 70.14, height: 30.19 },
    vertexCount: 266255,
    faceCount: 508700,
    surfaceVoxelCount: 18547,
    voxelSizeMeters: 0.5,
  },
  observedClasses: [
    "rowing shells",
    "boat storage racks",
    "outboard motors and support equipment",
    "lighting and visible structure",
    "doors and access paths (partial)",
  ],
  knownGaps: [
    "full exterior",
    "current rear entrance configuration",
    "site circulation",
    "exterior drainage",
    "exterior utilities",
  ],
  policy: {
    measured: "Geometry-derived screening facts only; not a certified survey.",
    observed: "Only claim visual facts that are present in the supplied evidence.",
    inferred: "Qualify interpretation and never present it as directly observed.",
    advised: "Recommendations must state assumptions and missing inputs.",
    insufficient: "If evidence is weak, still provide the best useful estimate with a probability and clearly explain why confidence is limited.",
  },
};

function outputText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  return (payload?.output ?? [])
    .flatMap((item: any) => item.content ?? [])
    .filter((part: any) => part.type === "output_text" && typeof part.text === "string")
    .map((part: any) => part.text)
    .join("\n");
}

async function reasonAboutBuilding(question: string, env: Env) {
  const model = env.OPENAI_GBI_MODEL || "gpt-6-luna";
  const prompt = `You are Cinci360 Building Intelligence for Building 001, Cincinnati Rowing Club.

Use the evidence supplied below to give the most useful answer possible. Distinguish:
- MEASURED: geometry-derived screening facts
- OBSERVED: directly supported by current visual evidence
- INFERRED: reasonable interpretation, clearly qualified
- ADVISED: recommendation with assumptions

Always answer the question. When direct evidence is incomplete, give the best evidence-based estimate rather than stopping at "insufficient." Attach an explicit likelihood/confidence percentage to the conclusion and explain what would raise or lower that confidence.

Do not fabricate exact dimensions beyond supplied geometry, hidden conditions, code compliance, ages, costs, serial numbers, market value, or exterior facts not captured. You may make a qualified best estimate from building type, context, visible/known evidence, and common construction patterns, but label it as inference and give a probability.

Building evidence:
${JSON.stringify(CRC_EVIDENCE)}

User question:
${question}

Respond in concise plain language using this structure:
CLASSIFICATION — CONFIDENCE%
Answer: <best useful answer, even if it must be a qualified estimate>
Why: <short evidence-based reasoning>
What would confirm it: <one short sentence, only when confidence is below 90%>

Use one classification: MEASURED, OBSERVED, INFERRED, or ADVISED. Never return only "insufficient"; if evidence is weak, make the safest reasonable inference with a lower confidence percentage and say what evidence is missing.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      store: false,
    }),
  });

  const payload: any = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Reasoning service failed with HTTP ${response.status}.`);
  }

  const answer = outputText(payload).trim();
  if (!answer) throw new Error("Reasoning service returned no answer.");
  return answer;
}

const CRC = {
  id: "BLDG-001",
  slug: "crc",
  name: "Cincinnati Rowing Club",
  status: "prototype",
  matterportSid: "qM1n2tF3CAQ",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

const appHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#111618">
<title>Cinci360 Intelligence · Building 001</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f1eee7;color:#111618}.shell{width:min(1540px,calc(100% - 32px));margin:0 auto;padding:24px 0 56px}header{display:flex;justify-content:space-between;align-items:center;padding:4px 2px 20px}.brand{font-weight:850;letter-spacing:-.02em}.building-id{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:#6d726f}.hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:22px;align-items:end;margin:16px 0 22px}.eyebrow,.kicker{font-size:12px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;margin:0 0 8px}.hero h1{font-family:Georgia,serif;font-size:clamp(48px,7vw,96px);font-weight:400;letter-spacing:-.055em;line-height:.9;margin:0}.hero-copy{font-size:17px;line-height:1.55;color:#4f5552;margin:0 0 6px}.badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.badge{border:1px solid #d4d0c7;background:#fff;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:700}.main{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(360px,.6fr);gap:18px}.card{background:#fff;border:1px solid #d7d2c9;border-radius:20px;overflow:hidden}.card-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 18px}.card-head h2{font-size:20px;margin:0}.live{font-size:12px;font-weight:750;border:1px solid #d7d2c9;border-radius:999px;padding:7px 10px}.viewer{aspect-ratio:16/10;background:#111}.viewer iframe{display:block;width:100%;height:100%;border:0}.strip{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #ece8df}.strip>div{padding:14px 16px}.strip>div+div{border-left:1px solid #ece8df}.strip strong{display:block;font-size:13px}.strip span{font-size:12px;color:#6a706d}.assistant{display:flex;flex-direction:column;min-height:680px}.messages{flex:1;padding:14px;background:#f6f4ef}.message{border:1px solid #e2ded5;background:#fff;border-radius:15px;padding:13px 14px;line-height:1.5}.message+.message{margin-top:10px}.ask{padding:12px;border-top:1px solid #e2ded5;display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center}.ask textarea{font:inherit;border:1px solid #d8d4ca;border-radius:13px;padding:10px 12px;resize:none;min-width:0}.ask button{border:0;background:#111618;color:#fff;border-radius:999px;font-weight:800;min-height:46px;padding:0 15px}.mic{width:46px;padding:0!important;font-size:20px}.suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 13px}.suggestions button{border:1px solid #d9d4cb;background:#fff;border-radius:999px;padding:7px 10px;font-weight:700;font-size:12px;color:#111618}.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:18px}.panel{background:#fff;border:1px solid #d7d2c9;border-radius:18px;padding:18px}.panel h3{font-size:20px;margin:0 0 12px}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px}.metric{background:#f6f4ef;border-radius:12px;padding:12px}.metric strong{display:block;font-size:22px}.metric span{font-size:12px;color:#676d6a}.asset-list{display:grid;gap:8px}.asset{display:flex;justify-content:space-between;gap:10px;background:#f6f4ef;border-radius:12px;padding:11px 12px}.asset b{font-size:13px}.asset span{font-size:12px;color:#69706c}.evidence{display:grid;gap:8px}.evidence div{border-left:3px solid #111618;padding:8px 0 8px 10px}.evidence strong{display:block;font-size:13px}.evidence span{font-size:12px;color:#6b716e}.note{margin-top:18px;font-size:12px;color:#6b716e}@media(max-width:1050px){.hero,.main{grid-template-columns:1fr}.assistant{min-height:540px}.grid{grid-template-columns:1fr 1fr}}@media(max-width:680px){.shell{width:calc(100% - 20px);padding-top:16px}.grid{grid-template-columns:1fr}.strip{grid-template-columns:1fr}.strip>div+div{border-left:0;border-top:1px solid #ece8df}.ask{grid-template-columns:auto 1fr}.ask .submit{grid-column:1/-1}.viewer{aspect-ratio:4/3}}
</style>
</head>
<body>
<main class="shell">
<header><div class="brand">Cinci360 Intelligence</div><div class="building-id">Building 001 · CRC</div></header>

<section class="hero">
<div>
<p class="eyebrow">Cincinnati Rowing Club</p>
<h1>Ask the building.</h1>
</div>
<div>
<p class="hero-copy"><strong>Reality capture has evolved.</strong> What began as marketing imagery and geospatial documentation can now become a long-term building intelligence layer—helping owners uncover risk, unused capacity, maintenance priorities, renovation constraints, and change over time from the same capture.</p>
<div class="badges"><span class="badge">Marketing + documentation</span><span class="badge">Geospatial layout</span><span class="badge">Long-term intelligence</span></div>
</div>
</section>

<section class="main">
<article class="card">
<div class="card-head"><div><p class="kicker">Live digital twin</p><h2>Cincinnati Rowing Club</h2></div><span class="live">Current interior baseline</span></div>
<div class="viewer"><iframe src="https://my.matterport.com/show/?m=qM1n2tF3CAQ&play=1&qs=1&help=0" title="Cincinnati Rowing Club Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" allowfullscreen></iframe></div>
<div class="strip">
<div><strong>Capture</strong><span>Pro3 interior baseline</span></div>
<div><strong>Geometry</strong><span>MatterPak OBJ indexed</span></div>
<div><strong>Next scan</strong><span>Exterior + rear entrance</span></div>
</div>
</article>

<aside class="card assistant">
<div class="card-head"><div><p class="kicker">Facility assistant</p><h2>Building Intelligence</h2></div><span class="live">Evidence grounded</span></div>
<div class="messages">
<div class="message">I know this building from its current Matterport interior capture and OBJ geometry. Ask about storage, clearances, visible assets, layout, or what additional evidence would improve an answer.</div>
<div class="message" id="answer">Building 001 is live. The reasoning layer will become fully evidence-backed when the OpenAI key and persistent CRC evidence index are attached to this Worker.</div>
</div>
<div class="ask">
<button class="mic" type="button" aria-label="Voice coming soon">🎙</button>
<textarea id="q" rows="3" placeholder="Ask: Where could we fit more storage?"></textarea>
<button class="submit" id="ask" type="button">Ask GBI</button>
</div>
<div class="suggestions">
<button type="button">Where are we wasting usable space?</button>
<button type="button">What could become expensive in the next 1–3 years?</button>
<button type="button">What would an insurer, buyer, architect, or contractor flag?</button>
<button type="button">What should we know before spending money on this building?</button>
<button type="button">Where could we add storage without disrupting operations?</button>
<button type="button">What parts of this building are undocumented or risky?</button>
</div>
</aside>
</section>

<section class="grid">
<article class="panel">
<p class="kicker">Spatial layer</p><h3>OBJ mesh index</h3>
<div class="metrics">
<div class="metric"><strong>161.5 ft</strong><span>model length</span></div>
<div class="metric"><strong>70.1 ft</strong><span>model width</span></div>
<div class="metric"><strong>30.2 ft</strong><span>model height</span></div>
<div class="metric"><strong>18,547</strong><span>surface voxels</span></div>
</div>
<p class="note">Screening geometry only; not a certified survey.</p>
</article>

<article class="panel">
<p class="kicker">Building assets</p><h3>Observed classes</h3>
<div class="asset-list">
<div class="asset"><b>Rowing shells</b><span>visible</span></div>
<div class="asset"><b>Boat storage racks</b><span>visible</span></div>
<div class="asset"><b>Outboard motors / support equipment</b><span>visible</span></div>
<div class="asset"><b>Lighting + visible structure</b><span>visible</span></div>
<div class="asset"><b>Doors / access paths</b><span>partial</span></div>
</div>
<p class="note">These are broad observed categories from the current capture, not yet a verified asset schedule.</p>
</article>

<article class="panel">
<p class="kicker">Evidence status</p><h3>What GBI knows</h3>
<div class="evidence">
<div><strong>Measured</strong><span>OBJ dimensions and screening clearances</span></div>
<div><strong>Observed</strong><span>Interior visual evidence from Matterport</span></div>
<div><strong>Missing</strong><span>Full exterior, current rear entrance, site circulation</span></div>
<div><strong>Next</strong><span>SCAN-002 becomes a new temporal evidence layer</span></div>
</div>
</article>
</section>

<p class="note">BLDG-001 · Current evidence: SCAN-001 interior Pro3 baseline + MatterPak OBJ geometry.</p>
</main>
<script>
const q=document.getElementById("q"),answer=document.getElementById("answer"),ask=document.getElementById("ask");
document.querySelectorAll(".suggestions button").forEach(b=>b.addEventListener("click",()=>{q.value=b.textContent||"";q.focus()}));
ask.addEventListener("click",async()=>{const question=q.value.trim();if(!question)return;answer.textContent="Checking building evidence…";try{const r=await fetch("/api/buildings/BLDG-001/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question})});const data=await r.json();answer.textContent=data.answer||data.error||"No answer returned."}catch{answer.textContent="The building service could not be reached."}});
</script>
</body>
</html>`;


const appWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/buildings/BLDG-001" && request.method === "GET") {
      return json(CRC);
    }

    if (url.pathname === "/api/buildings/BLDG-001/ask" && request.method === "POST") {
      const body = await request.json().catch(() => null) as { question?: string } | null;
      const question = body?.question?.trim();
      if (!question) return json({ error: "Ask a building question." }, 400);

      if (!env.OPENAI_API_KEY) {
        return json({
          answer: "Building 001 is connected, but the reasoning service has not been configured for this deployment yet."
        });
      }

      try {
        const answer = await reasonAboutBuilding(question, env);
        return json({ answer });
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : "The reasoning service could not answer that question."
        }, 502);
      }
    }

    if (url.pathname === "/manifest.webmanifest") {
      return new Response(JSON.stringify({
        name: "Cinci360 Intelligence",
        short_name: "Cinci360",
        start_url: "/",
        display: "standalone",
        background_color: "#f5f0e8",
        theme_color: "#111618"
      }), { headers: { "content-type": "application/manifest+json" } });
    }

    return new Response(appHtml, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  },
};

export default appWorker;
