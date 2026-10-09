export type VisualObservation = {
  assetId: string;
  category: string;
  room: string;
  visibleName: string;
  description: string;
  quantity: number;
  confidence: number;
  evidenceSweepIds: string[];
  duplicateGroup: string;
  notes: string;
};

export async function loadPersistedVisualEvidence(building: any, env: any) {
  if (!env.BUILDING_DATA) return null;
  const prefix = `buildings/${building.id}`;
  const object = await env.BUILDING_DATA.get(`${prefix}/observations/latest.json`);
  if (!object) return null;
  const data: any = await object.json().catch(() => null);
  if (!data) return null;

  const processed = new Set<string>(Array.isArray(data.processedSweepIds) ? data.processedSweepIds : []);
  try {
    let cursor: string | undefined;
    do {
      const listed = await env.BUILDING_DATA.list({ prefix: `${prefix}/panos/`, cursor });
      for (const item of listed.objects || []) {
        const name = String(item.key || "").split("/").pop() || "";
        if (name.endsWith(".jpg")) processed.add(name.slice(0, -4));
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
  } catch {
    // Observation JSON remains usable even if object listing is temporarily unavailable.
  }

  data.processedSweepIds = Array.from(processed);
  data.processedSweepCount = processed.size;
  return data;
}

function outputText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  return (payload?.output ?? [])
    .flatMap((item: any) => item.content ?? [])
    .filter((part: any) => part.type === "output_text" && typeof part.text === "string")
    .map((part: any) => part.text)
    .join("\n");
}

export async function analyzeVisualCaptures(building: any, captures: any[], env: any) {
  if (!env.OPENAI_API_KEY) throw new Error("Reasoning service is not configured.");
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
          required: ["assetId","category","room","visibleName","description","quantity","confidence","evidenceSweepIds","duplicateGroup","notes"],
          properties: {
            assetId: { type: "string" },
            category: { type: "string" },
            room: { type: "string" },
            visibleName: { type: "string" },
            description: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            evidenceSweepIds: { type: "array", items: { type: "string" }, minItems: 1 },
            duplicateGroup: { type: "string" },
            notes: { type: "string" }
          }
        }
      }
    }
  };

  const manifest = captures.map((capture, i) => {
    const p = capture.position;
    const xyz = p ? `${Number(p.x).toFixed(2)}, ${Number(p.y).toFixed(2)}, ${Number(p.z).toFixed(2)}` : "unknown";
    return `Image ${i + 1}: sweep=${capture.sweepId}; floor=${capture.floor ?? "unknown"}; xyz=${xyz}`;
  }).join("\n");

  const prompt = `You are Cinci360 Building Intelligence reviewing Matterport panorama evidence for ${building.name}.

Create a conservative facility and cost-segregation-ready visual inventory. Identify visible movable equipment and furniture, specialty storage/racks, doors, windows, flooring, wall/ceiling finishes, plumbing fixtures, visible HVAC/electrical equipment, lighting, safety devices, signage, specialty improvements/built-ins, and condition anomalies.

Rules:
- Deduplicate the same physical object across overlapping sweeps.
- Do not invent hidden equipment, dimensions, age, ownership, manufacturer, model, condition, or quantities.
- Use only supplied sweep IDs for evidence.
- room should be the most specific visually supported room/area label, such as "Main Hall", "Foyer", "Sitting Room", "Restroom", "Kitchen", "Exterior Entry", or "Whole Building / Unassigned". Do not invent a room name if the views do not support one.
- quantity must reflect visually supported count or grouped count.
- confidence is 0 to 1.
- Missing uncertain items is better than inventing them.

Evidence manifest:
${manifest}

Return structured JSON only.`;

  const content: any[] = [{ type: "input_text", text: prompt }];
  for (const capture of captures) content.push({ type: "input_image", image_url: capture.imageDataUri, detail: "high" });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: env.OPENAI_GBI_MODEL || "gpt-6-luna",
      input: [{ role: "user", content }],
      text: { format: { type: "json_schema", name: "building_visual_inventory", strict: true, schema } },
      store: false
    })
  });

  const payload: any = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Visual analysis failed with HTTP ${response.status}.`);
  const raw = outputText(payload);
  if (!raw) throw new Error("Visual analysis returned no output.");
  return JSON.parse(raw);
}

export async function persistVisualBatch(building: any, captures: any[], inventory: any, env: any) {
  if (!env.BUILDING_DATA) return { persisted: false, reason: "R2 binding BUILDING_DATA is not configured." };

  const prefix = `buildings/${building.id}`;
  const priorObj = await env.BUILDING_DATA.get(`${prefix}/observations/latest.json`);
  const prior = priorObj ? await priorObj.json().catch(() => null) : null;
  const existing = Array.isArray(prior?.items) ? prior.items : [];
  const priorProcessed = Array.isArray(prior?.processedSweepIds)
    ? prior.processedSweepIds
    : Array.from(new Set(existing.flatMap((item: any) => Array.isArray(item?.evidenceSweepIds) ? item.evidenceSweepIds : [])));
  const processedSweepIds = new Set<string>(priorProcessed);
  const byKey = new Map<string, any>();

  for (const item of [...existing, ...(inventory.items || [])]) {
    const key = (item.duplicateGroup || item.assetId || `${item.category}:${item.visibleName}:${item.description}`).toLowerCase();
    const current = byKey.get(key);
    if (!current || item.confidence > current.confidence) byKey.set(key, item);
    else current.evidenceSweepIds = Array.from(new Set([...(current.evidenceSweepIds || []), ...(item.evidenceSweepIds || [])]));
  }

  for (const capture of captures) {
    processedSweepIds.add(String(capture.sweepId));
    const base64 = String(capture.imageDataUri || "").split(",")[1] || "";
    if (!base64) continue;
    const bytes = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));
    await env.BUILDING_DATA.put(`${prefix}/panos/${capture.sweepId}.jpg`, bytes, { httpMetadata: { contentType: "image/jpeg" } });
  }

  const combined = {
    buildingId: building.id,
    matterportSid: building.matterportSid,
    updatedAt: new Date().toISOString(),
    summary: inventory.summary,
    itemCount: byKey.size,
    processedSweepCount: processedSweepIds.size,
    processedSweepIds: Array.from(processedSweepIds),
    items: Array.from(byKey.values())
  };

  await env.BUILDING_DATA.put(`${prefix}/observations/latest.json`, JSON.stringify(combined, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });

  return { persisted: true, itemCount: byKey.size, processedSweepCount: processedSweepIds.size, processedSweepIds: Array.from(processedSweepIds) };
}


export async function loadPersistedGeometryEvidence(building: any, env: any) {
  const result: any = {
    r2Configured: Boolean(env.BUILDING_DATA),
    objPresent: false,
    spatialIndexPresent: false,
    objKey: null,
    objFileName: null,
    spatialIndexKey: null,
    spatialIndex: null
  };
  if (!env.BUILDING_DATA) return result;

  const prefix = `buildings/${building.id}/geometry/`;

  // Geometry filenames are not standardized. Discover by extension instead of
  // assuming model.obj / matterpak.obj / mesh.obj.
  try {
    let cursor: string | undefined;
    do {
      const listed = await env.BUILDING_DATA.list({ prefix, cursor });
      for (const item of listed.objects || []) {
        const key = String(item.key || "");
        const name = key.split("/").pop() || "";
        if (!result.objPresent && /\.obj$/i.test(name)) {
          result.objPresent = true;
          result.objKey = key;
          result.objFileName = name;
        }
        if (!result.spatialIndexPresent && /(?:spatial[-_ ]?index|geometry[-_ ]?summary).*\.json$/i.test(name)) {
          const object = await env.BUILDING_DATA.get(key).catch(() => null);
          if (object) {
            result.spatialIndexPresent = true;
            result.spatialIndexKey = key;
            result.spatialIndex = await object.json().catch(() => null);
          }
        }
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor && (!result.objPresent || !result.spatialIndexPresent));
  } catch {
    // Keep an explicit "missing" status if R2 listing temporarily fails.
  }

  return result;
}
