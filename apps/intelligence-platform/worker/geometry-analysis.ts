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
  perimeterM: number;
  perimeterFt: number;
  worldBoundsMeters: { minX: number; minY: number; maxX: number; maxY: number };
  openingCandidates: Array<{
    id: string;
    kind: "door-like opening" | "window-like opening";
    widthM: number;
    widthFt: number;
    estimatedHeightM: number;
    estimatedHeightFt: number;
    centerMeters: [number, number, number];
    confidence: number;
  }>;
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


function maskHasNearby(mask: Uint8Array, width: number, height: number, x: number, y: number, radius = 1) {
  for (let dy = -radius; dy <= radius; dy++) {
    const yy = y + dy;
    if (yy < 0 || yy >= height) continue;
    for (let dx = -radius; dx <= radius; dx++) {
      const xx = x + dx;
      if (xx < 0 || xx >= width) continue;
      if (mask[yy * width + xx]) return true;
    }
  }
  return false;
}

function componentPrincipalWidth(cells: number[], width: number, cellM: number) {
  if (!cells.length) return 0;
  let cx = 0, cy = 0;
  for (const idx of cells) { cx += idx % width; cy += Math.floor(idx / width); }
  cx /= cells.length; cy /= cells.length;
  let cxx = 0, cyy = 0, cxy = 0;
  for (const idx of cells) {
    const dx = (idx % width) - cx, dy = Math.floor(idx / width) - cy;
    cxx += dx * dx; cyy += dy * dy; cxy += dx * dy;
  }
  const angle = 0.5 * Math.atan2(2 * cxy, cxx - cyy);
  const ux = Math.cos(angle), uy = Math.sin(angle);
  let min = Infinity, max = -Infinity;
  for (const idx of cells) {
    const dx = (idx % width) - cx, dy = Math.floor(idx / width) - cy;
    const u = dx * ux + dy * uy;
    min = Math.min(min, u); max = Math.max(max, u);
  }
  return Math.max(cellM, (max - min + 1) * cellM);
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

  // Multi-height wall slices provide a geometry-only screen for exterior openings.
  // These are candidates until panorama evidence confirms door/window semantics.
  const sliceOffsets = [0.25, 0.8, 1.3, 1.8, 2.2, 2.5];
  const heightSlices = sliceOffsets.map(offset => {
    const grid = new Uint8Array(width * height);
    const z = floorZ + offset;
    for (let i = 0; i < verticalFaces.length; i += 3) {
      const ia = verticalFaces[i], ib = verticalFaces[i + 1], ic = verticalFaces[i + 2];
      const az = vertices[ia * 3 + 2], bz = vertices[ib * 3 + 2], cz = vertices[ic * 3 + 2];
      if (z < Math.min(az, bz, cz) || z > Math.max(az, bz, cz)) continue;
      const seg = intersectTriangleAtZ(vertices, ia, ib, ic, z);
      if (!seg) continue;
      const len = Math.hypot(seg[1].x - seg[0].x, seg[1].y - seg[0].y);
      if (len < 0.06 || len > 12) continue;
      drawGridLine(
        grid, width, height,
        (seg[0].x - minX) / effectiveCell, (maxY - seg[0].y) / effectiveCell,
        (seg[1].x - minX) / effectiveCell, (maxY - seg[1].y) / effectiveCell
      );
    }
    const cropped = new Uint8Array(cropW * cropH);
    for (let y = minGY; y <= maxGY; y++) for (let x = minGX; x <= maxGX; x++) {
      if (grid[y * width + x]) cropped[(y - minGY) * cropW + (x - minGX)] = 1;
    }
    return dilate(cropped, cropW, cropH, 1);
  });

  const doorMask = new Uint8Array(boundary.length);
  const windowMask = new Uint8Array(boundary.length);
  for (let y = 1; y < cropH - 1; y++) for (let x = 1; x < cropW - 1; x++) {
    const idx = y * cropW + x;
    if (!boundary[idx]) continue;
    const occ = heightSlices.map(mask => maskHasNearby(mask, cropW, cropH, x, y, 1));
    const highClosure = occ[4] || occ[5];
    if (!highClosure) continue;
    if (!occ[0] && !occ[1] && !occ[2] && !occ[3]) doorMask[idx] = 1;
    else if ((occ[0] || occ[1]) && !occ[2] && !occ[3]) windowMask[idx] = 1;
  }

  const openingCandidates: FloorPlanResult["openingCandidates"] = [];
  function addOpenings(mask: Uint8Array, kind: "door-like opening" | "window-like opening") {
    const components = connectedComponents(mask, cropW, cropH);
    let sequence = 0;
    for (const cells of components) {
      if (cells.length < 2) continue;
      const widthM = componentPrincipalWidth(cells, cropW, effectiveCell);
      if (widthM < 0.55 || widthM > 6.5) continue;
      let sx = 0, sy = 0;
      for (const idx of cells) { sx += idx % cropW; sy += Math.floor(idx / cropW); }
      const gx = minGX + sx / cells.length;
      const gy = minGY + sy / cells.length;
      const worldX = minX + gx * effectiveCell;
      const worldY = maxY - gy * effectiveCell;
      const estimatedHeightM = kind === "door-like opening" ? 2.15 : 1.35;
      openingCandidates.push({
        id: `ENV-${String(building?.id || "BLDG").replace(/[^A-Za-z0-9]/g, "")}-F${floorIndex}-OPEN-${++sequence}`,
        kind,
        widthM: round(widthM, 2),
        widthFt: round(widthM * M_TO_FT, 2),
        estimatedHeightM,
        estimatedHeightFt: round(estimatedHeightM * M_TO_FT, 2),
        centerMeters: [round(worldX, 3), round(worldY, 3), round(floorZ + estimatedHeightM / 2, 3)],
        confidence: kind === "door-like opening" ? 0.58 : 0.52
      });
    }
  }
  addOpenings(doorMask, "door-like opening");
  addOpenings(windowMask, "window-like opening");

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
  let perimeterEdges = 0;
  for (const idx of mainCells) {
    const x = idx % width, y = Math.floor(idx / width);
    if (x === 0 || !mainSet[idx - 1]) perimeterEdges++;
    if (x === width - 1 || !mainSet[idx + 1]) perimeterEdges++;
    if (y === 0 || !mainSet[idx - width]) perimeterEdges++;
    if (y === height - 1 || !mainSet[idx + width]) perimeterEdges++;
  }
  const perimeterM = perimeterEdges * effectiveCell;
  const worldBoundsMeters = {
    minX: round(minX + minGX * effectiveCell, 3),
    minY: round(maxY - maxGY * effectiveCell, 3),
    maxX: round(minX + maxGX * effectiveCell, 3),
    maxY: round(maxY - minGY * effectiveCell, 3)
  };

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
    perimeterM: round(perimeterM, 2),
    perimeterFt: round(perimeterM * M_TO_FT, 1),
    worldBoundsMeters,
    openingCandidates,
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


type SpatialObjectCandidate = {
  objectId: string;
  kind: "rowing-shell-candidate";
  floor: number;
  centerMeters: [number, number, number];
  lengthMeters: number;
  lengthFeet: number;
  widthMeters: number;
  widthFeet: number;
  heightMeters: number;
  heightFeet: number;
  axisDegrees: number;
  aspectRatio: number;
  occupiedVoxelCount: number;
  estimatedCrewClass: "1-person" | "2-person" | "4-person" | "8-person";
  classBasis: string;
  confidence: number;
};

function shellCrewClass(lengthM: number): SpatialObjectCandidate["estimatedCrewClass"] {
  if (lengthM < 9.2) return "1-person";
  if (lengthM < 11.8) return "2-person";
  if (lengthM < 15.2) return "4-person";
  return "8-person";
}

function spatialId(buildingId: string, floor: number, x: number, y: number, z: number) {
  const seed = [buildingId, floor, Math.round(x * 5), Math.round(y * 5), Math.round(z * 5)].join(":");
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return "OBJ-" + String(buildingId || "BLDG").replace(/[^A-Za-z0-9]/g, "") + "-SHELL-" + (hash >>> 0).toString(36).toUpperCase();
}

function detectRowingShellCandidates(
  building: any,
  vertices: number[],
  floorLevels: number[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
): SpatialObjectCandidate[] {
  const voxel = 0.18;
  const margin = 0.55;
  const nx = Math.max(1, Math.ceil((bounds.maxX - bounds.minX) / voxel) + 3);
  const ny = Math.max(1, Math.ceil((bounds.maxY - bounds.minY) / voxel) + 3);
  const results: SpatialObjectCandidate[] = [];

  for (let floorIndex = 0; floorIndex < floorLevels.length; floorIndex++) {
    const floorZ = floorLevels[floorIndex];
    const zMin = floorZ + 0.22;
    const zMax = floorZ + 2.55;
    const cells = new Map<number, { ix: number; iy: number; iz: number; x: number; y: number; z: number; count: number }>();

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i], y = vertices[i + 1], z = vertices[i + 2];
      if (z < zMin || z > zMax) continue;
      if (x < bounds.minX + margin || x > bounds.maxX - margin || y < bounds.minY + margin || y > bounds.maxY - margin) continue;
      const ix = Math.floor((x - bounds.minX) / voxel);
      const iy = Math.floor((y - bounds.minY) / voxel);
      const iz = Math.floor((z - zMin) / voxel);
      const key = ix + iy * nx + iz * nx * ny;
      const prior = cells.get(key);
      if (prior) prior.count++;
      else cells.set(key, {
        ix, iy, iz,
        x: bounds.minX + (ix + 0.5) * voxel,
        y: bounds.minY + (iy + 0.5) * voxel,
        z: zMin + (iz + 0.5) * voxel,
        count: 1
      });
    }

    const visited = new Set<number>();
    const neighborRadiusXY = 1;
    const neighborRadiusZ = 1;

    for (const startKey of cells.keys()) {
      if (visited.has(startKey)) continue;
      const queue: number[] = [startKey];
      visited.add(startKey);
      const cluster: Array<{ ix: number; iy: number; iz: number; x: number; y: number; z: number; count: number }> = [];
      for (let head = 0; head < queue.length; head++) {
        const key = queue[head];
        const cell = cells.get(key);
        if (!cell) continue;
        cluster.push(cell);
        for (let dz = -neighborRadiusZ; dz <= neighborRadiusZ; dz++) {
          for (let dy = -neighborRadiusXY; dy <= neighborRadiusXY; dy++) {
            for (let dx = -neighborRadiusXY; dx <= neighborRadiusXY; dx++) {
              if (!dx && !dy && !dz) continue;
              const nk = (cell.ix + dx) + (cell.iy + dy) * nx + (cell.iz + dz) * nx * ny;
              if (!visited.has(nk) && cells.has(nk)) {
                visited.add(nk);
                queue.push(nk);
              }
            }
          }
        }
      }

      if (cluster.length < 18) continue;

      let sx = 0, sy = 0, sz = 0, weight = 0;
      let minZc = Infinity, maxZc = -Infinity;
      for (const p of cluster) {
        const w = Math.max(1, p.count);
        sx += p.x * w; sy += p.y * w; sz += p.z * w; weight += w;
        minZc = Math.min(minZc, p.z); maxZc = Math.max(maxZc, p.z);
      }
      const cx = sx / weight, cy = sy / weight, cz = sz / weight;
      let cxx = 0, cyy = 0, cxy = 0;
      for (const p of cluster) {
        const w = Math.max(1, p.count);
        const dx = p.x - cx, dy = p.y - cy;
        cxx += dx * dx * w; cyy += dy * dy * w; cxy += dx * dy * w;
      }
      const angle = 0.5 * Math.atan2(2 * cxy, cxx - cyy);
      const ux = Math.cos(angle), uy = Math.sin(angle);
      const vx = -uy, vy = ux;
      let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
      for (const p of cluster) {
        const dx = p.x - cx, dy = p.y - cy;
        const u = dx * ux + dy * uy;
        const v = dx * vx + dy * vy;
        minU = Math.min(minU, u); maxU = Math.max(maxU, u);
        minV = Math.min(minV, v); maxV = Math.max(maxV, v);
      }
      const lengthM = (maxU - minU) + voxel;
      const widthM = (maxV - minV) + voxel;
      const heightM = (maxZc - minZc) + voxel;
      const aspect = lengthM / Math.max(widthM, 0.05);

      // Shells are unusually long, narrow and vertically shallow. These filters
      // intentionally reject walls, floors, roof planes and most rack assemblies.
      if (lengthM < 6.5 || lengthM > 20.5) continue;
      if (widthM < 0.12 || widthM > 2.25) continue;
      if (heightM < 0.08 || heightM > 1.25) continue;
      if (aspect < 4.0) continue;

      const crew = shellCrewClass(lengthM);
      const slenderScore = Math.min(1, Math.max(0, (aspect - 4) / 10));
      const heightScore = Math.min(1, Math.max(0, (1.25 - heightM) / 1.0));
      const confidence = Math.min(0.9, 0.5 + slenderScore * 0.22 + heightScore * 0.18);

      results.push({
        objectId: spatialId(String(building?.id || "BLDG"), floorIndex + 1, cx, cy, cz),
        kind: "rowing-shell-candidate",
        floor: floorIndex + 1,
        centerMeters: [round(cx, 3), round(cy, 3), round(cz, 3)],
        lengthMeters: round(lengthM, 2),
        lengthFeet: round(lengthM * M_TO_FT, 1),
        widthMeters: round(widthM, 2),
        widthFeet: round(widthM * M_TO_FT, 1),
        heightMeters: round(heightM, 2),
        heightFeet: round(heightM * M_TO_FT, 1),
        axisDegrees: round(angle * 180 / Math.PI, 1),
        aspectRatio: round(aspect, 1),
        occupiedVoxelCount: cluster.length,
        estimatedCrewClass: crew,
        classBasis: "OBJ-derived principal length screening; visual confirmation required",
        confidence: round(confidence, 2)
      });
    }
  }

  // Nearby duplicate components can arise from fragmented mesh surfaces on the
  // same physical hull. Keep the stronger/larger candidate within a tight radius.
  const sorted = results.sort((a, b) => b.occupiedVoxelCount - a.occupiedVoxelCount);
  const deduped: SpatialObjectCandidate[] = [];
  for (const candidate of sorted) {
    const [x, y, z] = candidate.centerMeters;
    const duplicate = deduped.some(existing => {
      const [ex, ey, ez] = existing.centerMeters;
      const distance = Math.hypot(x - ex, y - ey, z - ez);
      const lengthDelta = Math.abs(candidate.lengthMeters - existing.lengthMeters);
      return candidate.floor === existing.floor && distance < 0.8 && lengthDelta < 1.2;
    });
    if (!duplicate) deduped.push(candidate);
  }
  return deduped.sort((a, b) => a.floor - b.floor || a.centerMeters[1] - b.centerMeters[1] || a.centerMeters[0] - b.centerMeters[0]);
}

function tableSurfaceHull(points:Point[]){const sorted=[...points].sort((a,b)=>a.x-b.x||a.y-b.y),cross=(o:Point,a:Point,b:Point)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x),lower:Point[]=[],upper:Point[]=[];for(const p of sorted){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p)}for(const p of sorted.reverse()){while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p)}lower.pop();upper.pop();return lower.concat(upper)}
// Find elevated, circular horizontal mesh patches. Geometry identifies shape;
// the visual asset class supplies semantic association, never object-count totals.
export function detectRoundTableCandidates(vertices:number[],surfaceFaces:number[],floorLevels:number[]){
 const grid=0.07,layers=new Map<string,Map<string,{x:number;y:number}>>();
 for(let i=0;i<surfaceFaces.length;i+=3){const m=triangleMetrics(vertices,surfaceFaces[i],surfaceFaces[i+1],surfaceFaces[i+2]);if(m.absNz<0.94||m.maxZ-m.minZ>0.10||m.area<0.00005)continue;
  const floor=floorLevels.findIndex(z=>m.centroidZ-z>=0.55&&m.centroidZ-z<=1.25);if(floor<0)continue;const level=Math.round(m.centroidZ/0.05),layerKey=floor+":"+level;let cells=layers.get(layerKey);if(!cells){cells=new Map();layers.set(layerKey,cells)}
  const loX=Math.floor(Math.min(m.ax,m.bx,m.cx)/grid),hiX=Math.floor(Math.max(m.ax,m.bx,m.cx)/grid),loY=Math.floor(Math.min(m.ay,m.by,m.cy)/grid),hiY=Math.floor(Math.max(m.ay,m.by,m.cy)/grid);if((hiX-loX+1)*(hiY-loY+1)>20000)continue;
  const den=(m.by-m.cy)*(m.ax-m.cx)+(m.cx-m.bx)*(m.ay-m.cy);if(Math.abs(den)<1e-12)continue;
  for(let x=loX;x<=hiX;x++)for(let y=loY;y<=hiY;y++){const px=(x+.5)*grid,py=(y+.5)*grid,a=((m.by-m.cy)*(px-m.cx)+(m.cx-m.bx)*(py-m.cy))/den,b=((m.cy-m.ay)*(px-m.cx)+(m.ax-m.cx)*(py-m.cy))/den;if(a>=-.001&&b>=-.001&&a+b<=1.001)cells.set(x+","+y,{x,y});}
 }
 const candidates:any[]=[];
 for(const [key,cells]of layers){const [floor,level]=key.split(":").map(Number),seen=new Set<string>();
  for(const [start]of cells){if(seen.has(start))continue;const queue=[start],points:Array<{x:number;y:number}>=[];seen.add(start);for(let q=0;q<queue.length;q++){const cell=cells.get(queue[q])!;points.push({x:(cell.x+.5)*grid,y:(cell.y+.5)*grid});for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const next=(cell.x+dx)+","+(cell.y+dy);if(cells.has(next)&&!seen.has(next)){seen.add(next);queue.push(next)}}}if(points.length<45)continue;
   const hull=tableSurfaceHull(points);if(hull.length<6)continue;let twiceArea=0,perimeter=0,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(let j=0;j<hull.length;j++){const a=hull[j],b=hull[(j+1)%hull.length];twiceArea+=a.x*b.y-b.x*a.y;perimeter+=Math.hypot(b.x-a.x,b.y-a.y);minX=Math.min(minX,a.x);maxX=Math.max(maxX,a.x);minY=Math.min(minY,a.y);maxY=Math.max(maxY,a.y)}const area=Math.abs(twiceArea)/2,width=maxX-minX+grid,depth=maxY-minY+grid,circularity=4*Math.PI*area/(perimeter*perimeter),ratio=Math.min(width,depth)/Math.max(width,depth),coverage=points.length*grid*grid/(width*depth);if(circularity<.90||ratio<.85||coverage<.58||area<.30||area>5.5)continue;
   const diameter=(width+depth)/2,height=level*.05-floorLevels[floor],center:[number,number,number]=[(minX+maxX)/2,(minY+maxY)/2,level*.05];if(candidates.some(c=>c.floor===floor+1&&Math.hypot(c.centerMeters[0]-center[0],c.centerMeters[1]-center[1])<.30&&Math.abs(c.centerMeters[2]-center[2])<.16))continue;
   candidates.push({id:"TABLE-TOP-"+(floor+1)+"-"+candidates.length,floor:floor+1,centerMeters:center.map(v=>round(v,3)),diameterFt:round(diameter*M_TO_FT,2),heightFt:round(height*M_TO_FT,2),circularity:round(circularity,3),confidence:Math.min(88,Math.round(65+(circularity-.90)*180)),basis:"OBJ elevated circular horizontal surface; table identity associated through visual inventory"});
  }
 }
 return candidates;
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
  const surfaceFaces: number[] = [];
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
    if (m.absNz > 0.18) surfaceFaces.push(ia, ib, ic);
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

  const rowingShellCandidates = detectRowingShellCandidates(building, vertices, floorLevels, bounds);
  const roundTableCandidates=detectRoundTableCandidates(vertices,surfaceFaces,floorLevels);

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

  const storyHeightsM = floors.map((floor, index) => {
    const next = floors[index + 1];
    if (next) return Math.max(2.2, Math.min(6.5, next.floorZ - floor.floorZ));
    const fallback = Math.max(2.4, Math.min(5.5, (maxZ - floor.floorZ) * 0.45));
    return fallback;
  });
  const exteriorPerimeterM = floors.reduce((sum, floor) => sum + Number(floor.perimeterM || 0), 0);
  const exteriorWallAreaM2 = floors.reduce((sum, floor, index) => sum + Number(floor.perimeterM || 0) * storyHeightsM[index], 0);

  let roofAreaM2 = 0, roofHorizontalProjectionM2 = 0, roofSlopeWeighted = 0;
  const topFloor = floors[floors.length - 1];
  if (topFloor) {
    const roofMinZ = topFloor.floorZ + Math.max(1.8, (storyHeightsM[storyHeightsM.length - 1] || 2.8) * 0.45);
    const wb = topFloor.worldBoundsMeters;
    for (let i = 0; i < surfaceFaces.length; i += 3) {
      const ia = surfaceFaces[i], ib = surfaceFaces[i + 1], ic = surfaceFaces[i + 2];
      const m = triangleMetrics(vertices, ia, ib, ic);
      const cx = (m.ax + m.bx + m.cx) / 3, cy = (m.ay + m.by + m.cy) / 3;
      if (m.centroidZ < roofMinZ) continue;
      if (cx < wb.minX - 1.5 || cx > wb.maxX + 1.5 || cy < wb.minY - 1.5 || cy > wb.maxY + 1.5) continue;
      if (m.absNz < 0.18) continue;
      roofAreaM2 += m.area;
      const projected = m.area * m.absNz;
      roofHorizontalProjectionM2 += projected;
      roofSlopeWeighted += projected * Math.acos(Math.min(1, Math.max(0, m.absNz)));
    }
  }
  const roofAvgSlopeDeg = roofHorizontalProjectionM2 > 0 ? roofSlopeWeighted / roofHorizontalProjectionM2 * 180 / Math.PI : 0;

  const allOpenings = floors.flatMap(floor => floor.openingCandidates.map(opening => ({ ...opening, floor: floor.floor })));
  const doorLike = allOpenings.filter(x => x.kind === "door-like opening");
  const windowLike = allOpenings.filter(x => x.kind === "window-like opening");
  const openingAreaM2 = allOpenings.reduce((sum, x) => sum + x.widthM * x.estimatedHeightM, 0);

  const envelopeTakeoff = {
    algorithmVersion: "envelope-takeoff-v1",
    classification: "MEASURED / SCREENING",
    floorAreaM2: round(grossFloorAreaEstimateM2, 2),
    floorAreaFt2: round(grossFloorAreaEstimateFt2, 0),
    ceilingAreaM2: round(grossFloorAreaEstimateM2, 2),
    ceilingAreaFt2: round(grossFloorAreaEstimateFt2, 0),
    exteriorPerimeterM: round(exteriorPerimeterM, 2),
    exteriorPerimeterFt: round(exteriorPerimeterM * M_TO_FT, 1),
    grossExteriorWallAreaM2: round(exteriorWallAreaM2, 2),
    grossExteriorWallAreaFt2: round(exteriorWallAreaM2 * M2_TO_FT2, 0),
    openingScreenAreaM2: round(openingAreaM2, 2),
    openingScreenAreaFt2: round(openingAreaM2 * M2_TO_FT2, 0),
    netExteriorWallAreaM2: round(Math.max(0, exteriorWallAreaM2 - openingAreaM2), 2),
    netExteriorWallAreaFt2: round(Math.max(0, exteriorWallAreaM2 - openingAreaM2) * M2_TO_FT2, 0),
    roofAreaM2: round(roofAreaM2, 2),
    roofAreaFt2: round(roofAreaM2 * M2_TO_FT2, 0),
    roofHorizontalProjectionM2: round(roofHorizontalProjectionM2, 2),
    roofHorizontalProjectionFt2: round(roofHorizontalProjectionM2 * M2_TO_FT2, 0),
    roofAverageSlopeDegrees: round(roofAvgSlopeDeg, 1),
    doorLikeOpeningCount: doorLike.length,
    windowLikeOpeningCount: windowLike.length,
    openingCandidates: allOpenings,
    floors: floors.map((floor, index) => ({
      floor: floor.floor,
      floorAreaFt2: floor.areaFt2,
      perimeterFt: floor.perimeterFt,
      estimatedStoryHeightFt: round(storyHeightsM[index] * M_TO_FT, 1),
      grossExteriorWallAreaFt2: round(floor.perimeterM * storyHeightsM[index] * M2_TO_FT2, 0)
    })),
    limitations: [
      "Exterior wall, floor, ceiling, perimeter, and roof quantities are geometry-derived screening measurements from the OBJ mesh.",
      "Door-like and window-like opening candidates are detected from multi-height wall-slice discontinuities and require panorama confirmation before being treated as semantic door/window counts.",
      "Opening candidate heights are screening estimates; widths are geometry-derived from the detected wall opening.",
      "Roof area depends on roof surfaces being present in the MatterPak mesh and can be incomplete where capture did not include the roof."
    ]
  };

  const analysis: any = {
    buildingId: building.id,
    sourceObjKey: objKey,
    analyzedAt: new Date().toISOString(),
    algorithmVersion: "wall-slice-v2.5-asset-dimensions",
    classification: "MEASURED / SCREENING",
    limitations: [
      "Floor plans are reconstructed from OBJ mesh wall intersections and are not signed architectural drawings.",
      "Floor elevations are detected from horizontal mesh evidence; published floor count is used only as a selection aid when available.",
      "Room candidates are geometric enclosed spaces and are not semantically named until matched to panorama evidence.",
      "Model envelope volume is not a conditioned HVAC load volume.",
      "Spatial object candidates are OBJ-derived geometry screening results. Semantic identity and crew class require visual confirmation before being treated as verified inventory.",
      "Envelope takeoff quantities are screening measurements derived from the MatterPak mesh; semantic opening types and incomplete roof capture must be verified."
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
    spatialObjects: {
      algorithmVersion: "obj-voxel-pca-v1",
      roundTableCandidates,
      rowingShellCandidateCount: rowingShellCandidates.length,
      rowingShellCandidates
    },
    envelopeTakeoff,
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

