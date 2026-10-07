interface Env {
  OPENAI_API_KEY?: string;
  MATTERPORT_SDK_KEY?: string;
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
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f5f0e8;color:#111618}.shell{max-width:760px;margin:0 auto;padding:22px;min-height:100vh}header{display:flex;justify-content:space-between;align-items:center;padding:8px 0 34px}.brand{font-weight:850;letter-spacing:-.02em}.id{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#737875}.hero{padding:28px 0 22px}.eyebrow{font-size:12px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;margin:0 0 12px}.hero h1{font-family:Georgia,serif;font-size:clamp(48px,10vw,76px);font-weight:400;letter-spacing:-.05em;line-height:.93;margin:0 0 22px}.status{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700}.dot{width:9px;height:9px;border-radius:50%;background:#39a96b}.intro{font-size:18px;line-height:1.55;max-width:620px;margin:18px 0 28px}.ask{background:#fff;border:1px solid #d7d2c9;border-radius:24px;padding:16px;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center}.ask button{border:0;border-radius:999px;background:#111618;color:#fff;font-weight:800;min-height:48px;padding:0 18px}.mic{width:50px;padding:0!important;font-size:20px}.ask textarea{border:0;outline:0;resize:none;font:inherit;background:transparent;min-width:0}.quick{display:grid;gap:10px;margin-top:18px}.quick button{background:transparent;border:1px solid #d7d2c9;border-radius:999px;padding:12px 16px;text-align:left;font-weight:750;color:#111618}.answer{margin-top:24px;padding:20px 0;border-top:1px solid #d7d2c9;font-size:17px;line-height:1.55}.small{font-size:12px;color:#737875;margin-top:34px}@media(max-width:560px){.shell{padding:18px}.ask{grid-template-columns:auto 1fr}.ask .submit{grid-column:1/-1}.hero{padding-top:12px}}
</style>
</head>
<body>
<main class="shell">
<header><div class="brand">Cinci360 Intelligence</div><div class="id">BLDG-001</div></header>
<section class="hero">
<p class="eyebrow">Your building</p>
<h1>Cincinnati Rowing Club</h1>
<div class="status"><span class="dot"></span> Building intelligence online</div>
<p class="intro">CRC is Building 001. Ask about assets, layout, clearances, condition, or space-planning opportunities.</p>
</section>
<section class="ask">
<button class="mic" type="button" aria-label="Voice coming soon">🎙</button>
<textarea id="q" rows="3" placeholder="Ask your building…"></textarea>
<button class="submit" id="ask" type="button">Ask</button>
</section>
<section class="quick">
<button type="button">What should I be paying attention to?</button>
<button type="button">Where could I fit more storage?</button>
<button type="button">What is the clearance here?</button>
<button type="button">What assets are in this building?</button>
</section>
<div class="answer" id="answer">Building 001 is live. The next step is connecting the persisted CRC evidence index.</div>
<p class="small">Current evidence: interior Pro3 baseline + MatterPak geometry. Exterior enrichment pending.</p>
</main>
<script>
const q=document.getElementById("q"),answer=document.getElementById("answer"),ask=document.getElementById("ask");
document.querySelectorAll(".quick button").forEach(b=>b.addEventListener("click",()=>{q.value=b.textContent||"";q.focus()}));
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

      return json({
        answer: "Building 001 is online. The next milestone is connecting its persisted CRC evidence index so answers are grounded in stored building knowledge."
      });
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
