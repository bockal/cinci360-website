export type Vector3 = { x: number; y: number; z: number };

export type SweepData = {
  sid: string;
  floor?: number;
  neighbors?: string[];
  position?: Vector3;
};

export type SpatialIndex = {
  schemaVersion: number;
  model: {
    sid: string;
    name: string;
    source: string;
    units: string;
    meshAxisConvention: { horizontal: string[]; vertical: string };
  };
  mesh: {
    vertexCount: number;
    faceCount: number;
    bounds: { min: number[]; max: number[] };
    extentsMeters: number[];
    extentsFeet: number[];
    surfaceAreaM2: number;
    surfaceOrientationAreaM2: { horizontal: number; vertical: number; sloped: number };
  };
  occupancy: {
    kind: string;
    voxelSizeMeters: number;
    origin: number[];
    shape: number[];
    linearIndex: string;
    bitOrder: string;
    surfaceVoxelCount: number;
    encoding?: string;
    bitsetBase64?: string;
    bitsetGzipBase64?: string;
    limitations: string;
  };
  reasoningPolicy: Record<string, string>;
};

type AxisTransform = {
  permutation: [number, number, number];
  signs: [number, number, number];
  offset: [number, number, number];
  score: number;
  label: string;
};

export type LocalClearance = {
  pointObj: Vector3;
  transform: AxisTransform;
  distancesMeters: Record<string, number | null>;
  distancesFeet: Record<string, number | null>;
  quality: "screening";
};

const permutations: Array<[number, number, number]> = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
];

function asArray(v: Vector3): [number, number, number] {
  return [v.x, v.y, v.z];
}

function stats(values: number[][]) {
  const mins = [Infinity, Infinity, Infinity];
  const maxs = [-Infinity, -Infinity, -Infinity];
  const sums = [0, 0, 0];
  for (const point of values) {
    for (let axis = 0; axis < 3; axis += 1) {
      mins[axis] = Math.min(mins[axis], point[axis]);
      maxs[axis] = Math.max(maxs[axis], point[axis]);
      sums[axis] += point[axis];
    }
  }
  const n = Math.max(1, values.length);
  return {
    mins,
    maxs,
    centers: mins.map((min, i) => (min + maxs[i]) / 2),
    means: sums.map(value => value / n),
    extents: mins.map((min, i) => maxs[i] - min),
  };
}

export function calibrateSweepsToMesh(sweeps: SweepData[], index: SpatialIndex): AxisTransform | null {
  const points = sweeps.flatMap(sweep => sweep.position ? [asArray(sweep.position)] : []);
  if (points.length < 3) return null;

  const meshMin = index.mesh.bounds.min;
  const meshMax = index.mesh.bounds.max;
  const meshExt = index.mesh.extentsMeters;
  const meshCenter = meshMin.map((min, i) => (min + meshMax[i]) / 2);
  let best: AxisTransform | null = null;

  for (const permutation of permutations) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const signs: [number, number, number] = [sx, sy, sz];
      const transformed = points.map(point => [
        point[permutation[0]] * sx,
        point[permutation[1]] * sy,
        point[permutation[2]] * sz,
      ]);
      const s = stats(transformed);

      const horizontalError = Math.abs(s.extents[0] - meshExt[0]) / Math.max(meshExt[0], 1)
        + Math.abs(s.extents[1] - meshExt[1]) / Math.max(meshExt[1], 1);
      const verticalPenalty = s.extents[2] / Math.max(meshExt[2], 1);

      // Match horizontal centers. For a mostly single-level capture, place the camera-height median
      // roughly 1.55m above the mesh floor. This is a screening calibration, not survey registration.
      const offset: [number, number, number] = [
        meshCenter[0] - s.centers[0],
        meshCenter[1] - s.centers[1],
        (meshMin[2] + 1.55) - s.means[2],
      ];

      let inside = 0;
      for (const point of transformed) {
        const p = point.map((value, axis) => value + offset[axis]);
        if (
          p[0] >= meshMin[0] - 0.5 && p[0] <= meshMax[0] + 0.5 &&
          p[1] >= meshMin[1] - 0.5 && p[1] <= meshMax[1] + 0.5 &&
          p[2] >= meshMin[2] - 0.5 && p[2] <= meshMax[2] + 0.5
        ) inside += 1;
      }
      const outsidePenalty = 1 - inside / transformed.length;
      const score = horizontalError + verticalPenalty * 0.35 + outsidePenalty * 2;
      const candidate: AxisTransform = {
        permutation,
        signs,
        offset,
        score,
        label: `OBJ=[${signs.map((sign, i) => `${sign < 0 ? "-" : "+"}${["X", "Y", "Z"][permutation[i]]}`).join(", ")}]`,
      };
      if (!best || candidate.score < best.score) best = candidate;
    }
  }
  return best;
}

export function transformPoint(point: Vector3, transform: AxisTransform): Vector3 {
  const raw = asArray(point);
  const mapped = transform.permutation.map((sourceAxis, axis) =>
    raw[sourceAxis] * transform.signs[axis] + transform.offset[axis],
  );
  return { x: mapped[0], y: mapped[1], z: mapped[2] };
}

function decodeBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function loadOccupancyBytes(index: SpatialIndex): Promise<Uint8Array | null> {
  if (index.occupancy.bitsetBase64) return decodeBase64(index.occupancy.bitsetBase64);
  const compressed = index.occupancy.bitsetGzipBase64;
  if (!compressed || typeof DecompressionStream === "undefined") return null;
  const bytes = decodeBase64(compressed);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function isOccupied(bytes: Uint8Array, shape: number[], x: number, y: number, z: number) {
  if (x < 0 || y < 0 || z < 0 || x >= shape[0] || y >= shape[1] || z >= shape[2]) return false;
  const linear = (x * shape[1] + y) * shape[2] + z;
  return (bytes[linear >> 3] & (1 << (linear & 7))) !== 0;
}

export function calculateLocalClearance(
  sweep: SweepData | undefined,
  sweeps: SweepData[],
  index: SpatialIndex | null,
  occupancyBytes: Uint8Array | null,
): LocalClearance | null {
  if (!sweep?.position || !index || !occupancyBytes) return null;
  const transform = calibrateSweepsToMesh(sweeps, index);
  if (!transform) return null;

  const pointObj = transformPoint(sweep.position, transform);
  const { origin, shape, voxelSizeMeters } = index.occupancy;
  const bytes = occupancyBytes;
  const start = [pointObj.x, pointObj.y, pointObj.z].map((value, axis) =>
    Math.round((value - origin[axis]) / voxelSizeMeters),
  );

  const directions: Record<string, [number, number, number]> = {
    "-X": [-1, 0, 0], "+X": [1, 0, 0], "-Y": [0, -1, 0], "+Y": [0, 1, 0],
    down: [0, 0, -1], up: [0, 0, 1],
  };
  const distancesMeters: Record<string, number | null> = {};
  const maxSteps = 240;
  for (const [label, dir] of Object.entries(directions)) {
    let found: number | null = null;
    for (let step = 1; step <= maxSteps; step += 1) {
      const x = start[0] + dir[0] * step;
      const y = start[1] + dir[1] * step;
      const z = start[2] + dir[2] * step;
      if (x < 0 || y < 0 || z < 0 || x >= shape[0] || y >= shape[1] || z >= shape[2]) break;
      if (isOccupied(bytes, shape, x, y, z)) {
        found = step * voxelSizeMeters;
        break;
      }
    }
    distancesMeters[label] = found;
  }
  const distancesFeet = Object.fromEntries(
    Object.entries(distancesMeters).map(([key, value]) => [key, value === null ? null : value * 3.28084]),
  );
  return { pointObj, transform, distancesMeters, distancesFeet, quality: "screening" };
}
