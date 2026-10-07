import { NextRequest, NextResponse } from "next/server";

type ChatRequest = {
  question?: string;
  model?: { sid?: string; name?: string };
  currentSweepId?: string;
  currentLocation?: unknown;
  spatial?: unknown;
  sweeps?: unknown[];
  visualKnowledge?: unknown[];
};

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

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string") return response.output_text;
  return (response.output ?? []).flatMap(item => item.content ?? [])
    .filter(part => part.type === "output_text" && typeof part.text === "string")
    .map(part => part.text).join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });

  let body: ChatRequest;
  try { body = (await request.json()) as ChatRequest; }
  catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }

  const question = body.question?.trim();
  if (!question) return NextResponse.json({ error: "Ask a facility question." }, { status: 400 });

  const model = process.env.OPENAI_GBI_MODEL?.trim() || process.env.OPENAI_INVENTORY_MODEL?.trim() || "gpt-6-luna";
  const sweeps = Array.isArray(body.sweeps) ? body.sweeps.slice(0, 120) : [];
  const visualKnowledge = Array.isArray(body.visualKnowledge) ? body.visualKnowledge.slice(0, 180) : [];

  const prompt = `You are GBI, Cinci360's facility intelligence assistant. You answer questions about the physical facility represented by a Matterport digital twin.

Stay in scope: building layout, dimensions, clearances, assets, space planning, visible condition, architecture, envelope, MEP, safety, operations, maintenance, renovation, due diligence, sale-readiness, and related facility decisions. If the user asks something unrelated, explain briefly that this assistant is limited to facility questions.

Evidence hierarchy:
1. MEASURED = geometry/spatial-index facts or deterministic calculations supplied below. These are Matterport-mesh screening measurements, not certified survey dimensions.
2. OBSERVED = facts explicitly present in the visual knowledge below.
3. INFERRED = reasonable interpretation from measured/observed facts, such as apparent era or likely condition. Label the uncertainty.
4. ADVISED = recommendations about layout, renovation, profitability, sale readiness, etc. State the assumptions and identify missing financial/market/code information.
5. INSUFFICIENT = the supplied data cannot support the answer.

Never invent exact ages, hidden conditions, code compliance, equipment specifications, market value, renovation cost, or dimensions not in the evidence. For equipment-fit questions, use supplied clearance data if available and call it screening-level only. If dimensions or a target location are missing, say exactly what is needed. For renovation/profitability questions, separate what the building evidence suggests from what would require cost, market, lease, or comparable-sales data.

Model: ${JSON.stringify(body.model ?? {})}
Current sweep: ${body.currentSweepId ?? "unknown"}
Current location / local clearance: ${JSON.stringify(body.currentLocation ?? null)}
Spatial index summary: ${JSON.stringify(body.spatial ?? null)}
Sweep graph / positions: ${JSON.stringify(sweeps)}
Visual knowledge: ${JSON.stringify(visualKnowledge)}

User question: ${question}

Return concise structured JSON. evidenceSweepIds may contain only sweep IDs present in the supplied data.`;

  const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      text: { format: { type: "json_schema", name: "gbi_facility_answer", strict: true, schema } },
      store: false,
    }),
  });

  const payload = await openAIResponse.json() as unknown;
  if (!openAIResponse.ok) {
    const errorPayload = payload as { error?: { message?: string } };
    return NextResponse.json({ error: errorPayload.error?.message || `GBI failed with HTTP ${openAIResponse.status}.` }, { status: openAIResponse.status });
  }
  const text = extractOutputText(payload);
  if (!text) return NextResponse.json({ error: "GBI returned no answer." }, { status: 502 });
  try { return NextResponse.json(JSON.parse(text)); }
  catch { return NextResponse.json({ error: "GBI returned an unreadable answer." }, { status: 502 }); }
}
