import { NextRequest, NextResponse } from "next/server";

type Vector3 = { x: number; y: number; z: number };

type Capture = {
  sweepId: string;
  floor: number | null;
  position: Vector3 | null;
  capturedAt: string;
  imageDataUri: string;
};

type AnalyzeRequest = {
  model?: { sid?: string; name?: string };
  namingConvention?: string;
  inventoryFocus?: string;
  captures?: Capture[];
};

const inventorySchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "items"],
  properties: {
    summary: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "assetId",
          "category",
          "visibleName",
          "description",
          "quantity",
          "confidence",
          "evidenceSweepIds",
          "duplicateGroup",
          "notes",
        ],
        properties: {
          assetId: { type: "string" },
          category: { type: "string" },
          visibleName: { type: "string" },
          description: { type: "string" },
          quantity: { type: "integer", minimum: 1 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          evidenceSweepIds: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
          duplicateGroup: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
  },
} as const;

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  if (typeof response.output_text === "string") return response.output_text;

  return (response.output ?? [])
    .flatMap(item => item.content ?? [])
    .filter(part => part.type === "output_text" && typeof part.text === "string")
    .map(part => part.text)
    .join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Add it to .env.local and restart the dev server." },
      { status: 503 },
    );
  }

  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const captures = Array.isArray(body.captures) ? body.captures.slice(0, 12) : [];
  if (!captures.length) {
    return NextResponse.json({ error: "At least one Matterport panorama is required." }, { status: 400 });
  }

  const invalidCapture = captures.find(
    capture =>
      !capture ||
      typeof capture.sweepId !== "string" ||
      typeof capture.imageDataUri !== "string" ||
      !capture.imageDataUri.startsWith("data:image/"),
  );

  if (invalidCapture) {
    return NextResponse.json(
      { error: "Every capture must include a sweepId and Matterport image data URI." },
      { status: 400 },
    );
  }

  const modelName = body.model?.name || "Matterport property";
  const modelSid = body.model?.sid || "unknown";
  const namingConvention = body.namingConvention?.trim() || "{CATEGORY}-{NNN}";
  const inventoryFocus =
    body.inventoryFocus?.trim() ||
    "Identify substantial visible assets and read visible names or identifiers when legible.";
  const visionModel = process.env.OPENAI_INVENTORY_MODEL?.trim() || "gpt-6-luna";

  const evidenceManifest = captures
    .map((capture, index) => {
      const xyz = capture.position
        ? `${capture.position.x.toFixed(2)}, ${capture.position.y.toFixed(2)}, ${capture.position.z.toFixed(2)}`
        : "unknown";
      return `Image ${index + 1}: sweep=${capture.sweepId}; floor=${capture.floor ?? "unknown"}; xyz=${xyz}`;
    })
    .join("\n");

  const prompt = `You are reviewing visual evidence from a Matterport digital twin to create a conservative, evidence-backed asset inventory.

Property: ${modelName}
Matterport model SID: ${modelSid}

Evidence manifest:
${evidenceManifest}

Client inventory focus:
${inventoryFocus}

Asset ID naming convention requested by the client:
${namingConvention}

Rules:
- Return ONE row per unique physical asset, or one grouped row only when multiple interchangeable objects cannot be distinguished reliably.
- The same object may appear in several overlapping panoramas. Deduplicate aggressively using appearance, nearby structure, sweep coordinates, and scene overlap.
- Read visible names, labels, decals, registration markings, manufacturer/model text, or other identifiers when legible. Put that text in visibleName. If none is legible, use an empty string.
- category should be a short plain-English noun phrase appropriate to the object, such as "rowing shell", "boat rack", "ergometer", "LEGO brick", "fire extinguisher", or "machine tool".
- Do not invent ownership, value, serial numbers, manufacturer, model, condition, hidden parts, or quantities that are not visually supported.
- Use evidenceSweepIds containing only sweep IDs from the manifest above.
- duplicateGroup should be a short shared identifier only when two or more returned rows may still represent the same physical object; otherwise use an empty string.
- confidence is 0 to 1 and reflects confidence that the row represents a real, correctly categorized, uniquely counted asset.
- notes should briefly explain uncertainty, occlusion, grouped counts, or identification limits.
- Follow the naming convention as closely as possible. Interpret {CATEGORY} as a short uppercase category token and {NNN} as a zero-padded sequence number.
- Be conservative. Missing an uncertain object is better than inventing one.
- For LEGO or other assemblies, count only visually distinguishable pieces or grouped visible elements; never infer hidden/internal pieces.

This is a visual inventory aid, not a certified appraisal or insurance schedule. Return structured JSON only.`;

  const content: Array<Record<string, unknown>> = [{ type: "input_text", text: prompt }];

  for (const capture of captures) {
    content.push({
      type: "input_image",
      image_url: capture.imageDataUri,
      detail: "high",
    });
  }

  const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: visionModel,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "matterport_inventory",
          strict: true,
          schema: inventorySchema,
        },
      },
      store: false,
    }),
  });

  const responsePayload = (await openAIResponse.json()) as unknown;

  if (!openAIResponse.ok) {
    const errorPayload = responsePayload as { error?: { message?: string } };
    return NextResponse.json(
      {
        error:
          errorPayload?.error?.message ||
          `OpenAI inventory analysis failed with HTTP ${openAIResponse.status}.`,
      },
      { status: openAIResponse.status },
    );
  }

  const outputText = extractOutputText(responsePayload);
  if (!outputText) {
    return NextResponse.json(
      { error: "The vision model returned no structured inventory output." },
      { status: 502 },
    );
  }

  try {
    const inventory = JSON.parse(outputText) as { summary: string; items: unknown[] };
    return NextResponse.json(inventory);
  } catch {
    return NextResponse.json(
      { error: "The vision model response could not be parsed as inventory JSON." },
      { status: 502 },
    );
  }
}
