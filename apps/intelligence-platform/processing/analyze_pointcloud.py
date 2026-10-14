#!/usr/bin/env python3
"""Local Open3D point-cloud quality report; no assumed survey scale."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import open3d as o3d


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description="Inspect a PLY and export a reproducible quality report.")
    parser.add_argument("ply", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--voxel", type=float, default=0.05, help="Voxel size in native PLY coordinate units")
    parser.add_argument("--scale-meters-per-unit", type=float, default=None, help="Only specify with verified survey control")
    args = parser.parse_args()
    if args.voxel <= 0 or (args.scale_meters_per_unit is not None and args.scale_meters_per_unit <= 0):
        parser.error("Voxel and optional scale must be positive.")
    if not args.ply.is_file():
        parser.error("PLY does not exist.")
    cloud = o3d.io.read_point_cloud(str(args.ply))
    if cloud.is_empty():
        parser.error("PLY has no readable points.")
    points = np.asarray(cloud.points)
    if not np.isfinite(points).all():
        parser.error("PLY contains non-finite coordinates.")
    bounds_min = points.min(axis=0)
    bounds_max = points.max(axis=0)
    sample = cloud.voxel_down_sample(args.voxel)
    report = {
        "schemaVersion": 1,
        "source": str(args.ply.name),
        "sha256": sha256(args.ply),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "processor": "Open3D",
        "points": len(points),
        "downsampledPoints": len(sample.points),
        "hasColors": cloud.has_colors(),
        "hasNormals": cloud.has_normals(),
        "boundsNativeUnits": {"min": bounds_min.tolist(), "max": bounds_max.tolist(), "extent": (bounds_max - bounds_min).tolist()},
        "scaleMetersPerUnit": args.scale_meters_per_unit,
        "metricMeasurementsVerified": args.scale_meters_per_unit is not None,
        "limitations": [
            "Native PLY coordinates are not verified meters unless scale is independently established.",
            "This report is point-cloud quality screening, not OBJ registration, deviation analysis, or certified measurement.",
            "An independent control measurement is required before using photogrammetry dimensions in reports."
        ],
        "recommendedEvidence": [
            "Independent laser or survey control distances between identifiable points",
            "Registration anchors shared with the Matterport OBJ",
            "Additional capture of occluded or sparsely sampled building areas"
        ]
    }
    if args.scale_meters_per_unit is not None:
        report["boundsMeters"] = {"extent": ((bounds_max - bounds_min) * args.scale_meters_per_unit).tolist()}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Inspected {len(points):,} points; wrote {args.output}")


if __name__ == "__main__":
    main()
