interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_GBI_MODEL?: string;
  OPENAI_INVENTORY_MODEL?: string;
}

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["answer", "evidenceLevel", "confidence", "evidenceSweepIds", "caveats", "suggestedQuestions"],
  properties: {
    answer: { type: "string" },
    evidenceLevel: { type: "string", enum: ["measured", "observed", "inferred", "advised", "insufficient"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    evidenceSweepIds: { type: "array", items: { type: "string" } },
    caveats: { type: "array", items: { type: "string" } },
    suggestedQuestions: { type: "array", items: { type: "string" }, maxItems: 4 },
  },
} as const;

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function extractOutputText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  return (payload?.output ?? [])
    .flatMap((item: any) => item.content ?? [])
    .filter((part: any) => part.type === "output_text" && typeof part.text === "string")
    .map((part: any) => part.text)
    .join("\n");
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.OPENAI_API_KEY) {
    return respond({ error: "OPENAI_API_KEY is not configured in Cloudflare Pages." }, 503);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return respond({ error: "Request body must be valid JSON." }, 400);
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return respond({ error: "Ask a facility question." }, 400);

  const sweeps = Array.isArray(body.sweeps) ? body.sweeps.slice(0, 120) : [];
  const visualKnowledge = Array.isArray(body.visualKnowledge) ? body.visualKnowledge.slice(0, 180) : [];
  const model = env.OPENAI_GBI_MODEL || env.OPENAI_INVENTORY_MODEL || "gpt-6-luna";

  const prompt = `You are GBI, Cinci360's facility intelligence assistant. Answer questions about the physical facility represented by the supplied Matterport evidence.

Use this evidence hierarchy:
1. MEASURED = geometry/spatial-index facts or deterministic calculations.
2. OBSERVED = facts explicitly present in visual knowledge.
3. INFERRED = reasonable interpretation from measured/observed facts, clearly qualified.
4. ADVISED = recommendations with assumptions and missing inputs stated.
5. INSUFFICIENT = the evidence cannot support the answer.

Never invent exact ages, hidden conditions, code compliance, equipment specifications, market value, renovation cost, or dimensions not present in evidence. Equipment-fit answers are screening-level only.

Model: ${JSON.stringify(body.model ?? {})}
Current sweep: ${body.currentSweepId ?? "unknown"}
Current location / local clearance: ${JSON.stringify(body.currentLocation ?? null)}
Spatial index summary: ${JSON.stringify(body.spatial ?? null)}
Sweep graph / positions: ${JSON.stringify(sweeps)}
Visual knowledge: ${JSON.stringify(visualKnowledge)}

User question: ${question}

Return concise structured JSON. evidenceSweepIds may contain only sweep IDs present in the supplied data.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      text: {
        format: {
          type: "json_schema",
          name: "gbi_facility_answer",
          strict: true,
          schema,
        },
      },
      store: false,
    }),
  });

  const payload: any = await response.json().catch(() => null);
  if (!response.ok) {
    return respond(
      { error: payload?.error?.message || `GBI failed with HTTP ${response.status}.` },
      response.status,
    );
  }

  const text = extractOutputText(payload);
  if (!text) return respond({ error: "GBI returned no answer." }, 502);

  try {
    return respond(JSON.parse(text));
  } catch {
    return respond({ error: "GBI returned an unreadable answer." }, 502);
  }
};
