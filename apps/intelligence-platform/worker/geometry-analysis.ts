type Point = { x: number; y: number };

type FloorPlanResult = {
  floor: number;
  floorZ: number;
  sliceZ: number;
  areaM2: number;
  areaFt2: number;
  widthM: number;
  depthM: number;
  widthFt: number;
  depthFt: number;
  roomCandidates: Array<{
    id: string;
    areaM2: number;
    areaFt2: number;
    widthM: number;
    depthM: number;
    widthFt: number;
    depthFt: number;
    center: [number, number];
  }>;
  svg: string;
};

const M_TO_FT = 3.280839895;
const M2_TO_FT2 = 10.763910417;
const M3_TO_FT3 = 35.314666721;

function round(n: number, d = 2) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c] || c));
}

function triangleMetrics(vertices: number[], ia: number, ib: number, ic: number) {
  const ax = vertices[ia * 3], ay = vertices[ia * 3 + 1], az = vertices[ia * 3 + 2];
  const bx = vertices[ib * 3], by = vertices[ib * 3 + 1], bz = vertices[ib * 3 + 2];
  const cx = vertices[ic * 3], cy = vertices[ic * 3 + 1], cz = vertices[ic * 3 + 2];
  const abx = bx - ax, aby = by - ay, abz = bz - az;
  const acx = cx - ax, acy = cy - ay, acz = cz - az;
  const nx = aby * acz - abz * acy;
  const ny = abz * acx - abx * acz;
  const nz = abx * acy - aby * acx;
  const norm = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1e-9;
  return {
    ax, ay, az, bx, by, bz, cx, cy, cz,
    area: norm * 0.5,
    absNz: Math.abs(nz) / norm,
    minZ: Math.min(az, bz, cz),
    maxZ: Math.max(az, bz, cz),
    centroidZ: (az + bz + cz) / 3
  };
}

function parseFaceVertex(token: string, vertexCount: number) {
  const raw = Number(token.split("/")[0]);
  if (!Number.isInteger(raw) || raw === 0) return -1;
  return raw > 0 ? raw - 1 : vertexCount + raw;
}

function addHistogram(hist: Map<number, number>, z: number, area: number, binSize: number) {
  const bin = Math.round(z / binSize);
  hist.set(bin, (hist.get(bin) || 0) + area);
}

function intersectTriangleAtZ(vertices: number[], ia: number, ib: number, ic: number, z: number) {
  const ids = [ia, ib, ic];
  const points: Point[] = [];
  for (let e = 0; e < 3; e++) {
    const i0 = ids[e], i1 = ids[(e + 1) % 3];
    const x0 = vertices[i0 * 3], y0 = vertices[i0 * 3 + 1], z0 = vertices[i0 * 3 + 2];
    const x1 = vertices[i1 * 3], y1 = vertices[i1 * 3 + 1], z1 = vertices[i1 * 3 + 2];
    const d0 = z0 - z, d1 = z1 - z;
    if (Math.abs(d0) < 1e-7 && Math.abs(d1) < 1e-7) continue;
    if ((d0 <= 0 && d1 >= 0) || (d0 >= 0 && d1 <= 0)) {
      const denom = z1 - z0;
      if (Math.abs(denom) < 1e-9) continue;
      const t = (z - z0) / denom;
      if (t < -1e-6 || t > 1 + 1e-6) continue;
      const p = { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t };
      if (!points.some(q => Math.abs(q.x - p.x) < 1e-5 && Math.abs(q.y - p.y) < 1e-5)) points.push(p);
    }
  }
  return points.length >= 2 ? [points[0], points[1]] as [Point, Point] : null;
}

function dilate(src: Uint8Array, width: number, height: number, radius: number) {
  if (radius <= 0) return src.slice();
  const out = new Uint8Array(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!src[y * width + x]) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          if (dx * dx + dy * dy <= radius * radius) out[yy * width + xx] = 1;
        }
      }
    }
  }
  return out;
}

function drawGridLine(grid: Uint8Array, width: number, height: number, x0: number, y0: number, x1: number, y1: number) {
  let ix0 = Math.round(x0), iy0 = Math.round(y0), ix1 = Math.round(x1), iy1 = Math.round(y1);
  const dx = Math.abs(ix1 - ix0), sx = ix0 < ix1 ? 1 : -1;
  const dy = -Math.abs(iy1 - iy0), sy = iy0 < iy1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    if (ix0 >= 0 && ix0 < width && iy0 >= 0 && iy0 < height) grid[iy0 * width + ix0] = 1;
    if (ix0 === ix1 && iy0 === iy1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; ix0 += sx; }
    if (e2 <= dx) { err += dx; iy0 += sy; }
  }
}

function floodExterior(blocked: Uint8Array, width: number, height: number) {
  const outside = new Uint8Array(blocked.length);
  const qx = new Int32Array(blocked.length);
  const qy = new Int32Array(blocked.length);
  let head = 0, tail = 0;
  function push(x: number, y: number) {
    const i = y * width + x;
    if (blocked[i] || outside[i]) return;
    outside[i] = 1;
    qx[tail] = x; qy[tail] = y; tail++;
  }
  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 1; y < height - 1; y++) { push(0, y); push(width - 1, y); }
  while (head < tail) {
    const x = qx[head], y = qy[head]; head++;
    if (x > 0) push(x - 1, y);
    if (x + 1 < width) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < height) push(x, y + 1);
  }
  return outside;
}

function connectedComponents(mask: Uint8Array, width: number, height: number) {
  const seen = new Uint8Array(mask.length);
  const result: number[][] = [];
  const queue = new Int32Array(mask.length);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || seen[i]) continue;
    let head = 0, tail = 0;
    queue[tail++] = i; seen[i] = 1;
    const cells: number[] = [];
    while (head < tail) {
      const cur = queue[head++]; cells.push(cur);
      const x = cur % width, y = Math.floor(cur / width);
      const neighbors = [cur - 1, cur + 1, cur - width, cur + width];
      for (let n = 0; n < 4; n++) {
        const next = neighbors[n];
        if (next < 0 || next >= mask.length || seen[next] || !mask[next]) continue;
        if (n === 0 && x === 0) continue;
        if (n === 1 && x === width - 1) continue;
        seen[next] = 1; queue[tail++] = next;
      }
    }
    result.push(cells);
  }
  return result;
}

function runsToSvg(mask: Uint8Array, width: number, height: number, cellPx: number, xOffset = 0, yOffset = 0, fill = "#111618") {
  let out = "";
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      while (x < width && !mask[y * width + x]) x++;
      if (x >= width) break;
      const start = x;
      while (x < width && mask[y * width + x]) x++;
      out += `<rect x="${round(xOffset + start * cellPx, 2)}" y="${round(yOffset + y * cellPx, 2)}" width="${round((x - start) * cellPx, 2)}" height="${round(cellPx + 0.25, 2)}" fill="${fill}"/>`;
    }
  }
  return out;
}

function buildFloorPlan(
  building: any,
  floorIndex: number,
  floorZ: number,
  vertices: number[],
  verticalFaces: number[],
  overallBounds: { minX: number; minY: number; maxX: number; maxY: number }
): FloorPlanResult | null {
  const sliceZ = floorZ + 1.05;
  const cell = 0.15;
  const marginM = 1.5;
  const minX = overallBounds.minX - marginM, minY = overallBounds.minY - marginM;
  const maxX = overallBounds.maxX + marginM, maxY = overallBounds.maxY + marginM;
  let width = Math.ceil((maxX - minX) / cell) + 1;
  let height = Math.ceil((maxY - minY) / cell) + 1;
  const maxCells = 420000;
  let effectiveCell = cell;
  if (width * height > maxCells) {
    const factor = Math.sqrt((width * height) / maxCells);
    effectiveCell = cell * factor;
    width = Math.ceil((maxX - minX) / effectiveCell) + 1;
    height = Math.ceil((maxY - minY) / effectiveCell) + 1;
  }

  const walls = new Uint8Array(width * height);
  let segmentCount = 0;
  for (let i = 0; i < verticalFaces.length; i += 3) {
    const ia = verticalFaces[i], ib = verticalFaces[i + 1], ic = verticalFaces[i + 2];
    const az = vertices[ia * 3 + 2], bz = vertices[ib * 3 + 2], cz = vertices[ic * 3 + 2];
    if (sliceZ < Math.min(az, bz, cz) || sliceZ > Math.max(az, bz, cz)) continue;
    const seg = intersectTriangleAtZ(vertices, ia, ib, ic, sliceZ);
    if (!seg) continue;
    const dx = seg[1].x - seg[0].x, dy = seg[1].y - seg[0].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.06 || len > 12) continue;
    const x0 = (seg[0].x - minX) / effectiveCell, y0 = (maxY - seg[0].y) / effectiveCell;
    const x1 = (seg[1].x - minX) / effectiveCell, y1 = (maxY - seg[1].y) / effectiveCell;
    drawGridLine(walls, width, height, x0, y0, x1, y1);
    segmentCount++;
  }
  if (segmentCount < 25) return null;

  // Close openings only for envelope detection. The original wall grid remains
  // untouched for the rendered interior wall structure.
  const closeRadius = Math.max(3, Math.round(0.7 / effectiveCell));
  const closed = dilate(walls, width, height, closeRadius);
  const outside = floodExterior(closed, width, height);
  const footprint = new Uint8Array(walls.length);
  for (let i = 0; i < footprint.length; i++) if (!outside[i]) footprint[i] = 1;

  // Remove tiny enclosed islands caused by furniture / scan artifacts.
  const footprintComponents = connectedComponents(footprint, width, height)
    .sort((a, b) => b.length - a.length);
  if (!footprintComponents.length) return null;
  const mainCells = footprintComponents[0];
  const mainSet = new Uint8Array(footprint.length);
  for (const idx of mainCells) mainSet[idx] = 1;

  let minGX = width, minGY = height, maxGX = 0, maxGY = 0;
  for (const idx of mainCells) {
    const x = idx % width, y = Math.floor(idx / width);
    minGX = Math.min(minGX, x); minGY = Math.min(minGY, y);
    maxGX = Math.max(maxGX, x); maxGY = Math.max(maxGY, y);
  }
  const padCells = Math.max(5, Math.round(0.8 / effectiveCell));
  minGX = Math.max(0, minGX - padCells); minGY = Math.max(0, minGY - padCells);
  maxGX = Math.min(width - 1, maxGX + padCells); maxGY = Math.min(height - 1, maxGY + padCells);
  const cropW = maxGX - minGX + 1, cropH = maxGY - minGY + 1;

  const croppedFoot = new Uint8Array(cropW * cropH);
  const croppedWalls = new Uint8Array(cropW * cropH);
  for (let y = minGY; y <= maxGY; y++) {
    for (let x = minGX; x <= maxGX; x++) {
      const src = y * width + x, dst = (y - minGY) * cropW + (x - minGX);
      if (mainSet[src]) croppedFoot[dst] = 1;
      // Keep wall evidence inside/near the main footprint, including columns.
      let nearMain = mainSet[src] === 1;
      if (!nearMain) {
        for (let dy = -2; dy <= 2 && !nearMain; dy++) for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && xx < width && yy >= 0 && yy < height && mainSet[yy * width + xx]) { nearMain = true; break; }
        }
      }
      if (walls[src] && nearMain) croppedWalls[dst] = 1;
    }
  }

  // Outer boundary from the evidence-derived footprint.
  const boundary = new Uint8Array(croppedFoot.length);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const i = y * cropW + x;
      if (!croppedFoot[i]) continue;
      if (x === 0 || y === 0 || x === cropW - 1 || y === cropH - 1 ||
          !croppedFoot[i - 1] || !croppedFoot[i + 1] ||
          !croppedFoot[i - cropW] || !croppedFoot[i + cropW]) boundary[i] = 1;
    }
  }

  // Room candidates: close smaller gaps in the interior-wall network and flood
  // the footprint. These are geometric spaces, not semantic room names.
  const roomWalls = dilate(croppedWalls, cropW, cropH, Math.max(1, Math.round(0.35 / effectiveCell)));
  const open = new Uint8Array(croppedFoot.length);
  for (let i = 0; i < open.length; i++) if (croppedFoot[i] && !roomWalls[i]) open[i] = 1;
  const roomComponents = connectedComponents(open, cropW, cropH)
    .filter(cells => cells.length * effectiveCell * effectiveCell >= 3.0)
    .sort((a, b) => b.length - a.length)
    .slice(0, 40);

  const roomMasks = roomComponents.map(cells => {
    const mask = new Uint8Array(cropW * cropH);
    for (const cellIndex of cells) mask[cellIndex] = 1;
    return mask;
  });

  const roomCandidates = roomComponents.map((cells, idx) => {
    let loX = cropW, loY = cropH, hiX = 0, hiY = 0, sumX = 0, sumY = 0;
    for (const cellIndex of cells) {
      const x = cellIndex % cropW, y = Math.floor(cellIndex / cropW);
      loX = Math.min(loX, x); loY = Math.min(loY, y); hiX = Math.max(hiX, x); hiY = Math.max(hiY, y);
      sumX += x; sumY += y;
    }
    const areaM2 = cells.length * effectiveCell * effectiveCell;
    const widthM = (hiX - loX + 1) * effectiveCell;
    const depthM = (hiY - loY + 1) * effectiveCell;
    return {
      id: `F${floorIndex}-S${idx + 1}`,
      areaM2: round(areaM2, 2),
      areaFt2: round(areaM2 * M2_TO_FT2, 0),
      widthM: round(widthM, 2),
      depthM: round(depthM, 2),
      widthFt: round(widthM * M_TO_FT, 1),
      depthFt: round(depthM * M_TO_FT, 1),
      center: [round(sumX / cells.length, 1), round(sumY / cells.length, 1)] as [number, number]
    };
  });

  const areaM2 = mainCells.length * effectiveCell * effectiveCell;
  const widthM = (maxGX - minGX + 1) * effectiveCell;
  const depthM = (maxGY - minGY + 1) * effectiveCell;

  const svgW = 1100, svgH = 760, pad = 64;
  const px = Math.min((svgW - pad * 2) / cropW, (svgH - pad * 2) / cropH);
  const drawW = cropW * px, drawH = cropH * px;
  const ox = (svgW - drawW) / 2, oy = (svgH - drawH) / 2 + 12;
  const title = escapeXml(building.name);

  let roomFills = "";
  for (let i = 0; i < roomMasks.length; i++) {
    const fill = i % 2 === 0 ? "#f2f1ed" : "#f8f7f3";
    roomFills += runsToSvg(roomMasks[i], cropW, cropH, px, ox, oy, fill);
  }

  let labels = "";
  for (const room of roomCandidates.slice(0, 16)) {
    if (room.areaFt2 < 55) continue;
    const cx = ox + room.center[0] * px, cy = oy + room.center[1] * px;
    labels += `<text x="${round(cx, 1)}" y="${round(cy, 1)}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#5f6763">SPACE ${escapeXml(room.id)}</text>`;
    labels += `<text x="${round(cx, 1)}" y="${round(cy + 13, 1)}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#7b817e">${room.widthFt}' × ${room.depthFt}' · ${room.areaFt2} sf</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="Evidence-derived floor plan for ${title}, floor ${floorIndex}">
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="38" y="38" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="#111618">${title}</text>
<text x="38" y="60" font-family="system-ui,sans-serif" font-size="12" fill="#5f6763">Floor ${floorIndex} · MatterPak wall-slice reconstruction · ${round(areaM2 * M2_TO_FT2, 0).toLocaleString("en-US")} sq ft geometry estimate</text>
${runsToSvg(croppedFoot, cropW, cropH, px, ox, oy, "#ffffff")}
${roomFills}
${runsToSvg(boundary, cropW, cropH, px, ox, oy, "#111618")}
${runsToSvg(croppedWalls, cropW, cropH, px, ox, oy, "#111618")}
${labels}
<text x="38" y="${svgH - 24}" font-family="system-ui,sans-serif" font-size="11" fill="#6b716e">Derived from OBJ mesh intersections approximately 3.4 ft above the detected floor plane. Interior-space labels are geometric candidates pending semantic room matching.</text>
</svg>`;

  return {
    floor: floorIndex,
    floorZ: round(floorZ, 3),
    sliceZ: round(sliceZ, 3),
    areaM2: round(areaM2, 2),
    areaFt2: round(areaM2 * M2_TO_FT2, 0),
    widthM: round(widthM, 2),
    depthM: round(depthM, 2),
    widthFt: round(widthM * M_TO_FT, 1),
    depthFt: round(depthM * M_TO_FT, 1),
    roomCandidates,
    svg
  };
}

function selectFloorLevels(
  hist: Map<number, number>,
  binSize: number,
  vertices: number[],
  verticalFaces: number[],
  desiredFloors: number | null
) {
  const bins = Array.from(hist.keys()).sort((a, b) => a - b);
  if (!bins.length) return [] as number[];
  const smoothed = new Map<number, number>();
  let maxArea = 0;
  for (const b of bins) {
    const v = (hist.get(b - 1) || 0) + (hist.get(b) || 0) + (hist.get(b + 1) || 0);
    smoothed.set(b, v); maxArea = Math.max(maxArea, v);
  }
  const candidates: Array<{ z: number; area: number; wallCross: number; score: number }> = [];
  for (const b of bins) {
    const area = smoothed.get(b) || 0;
    if (area < maxArea * 0.012) continue;
    if (area < (smoothed.get(b - 1) || 0) || area < (smoothed.get(b + 1) || 0)) continue;
    const z = b * binSize;
    const sliceZ = z + 1.05;
    let wallCross = 0;
    for (let i = 0; i < verticalFaces.length; i += 3) {
      const ia = verticalFaces[i], ib = verticalFaces[i + 1], ic = verticalFaces[i + 2];
      const az = vertices[ia * 3 + 2], bz = vertices[ib * 3 + 2], cz = vertices[ic * 3 + 2];
      if (sliceZ >= Math.min(az, bz, cz) && sliceZ <= Math.max(az, bz, cz)) wallCross++;
    }
    if (wallCross < 40) continue;
    candidates.push({ z, area, wallCross, score: area * Math.log(1 + wallCross) });
  }

  // De-duplicate nearby horizontal surfaces representing the same floor.
  const picked: typeof candidates = [];
  for (const c of candidates.sort((a, b) => b.score - a.score)) {
    if (picked.some(p => Math.abs(p.z - c.z) < 1.6)) continue;
    picked.push(c);
  }

  const count = desiredFloors || Math.min(4, Math.max(1, picked.length));
  return picked.slice(0, count).sort((a, b) => a.z - b.z).map(p => p.z);
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
  const vertices: number[] = [];
  const verticalFaces: number[] = [];
  const horizontalHistogram = new Map<number, number>();
  const binSize = 0.15;
  const usedMaterials = new Set<string>();
  const referencedMtlFiles = new Set<string>();
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  function addTriangle(ia: number, ib: number, ic: number) {
    if (ia < 0 || ib < 0 || ic < 0 || ia >= vertexCount || ib >= vertexCount || ic >= vertexCount) return;
    const m = triangleMetrics(vertices, ia, ib, ic);
    if (!Number.isFinite(m.area) || m.area < 0.00005) return;
    faceCount++;
    if (m.absNz > 0.88 && m.area > 0.003) addHistogram(horizontalHistogram, m.centroidZ, m.area, binSize);
    if (m.absNz < 0.72 && m.maxZ - m.minZ > 0.18) verticalFaces.push(ia, ib, ic);
  }

  function handleLine(line: string) {
    if (line.startsWith("v ")) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 4) return;
      const x = Number(parts[1]), y = Number(parts[2]), z = Number(parts[3]);
      if (![x, y, z].every(Number.isFinite)) return;
      vertices.push(x, y, z);
      vertexCount++;
      minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
    } else if (line.startsWith("f ")) {
      const tokens = line.trim().split(/\s+/).slice(1);
      if (tokens.length < 3) return;
      const ids = tokens.map(t => parseFaceVertex(t, vertexCount)).filter(i => i >= 0);
      for (let k = 1; k + 1 < ids.length; k++) addTriangle(ids[0], ids[k], ids[k + 1]);
    } else if (line.startsWith("usemtl ")) {
      const name = line.slice(7).trim();
      if (name) usedMaterials.add(name);
    } else if (line.startsWith("mtllib ")) {
      const name = line.slice(7).trim();
      if (name) referencedMtlFiles.add(name);
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

  const publishedFloors = Number(building?.evidence?.publishedFacts?.floors || 0) || null;
  const floorLevels = selectFloorLevels(horizontalHistogram, binSize, vertices, verticalFaces, publishedFloors);
  const bounds = { minX, minY, maxX, maxY };
  const floors: FloorPlanResult[] = [];
  for (let i = 0; i < floorLevels.length; i++) {
    const plan = buildFloorPlan(building, i + 1, floorLevels[i], vertices, verticalFaces, bounds);
    if (plan) floors.push(plan);
  }

  const supportFiles: any = {
    mtlFiles: [],
    textureFiles: [],
    materialNames: Array.from(usedMaterials),
    referencedMtlFiles: Array.from(referencedMtlFiles)
  };
  const prefix = `buildings/${building.id}/geometry/`;
  try {
    let cursor: string | undefined;
    do {
      const listed = await env.BUILDING_DATA.list({ prefix, cursor });
      for (const item of listed.objects || []) {
        const key = String(item.key || "");
        const name = key.split("/").pop() || "";
        if (/\.mtl$/i.test(name)) {
          const mtlObj = await env.BUILDING_DATA.get(key).catch(() => null);
          const text = mtlObj ? await mtlObj.text().catch(() => "") : "";
          const defined = text.split(/\r?\n/).filter((line: string) => /^newmtl\s+/i.test(line)).map((line: string) => line.replace(/^newmtl\s+/i, "").trim()).filter(Boolean);
          const maps = text.split(/\r?\n/).filter((line: string) => /^map_Kd\s+/i.test(line)).map((line: string) => line.replace(/^map_Kd\s+/i, "").trim()).filter(Boolean);
          supportFiles.mtlFiles.push({ key, name, materialCount: defined.length, materialNames: defined.slice(0, 250), textureReferences: maps.slice(0, 250) });
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(name)) {
          supportFiles.textureFiles.push({ key, name, size: Number(item.size || 0) });
        }
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
  } catch {}

  const grossFloorAreaEstimateM2 = floors.reduce((sum, f) => sum + f.areaM2, 0);
  const grossFloorAreaEstimateFt2 = grossFloorAreaEstimateM2 * M2_TO_FT2;
  const lengthM = maxX - minX, widthM = maxY - minY, heightM = maxZ - minZ;
  const representativeFootprintM2 = floors.length ? floors[0].areaM2 : 0;
  const envelopeVolumeM3 = representativeFootprintM2 * heightM;

  const analysis: any = {
    buildingId: building.id,
    sourceObjKey: objKey,
    analyzedAt: new Date().toISOString(),
    algorithmVersion: "wall-slice-v2.2-landscape",
    classification: "MEASURED / SCREENING",
    limitations: [
      "Floor plans are reconstructed from OBJ mesh wall intersections and are not signed architectural drawings.",
      "Floor elevations are detected from horizontal mesh evidence; published floor count is used only as a selection aid when available.",
      "Room candidates are geometric enclosed spaces and are not semantically named until matched to panorama evidence.",
      "Model envelope volume is not a conditioned HVAC load volume."
    ],
    vertexCount,
    faceCount,
    verticalTriangleCount: Math.floor(verticalFaces.length / 3),
    materialUsageCount: usedMaterials.size,
    supportFiles,
    boundsMeters: {
      min: [round(minX, 4), round(minY, 4), round(minZ, 4)],
      max: [round(maxX, 4), round(maxY, 4), round(maxZ, 4)]
    },
    extentsMeters: { length: round(lengthM, 3), width: round(widthM, 3), height: round(heightM, 3) },
    extentsFeet: { length: round(lengthM * M_TO_FT, 2), width: round(widthM * M_TO_FT, 2), height: round(heightM * M_TO_FT, 2) },
    detectedFloorCount: floors.length,
    publishedFloorCount: publishedFloors,
    grossFloorAreaEstimateM2: round(grossFloorAreaEstimateM2, 2),
    grossFloorAreaEstimateFt2: round(grossFloorAreaEstimateFt2, 0),
    modelEnvelopeVolumeM3: round(envelopeVolumeM3, 0),
    modelEnvelopeVolumeFt3: round(envelopeVolumeM3 * M3_TO_FT3, 0),
    floorPlans: floors.map(({ svg, ...rest }) => rest)
  };

  const outputPrefix = `buildings/${building.id}/geometry`;
  for (const floor of floors) {
    await env.BUILDING_DATA.put(`${outputPrefix}/floor-plan-floor-${floor.floor}.svg`, floor.svg, {
      httpMetadata: { contentType: "image/svg+xml" }
    });
  }

  const title = escapeXml(building.name);
  const cols = floors.length > 1 ? 2 : 1;
  const rows = Math.max(1, Math.ceil(Math.max(1, floors.length) / cols));
  const panelW = 1100;
  const panelH = 760;
  const gutter = 28;
  const combinedW = cols * panelW + (cols + 1) * gutter;
  const combinedH = 92 + rows * panelH + (rows + 1) * gutter;
  let combined = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${combinedW} ${combinedH}" role="img" aria-label="Evidence-derived floor plans for ${title}"><rect width="100%" height="100%" fill="#fff"/><text x="40" y="40" font-family="system-ui,sans-serif" font-size="24" font-weight="700" fill="#111618">${title}</text><text x="40" y="64" font-family="system-ui,sans-serif" font-size="12" fill="#5f6763">MatterPak evidence-derived floor plan reconstruction · ${round(grossFloorAreaEstimateFt2, 0).toLocaleString("en-US")} sq ft estimated gross floor area</text>`;
  for (let i = 0; i < floors.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = gutter + col * (panelW + gutter);
    const y = 92 + gutter + row * (panelH + gutter);
    combined += `<svg x="${x}" y="${y}" width="${panelW}" height="${panelH}" viewBox="0 0 1100 760">${floors[i].svg.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`;
  }
  if (!floors.length) combined += `<text x="40" y="120" font-family="system-ui,sans-serif" font-size="16" fill="#9b3b2f">No stable interior wall slices were detected from this OBJ.</text>`;
  combined += `</svg>`;

  await env.BUILDING_DATA.put(`${outputPrefix}/geometry-analysis.json`, JSON.stringify(analysis, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });
  await env.BUILDING_DATA.put(`${outputPrefix}/floor-plan.svg`, combined, {
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
