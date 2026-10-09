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
  spatialAnchors?: Array<{ sweepId: string; x: number; y: number; z: number; floor?: number | null }>;
};


type ConsolidatedInventoryRecord = {
  inventoryId: string;
  canonicalType: string;
  room: string;
  visibleName: string;
  category: string;
  quantity: number;
  confidence: number;
  evidenceSweepIds: string[];
  observationIds: string[];
  spatialAnchors: Array<{ sweepId: string; x: number; y: number; z: number; floor?: number | null }>;
  countMethod: "max-observed-deduplicated" | "single-observation" | "obj-spatial-reconciled";
  geometryCandidateCount?: number;
  geometryCrewBreakdown?: Record<string, number>;
  geometryLengthRangeFeet?: [number, number] | null;
  spatialObjectIds?: string[];
  geometryReconciliationStatus?: string;
  notes: string;
};

function cleanWords(value: any) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function canonicalAssetType(item: any) {
  const text = cleanWords([item.visibleName, item.category, item.description].filter(Boolean).join(" "));
  if (/\b(rowing shell|rowing shells|racing shell|racing shells|boat shell|boat shells|rowing boat|rowing boats)\b/.test(text)) return "rowing-shell";
  if (/\b(ergometer|ergometers|rowing erg|rowing ergs|indoor rowing machine|indoor rowing machines|concept2)\b/.test(text)) return "rowing-ergometer";
  if (/\b(boat rack|boat racks|shell rack|shell racks|rowing rack|rowing racks)\b/.test(text)) return "rowing-shell-rack";
  const name = cleanWords(item.visibleName || item.category || "observed-asset")
    .replace(/\b(movable|equipment|sports|fitness|visible|observed|indoor)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return name.replace(/\s+/g, "-") || "observed-asset";
}

function canonicalRoom(item: any, canonicalType: string) {
  const room = cleanWords(item.room || "Whole Building / Unassigned");
  if (canonicalType === "rowing-shell" && /(boat|boathouse|workshop).*(storage|hall|bay)|(storage|hall|bay).*(boat|boathouse|workshop)/.test(room)) {
    return "Boat Storage Hall";
  }
  if (canonicalType === "rowing-ergometer" && /main hall/.test(room)) return "Main Hall";
  if (!room || room === "whole building unassigned") return "Whole Building / Unassigned";
  return String(item.room || "Whole Building / Unassigned").trim();
}

function fnv1a(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).toUpperCase();
}

function mergeAnchors(items: any[]) {
  const seen = new Set<string>();
  const anchors: any[] = [];
  for (const item of items) {
    for (const a of Array.isArray(item?.spatialAnchors) ? item.spatialAnchors : []) {
      const x = Number(a?.x), y = Number(a?.y), z = Number(a?.z);
      if (![x,y,z].every(Number.isFinite)) continue;
      const key = String(a?.sweepId || "") + ":" + x.toFixed(2) + ":" + y.toFixed(2) + ":" + z.toFixed(2);
      if (seen.has(key)) continue;
      seen.add(key);
      anchors.push({ sweepId: String(a?.sweepId || ""), x, y, z, floor: a?.floor ?? null });
    }
  }
  return anchors;
}

export function consolidateVisualInventory(building: any, observations: any[]): ConsolidatedInventoryRecord[] {
  const groups = new Map<string, any[]>();
  for (const item of Array.isArray(observations) ? observations : []) {
    const canonicalType = canonicalAssetType(item);
    const room = canonicalRoom(item, canonicalType);
    const key = canonicalType + "|" + cleanWords(room);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const out: ConsolidatedInventoryRecord[] = [];
  for (const [key, group] of groups) {
    const canonicalType = canonicalAssetType(group[0]);
    const room = canonicalRoom(group[0], canonicalType);
    const quantities = group.map(x => Number(x?.quantity || 0)).filter(x => Number.isFinite(x) && x > 0);
    // Repeated panoramas are alternate observations of the same room-level inventory.
    // Never sum repeated grouped counts; use the most complete observed count.
    const quantity = quantities.length ? Math.max(...quantities) : 1;
    const confidence = group.reduce((best, x) => Math.max(best, Number(x?.confidence || 0)), 0);
    const evidenceSweepIds = Array.from(new Set(group.flatMap(x => Array.isArray(x?.evidenceSweepIds) ? x.evidenceSweepIds.map(String) : [])));
    const observationIds = Array.from(new Set(group.map((x, i) => String(x?.assetId || x?.duplicateGroup || "obs-" + i))));
    const spatialAnchors = mergeAnchors(group);
    const strongest = [...group].sort((a,b) => Number(b?.confidence || 0) - Number(a?.confidence || 0))[0] || group[0];
    const visibleName = canonicalType === "rowing-shell"
      ? "Rowing shells"
      : canonicalType === "rowing-ergometer"
        ? "Rowing ergometers"
        : String(strongest?.visibleName || strongest?.category || "Observed asset");
    out.push({
      inventoryId: "INV-" + String(building?.id || "BLDG").replace(/[^A-Za-z0-9]/g, "") + "-" + fnv1a(key),
      canonicalType,
      room,
      visibleName,
      category: String(strongest?.category || ""),
      quantity,
      confidence,
      evidenceSweepIds,
      observationIds,
      spatialAnchors,
      countMethod: group.length > 1 ? "max-observed-deduplicated" : "single-observation",
      notes: group.length > 1
        ? "Consolidated from " + group.length + " panorama observations; repeated counts were not summed."
        : String(strongest?.notes || "")
    });
  }
  return out.sort((a,b) => a.room.localeCompare(b.room) || a.visibleName.localeCompare(b.visibleName));
}


function enrichConsolidatedWithGeometry(records: ConsolidatedInventoryRecord[], geometryAnalysis: any) {
  const candidates = Array.isArray(geometryAnalysis?.spatialObjects?.rowingShellCandidates)
    ? geometryAnalysis.spatialObjects.rowingShellCandidates
    : [];
  if (!candidates.length) return records;
  const breakdown: Record<string, number> = {};
  let minFeet = Infinity, maxFeet = -Infinity;
  for (const c of candidates) {
    const cls = String(c?.estimatedCrewClass || "unclassified");
    breakdown[cls] = (breakdown[cls] || 0) + 1;
    const ft = Number(c?.lengthFeet);
    if (Number.isFinite(ft)) { minFeet = Math.min(minFeet, ft); maxFeet = Math.max(maxFeet, ft); }
  }
  return records.map(record => {
    if (record.canonicalType !== "rowing-shell") return record;
    const geometryCount = candidates.length;
    const visualCount = Number(record.quantity || 0);
    const avgConfidence = candidates.reduce((s: number, x: any) => s + Number(x?.confidence || 0), 0) / geometryCount;
    const closeAgreement = visualCount > 0 && Math.abs(geometryCount - visualCount) <= Math.max(2, Math.ceil(visualCount * 0.15));
    const highEnough = avgConfidence >= 0.62;
    return {
      ...record,
      geometryCandidateCount: geometryCount,
      geometryCrewBreakdown: breakdown,
      geometryLengthRangeFeet: Number.isFinite(minFeet) && Number.isFinite(maxFeet) ? [Math.round(minFeet * 10) / 10, Math.round(maxFeet * 10) / 10] as [number, number] : null,
      spatialObjectIds: candidates.map((x: any) => String(x?.objectId || "")).filter(Boolean),
      geometryReconciliationStatus: closeAgreement && highEnough
        ? "VISUAL/OBJ COUNTS AGREE"
        : "OBJ CANDIDATES REQUIRE REVIEW",
      countMethod: closeAgreement && highEnough ? "obj-spatial-reconciled" as const : record.countMethod,
      quantity: closeAgreement && highEnough ? geometryCount : record.quantity,
      confidence: closeAgreement && highEnough ? Math.max(record.confidence, Math.min(0.94, avgConfidence + 0.06)) : record.confidence,
      notes: (record.notes ? record.notes + " " : "") +
        "OBJ spatial layer found " + geometryCount + " elongated shell candidates" +
        (Number.isFinite(minFeet) ? " spanning " + minFeet.toFixed(1) + "–" + maxFeet.toFixed(1) + " ft" : "") +
        "; crew-class breakdown: " + Object.entries(breakdown).map(([k,v]) => k + " " + v).join(", ") + "."
    };
  });
}

async function loadGeometryAnalysisForInventory(building: any, env: any) {
  if (!env.BUILDING_DATA) return null;
  const object = await env.BUILDING_DATA.get(`buildings/${building.id}/geometry/geometry-analysis.json`).catch(() => null);
  return object ? object.json().catch(() => null) : null;
}

export async function rebuildConsolidatedInventory(building: any, env: any) {
  if (!env.BUILDING_DATA) throw new Error("R2 binding BUILDING_DATA is not configured.");
  const prefix = `buildings/${building.id}`;
  const priorObj = await env.BUILDING_DATA.get(`${prefix}/observations/latest.json`);
  if (!priorObj) throw new Error("No visual observations are stored for this building.");
  const data: any = await priorObj.json();
  const items = Array.isArray(data.items) ? data.items : [];

  const sweepIds = Array.from(new Set(items.flatMap((item: any) =>
    Array.isArray(item?.evidenceSweepIds) ? item.evidenceSweepIds.map(String) : []
  )));
  const anchorBySweep = new Map<string, any>();
  for (const sid of sweepIds) {
    const pano = await env.BUILDING_DATA.head(`${prefix}/panos/${sid}.jpg`).catch(() => null);
    const custom = pano?.customMetadata || {};
    let position: any = null;
    try { if (custom.position) position = JSON.parse(custom.position); } catch {}
    if (position && [Number(position.x), Number(position.y), Number(position.z)].every(Number.isFinite)) {
      anchorBySweep.set(sid, {
        sweepId: sid,
        x: Number(position.x),
        y: Number(position.y),
        z: Number(position.z),
        floor: custom.floor === "" || custom.floor == null ? null : Number(custom.floor)
      });
    }
  }

  const hydratedItems = items.map((item: any) => ({
    ...item,
    spatialAnchors: Array.from(new Map([
      ...((Array.isArray(item?.spatialAnchors) ? item.spatialAnchors : []).map((a: any) => [String(a?.sweepId || ""), a])),
      ...((Array.isArray(item?.evidenceSweepIds) ? item.evidenceSweepIds : []).map((sid: any) => {
        const anchor = anchorBySweep.get(String(sid));
        return [String(sid), anchor];
      }).filter((x: any) => x[1]))
    ]).values())
  }));

  const geometryAnalysis = await loadGeometryAnalysisForInventory(building, env);
  const base = consolidateVisualInventory(building, hydratedItems);
  const consolidatedInventory = enrichConsolidatedWithGeometry(base, geometryAnalysis);
  const updated = {
    ...data,
    updatedAt: new Date().toISOString(),
    items: hydratedItems,
    consolidatedItemCount: consolidatedInventory.length,
    consolidatedInventory,
    spatialInventoryVersion: "visual-obj-reconcile-v1"
  };
  await env.BUILDING_DATA.put(`${prefix}/observations/latest.json`, JSON.stringify(updated, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });
  return {
    buildingId: building.id,
    rawObservationCount: hydratedItems.length,
    consolidatedItemCount: consolidatedInventory.length,
    spatialAnchorCount: anchorBySweep.size,
    shellInventory: consolidatedInventory.filter((x: any) => x.canonicalType === "rowing-shell"),
    spatialInventoryVersion: updated.spatialInventoryVersion
  };
}

export async function loadPersistedVisualEvidence(building: any, env: any) {
  if (!env.BUILDING_DATA) return null;
  const prefix = `buildings/${building.id}`;
  const object = await env.BUILDING_DATA.get(`${prefix}/observations/latest.json`);
  if (!object) return null;
  const data: any = await object.json().catch(() => null);
  if (!data) return null;

  const storedProcessed = new Set<string>(Array.isArray(data.processedSweepIds) ? data.processedSweepIds : []);
  const persistedPanos = new Set<string>();
  let panoListingSucceeded = false;
  try {
    let cursor: string | undefined;
    do {
      const listed = await env.BUILDING_DATA.list({ prefix: `${prefix}/panos/`, cursor });
      panoListingSucceeded = true;
      for (const item of listed.objects || []) {
        const name = String(item.key || "").split("/").pop() || "";
        if (/\.jpg$/i.test(name)) persistedPanos.add(name.slice(0, -4));
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
  } catch {
    // Fall back to the observation checkpoint only if R2 listing is unavailable.
  }

  // A panorama only counts as complete when the actual pano object exists in R2.
  // This prevents stale/truncated checkpoint IDs from overstating completeness.
  const processed = panoListingSucceeded ? persistedPanos : storedProcessed;
  data.processedSweepIds = Array.from(processed);
  data.processedSweepCount = processed.size;
  const observations = Array.isArray(data.items) ? data.items : [];
  const geometryAnalysis = await loadGeometryAnalysisForInventory(building, env);
  data.consolidatedInventory = enrichConsolidatedWithGeometry(consolidateVisualInventory(building, observations), geometryAnalysis);
  data.consolidatedItemCount = data.consolidatedInventory.length;
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
  const priorAnalyzed = Array.isArray(prior?.analyzedSweepIds)
    ? prior.analyzedSweepIds
    : Array.isArray(prior?.processedSweepIds)
      ? prior.processedSweepIds
      : Array.from(new Set(existing.flatMap((item: any) => Array.isArray(item?.evidenceSweepIds) ? item.evidenceSweepIds : [])));
  const analyzedSweepIds = new Set<string>(priorAnalyzed);
  const byKey = new Map<string, any>();
  const captureBySweep = new Map<string, any>(captures.map((capture: any) => [String(capture.sweepId), capture]));
  const incoming = (inventory.items || []).map((item: any) => {
    const anchors = (item.evidenceSweepIds || []).map((sid: any) => {
      const capture = captureBySweep.get(String(sid));
      const p = capture?.position;
      if (!p || ![Number(p.x), Number(p.y), Number(p.z)].every(Number.isFinite)) return null;
      return { sweepId: String(sid), x: Number(p.x), y: Number(p.y), z: Number(p.z), floor: capture?.floor ?? null };
    }).filter(Boolean);
    return { ...item, spatialAnchors: anchors };
  });

  for (const item of [...existing, ...incoming]) {
    const key = (item.duplicateGroup || item.assetId || `${item.category}:${item.visibleName}:${item.description}`).toLowerCase();
    const current = byKey.get(key);
    if (!current || item.confidence > current.confidence) byKey.set(key, item);
    else current.evidenceSweepIds = Array.from(new Set([...(current.evidenceSweepIds || []), ...(item.evidenceSweepIds || [])]));
  }

  for (const capture of captures) {
    analyzedSweepIds.add(String(capture.sweepId));
    const base64 = String(capture.imageDataUri || "").split(",")[1] || "";
    if (!base64) continue;
    const bytes = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));
    await env.BUILDING_DATA.put(`${prefix}/panos/${capture.sweepId}.jpg`, bytes, { httpMetadata: { contentType: "image/jpeg" } });
  }

  const rawItems = Array.from(byKey.values());
  const geometryAnalysis = await loadGeometryAnalysisForInventory(building, env);
  const consolidatedInventory = enrichConsolidatedWithGeometry(consolidateVisualInventory(building, rawItems), geometryAnalysis);
  const combined = {
    buildingId: building.id,
    matterportSid: building.matterportSid,
    updatedAt: new Date().toISOString(),
    summary: inventory.summary,
    itemCount: rawItems.length,
    consolidatedItemCount: consolidatedInventory.length,
    analyzedSweepCount: analyzedSweepIds.size,
    analyzedSweepIds: Array.from(analyzedSweepIds),
    processedSweepCount: analyzedSweepIds.size,
    processedSweepIds: Array.from(analyzedSweepIds),
    items: rawItems,
    consolidatedInventory
  };

  await env.BUILDING_DATA.put(`${prefix}/observations/latest.json`, JSON.stringify(combined, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });

  return { persisted: true, itemCount: rawItems.length, consolidatedItemCount: consolidatedInventory.length, analyzedSweepCount: analyzedSweepIds.size, analyzedSweepIds: Array.from(analyzedSweepIds), processedSweepCount: analyzedSweepIds.size, processedSweepIds: Array.from(analyzedSweepIds) };
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


export async function listBuildingEvidenceAssets(building: any, env: any) {
  const result: any = {
    buildingId: building.id,
    totalObjects: 0,
    panoramaCount: 0,
    categories: {
      panoramas: [],
      geometry: [],
      textures: [],
      documents: [],
      analysis: [],
      other: []
    }
  };
  if (!env.BUILDING_DATA) return result;

  const prefix = `buildings/${building.id}/`;
  let cursor: string | undefined;
  do {
    const listed = await env.BUILDING_DATA.list({ prefix, cursor });
    for (const item of listed.objects || []) {
      const key = String(item.key || "");
      const name = key.split("/").pop() || key;
      const lower = name.toLowerCase();
      const entry = {
        key,
        name,
        size: Number(item.size || 0),
        uploaded: item.uploaded || null,
        etag: item.etag || null
      };
      result.totalObjects++;
      if (/\/panos\/[^/]+\.(jpg|jpeg|png|webp)$/i.test(key)) {
        result.panoramaCount++;
        result.categories.panoramas.push(entry);
      } else if (/\.(obj|mtl|ply|e57|xyz|las|laz)$/i.test(lower)) {
        result.categories.geometry.push(entry);
      } else if (/\.(jpg|jpeg|png|webp|tif|tiff)$/i.test(lower)) {
        result.categories.textures.push(entry);
      } else if (/\.(pdf|csv|xlsx?|docx?|txt)$/i.test(lower)) {
        result.categories.documents.push(entry);
      } else if (/\/(observations|geometry)\/.*\.(json|svg)$/i.test(key) || /(analysis|spatial|floor[-_ ]?plan)/i.test(lower)) {
        result.categories.analysis.push(entry);
      } else {
        result.categories.other.push(entry);
      }
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  return result;
}


function bytesToDataUri(bytes: Uint8Array, contentType = "image/jpeg") {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

export async function persistRawPanorama(building: any, sweepId: string, body: ReadableStream | ArrayBuffer | Uint8Array, env: any, metadata: any = {}) {
  if (!env.BUILDING_DATA) throw new Error("R2 binding BUILDING_DATA is not configured.");
  const safeSweep = String(sweepId || "").replace(/[^A-Za-z0-9_-]/g, "");
  if (!safeSweep) throw new Error("Sweep ID is required.");
  const key = `buildings/${building.id}/panos/${safeSweep}.jpg`;
  await env.BUILDING_DATA.put(key, body as any, {
    httpMetadata: { contentType: "image/jpeg" },
    customMetadata: {
      buildingId: building.id,
      sweepId: safeSweep,
      floor: metadata.floor == null ? "" : String(metadata.floor),
      position: metadata.position ? JSON.stringify(metadata.position).slice(0, 400) : "",
      capturedAt: new Date().toISOString()
    }
  });
  return { persisted: true, key, sweepId: safeSweep };
}

export async function analyzeStoredPanorama(building: any, sweepId: string, env: any, metadata: any = {}) {
  if (!env.BUILDING_DATA) throw new Error("R2 binding BUILDING_DATA is not configured.");
  const safeSweep = String(sweepId || "").replace(/[^A-Za-z0-9_-]/g, "");
  const object = await env.BUILDING_DATA.get(`buildings/${building.id}/panos/${safeSweep}.jpg`);
  if (!object) throw new Error("Stored panorama was not found in R2.");
  const bytes = new Uint8Array(await object.arrayBuffer());
  let storedPosition: any = null;
  let storedFloor: any = null;
  try {
    const custom = object.customMetadata || {};
    if (custom.position) storedPosition = JSON.parse(custom.position);
    if (custom.floor !== "" && custom.floor != null) storedFloor = Number(custom.floor);
  } catch {}
  const capture = {
    sweepId: safeSweep,
    floor: metadata.floor ?? storedFloor ?? null,
    position: metadata.position ?? storedPosition ?? null,
    imageDataUri: bytesToDataUri(bytes, "image/jpeg")
  };
  const inventory = await analyzeVisualCaptures(building, [capture], env);
  const persistence = await persistVisualBatch(building, [capture], inventory, env);
  return { summary: inventory.summary, batchItems: inventory.items?.length || 0, ...persistence };
}
