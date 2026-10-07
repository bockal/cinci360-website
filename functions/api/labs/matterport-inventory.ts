interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_INVENTORY_MODEL?: string;
}

const schema = {
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
        required: ["assetId","category","visibleName","description","quantity","confidence","evidenceSweepIds","duplicateGroup","notes"],
        properties: {
          assetId: { type: "string" },
          category: { type: "string" },
          visibleName: { type: "string" },
          description: { type: "string" },
          quantity: { type: "integer", minimum: 1 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          evidenceSweepIds: { type: "array", items: { type: "string" }, minItems: 1 },
          duplicateGroup: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
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

  const captures = Array.isArray(body.captures) ? body.captures.slice(0, 12) : [];
  if (!captures.length) {
    return respond({ error: "At least one Matterport panorama is required." }, 400);
  }

  const invalid = captures.find((capture: any) =>
    !capture ||
    typeof capture.sweepId !== "string" ||
    typeof capture.imageDataUri !== "string" ||
    !capture.imageDataUri.startsWith("data:image/")
  );
  if (invalid) {
    return respond({ error: "Every capture must include a sweepId and Matterport image data URI." }, 400);
  }

  const modelName = body.model?.name || "Matterport property";
  const modelSid = body.model?.sid || "unknown";
  const namingConvention = typeof body.namingConvention === "string" && body.namingConvention.trim()
    ? body.namingConvention.trim()
    : "{CATEGORY}-{NNN}";
  const inventoryFocus = typeof body.inventoryFocus === "string" && body.inventoryFocus.trim()
    ? body.inventoryFocus.trim()
    : "Identify substantial visible assets and read visible names or identifiers when legible.";

  const evidenceManifest = captures.map((capture: any, index: number) => {
    const xyz = capture.position
      ? `${Number(capture.position.x).toFixed(2)}, ${Number(capture.position.y).toFixed(2)}, ${Number(capture.position.z).toFixed(2)}`
      : "unknown";
    return `Image ${index + 1}: sweep=${capture.sweepId}; floor=${capture.floor ?? "unknown"}; xyz=${xyz}`;
  }).join("\n");

  const prompt = `You are reviewing visual evidence from a Matterport digital twin to create a conservative, evidence-backed facility inventory.

Property: ${modelName}
Matterport model SID: ${modelSid}

Evidence manifest:
${evidenceManifest}

Client inventory focus:
${inventoryFocus}

Asset ID naming convention:
${namingConvention}

Rules:
- Return one row per unique physical asset, or one grouped row only when multiple interchangeable objects cannot be distinguished reliably.
- Deduplicate aggressively across overlapping panoramas.
- Read visible names, labels, decals, manufacturer/model text, or identifiers when legible.
- Do not invent ownership, value, serial numbers, hidden conditions, hidden parts, or unsupported quantities.
- evidenceSweepIds may contain only supplied sweep IDs.
- confidence is 0 to 1.
- Be conservative. Missing an uncertain object is better than inventing one.

This is a visual inventory aid, not a certified appraisal or insurance schedule. Return structured JSON only.`;

  const content: any[] = [{ type: "input_text", text: prompt }];
  for (const capture of captures) {
    content.push({ type: "input_image", image_url: capture.imageDataUri, detail: "high" });
  }

  const model = env.OPENAI_INVENTORY_MODEL || "gpt-6-luna";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "matterport_inventory",
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
      { error: payload?.error?.message || `OpenAI inventory analysis failed with HTTP ${response.status}.` },
      response.status,
    );
  }

  const text = extractOutputText(payload);
  if (!text) return respond({ error: "The vision model returned no structured inventory output." }, 502);

  try {
    return respond(JSON.parse(text));
  } catch {
    return respond({ error: "The vision model response could not be parsed as inventory JSON." }, 502);
  }
};
