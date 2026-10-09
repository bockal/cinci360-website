type Point = { x: number; y: number };

function cross(o: Point, a: Point, b: Point) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(points: Point[]) {
  if (points.length <= 1) return points.slice();
  const sorted = points
    .slice()
    .sort((a, b) => a.x - b.x || a.y - b.y)
    .filter((p, i, arr) => i === 0 || p.x !== arr[i - 1].x || p.y !== arr[i - 1].y);
  if (sorted.length <= 2) return sorted;
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function polygonArea(points: Point[]) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

function round(n: number, d = 2) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c] || c));
}

export async function analyzeObjGeometry(building: any, env: any, objKey: string) {
  if (!env.BUILDING_DATA) throw new Error("R2 storage is not configured.");
  const object = await env.BUILDING_DATA.get(objKey);
  if (!object) throw new Error("OBJ file was not found in R2.");

  const decoder = new TextDecoder();
  const reader = object.body.getReader();
  let carry = "";
  let vertexCount = 0;
  let faceCount = 0;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  const sample: Point[] = [];
  const maxSamples = 30000;
  let sampleEvery = 1;

  function handleLine(line: string) {
    if (line.startsWith("v ")) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 4) return;
      const x = Number(parts[1]), y = Number(parts[2]), z = Number(parts[3]);
      if (![x, y, z].every(Number.isFinite)) return;
      vertexCount++;
      minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);

      if (sample.length < maxSamples) {
        sample.push({ x, y });
      } else if (vertexCount % sampleEvery === 0) {
        sampleEvery = Math.max(sampleEvery, Math.ceil(vertexCount / maxSamples));
        const idx = Math.floor((vertexCount / sampleEvery) % maxSamples);
        sample[idx] = { x, y };
      }
    } else if (line.startsWith("f ")) {
      faceCount++;
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    carry += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = carry.indexOf("\n")) >= 0) {
      const line = carry.slice(0, idx).trim();
      carry = carry.slice(idx + 1);
      handleLine(line);
    }
  }
  carry += decoder.decode();
  if (carry.trim()) handleLine(carry.trim());

  if (!vertexCount || !Number.isFinite(minX)) throw new Error("OBJ contains no readable vertices.");

  const hull = convexHull(sample);
  const footprintAreaM2 = polygonArea(hull);
  const lengthM = maxX - minX;
  const widthM = maxY - minY;
  const heightM = maxZ - minZ;
  const mToFt = 3.280839895;
  const m2ToFt2 = 10.763910417;
  const m3ToFt3 = 35.314666721;
  const floors = Number(building?.evidence?.publishedFacts?.floors || 0) || null;
  const grossFloorAreaEstimateFt2 = floors && footprintAreaM2 ? footprintAreaM2 * m2ToFt2 * floors : null;
  const envelopeVolumeM3 = footprintAreaM2 * heightM;

  const analysis = {
    buildingId: building.id,
    sourceObjKey: objKey,
    analyzedAt: new Date().toISOString(),
    classification: "MEASURED / SCREENING",
    limitations: [
      "OBJ top-down plan is a geometry screening preview, not a signed architectural floor plan.",
      "Projected hull may include captured exterior/context geometry.",
      "Envelope volume is not a conditioned HVAC load volume unless enclosed-space segmentation is added."
    ],
    vertexCount,
    faceCount,
    boundsMeters: {
      min: [round(minX, 4), round(minY, 4), round(minZ, 4)],
      max: [round(maxX, 4), round(maxY, 4), round(maxZ, 4)]
    },
    extentsMeters: { length: round(lengthM, 3), width: round(widthM, 3), height: round(heightM, 3) },
    extentsFeet: { length: round(lengthM * mToFt, 2), width: round(widthM * mToFt, 2), height: round(heightM * mToFt, 2) },
    footprintHullAreaM2: round(footprintAreaM2, 2),
    footprintHullAreaFt2: round(footprintAreaM2 * m2ToFt2, 0),
    publishedFloorCount: floors,
    grossFloorAreaEstimateFt2: grossFloorAreaEstimateFt2 ? round(grossFloorAreaEstimateFt2, 0) : null,
    modelEnvelopeVolumeM3: round(envelopeVolumeM3, 0),
    modelEnvelopeVolumeFt3: round(envelopeVolumeM3 * m3ToFt3, 0),
    hullPoints: hull.map(p => [round(p.x, 3), round(p.y, 3)])
  };

  const pad = 26;
  const svgW = 900, svgH = 620;
  const spanX = Math.max(lengthM, 0.001), spanY = Math.max(widthM, 0.001);
  const scale = Math.min((svgW - pad * 2) / spanX, (svgH - pad * 2) / spanY);
  const pts = hull.map(p => {
    const x = pad + (p.x - minX) * scale;
    const y = svgH - pad - (p.y - minY) * scale;
    return `${round(x, 1)},${round(y, 1)}`;
  }).join(" ");
  const title = escapeXml(building.name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="OBJ top-down geometry preview for ${title}">
<rect width="100%" height="100%" fill="#f7f5ef"/>
<polygon points="${pts}" fill="#d9ded8" stroke="#111618" stroke-width="2"/>
<text x="26" y="34" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="#111618">${title}</text>
<text x="26" y="58" font-family="system-ui,sans-serif" font-size="12" fill="#5f6763">OBJ top-down screening footprint · ${round(lengthM * mToFt, 1)} ft × ${round(widthM * mToFt, 1)} ft</text>
<text x="26" y="${svgH - 18}" font-family="system-ui,sans-serif" font-size="11" fill="#6b716e">Geometry preview only — not a Matterport schematic floor plan or architectural drawing.</text>
</svg>`;

  const prefix = `buildings/${building.id}/geometry`;
  await env.BUILDING_DATA.put(`${prefix}/geometry-analysis.json`, JSON.stringify(analysis, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });
  await env.BUILDING_DATA.put(`${prefix}/floor-plan.svg`, svg, {
    httpMetadata: { contentType: "image/svg+xml" }
  });

  return analysis;
}

export async function loadGeometryAnalysis(building: any, env: any) {
  if (!env.BUILDING_DATA) return null;
  const object = await env.BUILDING_DATA.get(`buildings/${building.id}/geometry/geometry-analysis.json`);
  return object ? object.json().catch(() => null) : null;
}

export async function loadFloorPlanSvg(building: any, env: any) {
  if (!env.BUILDING_DATA) return null;
  const object = await env.BUILDING_DATA.get(`buildings/${building.id}/geometry/floor-plan.svg`);
  return object ? object.text().catch(() => null) : null;
}
