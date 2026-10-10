# Independent Geometry Verification (IGV) — OpenMVS pilot

Upstream: https://github.com/cdcseacave/openMVS (check license and pinned release before production use).

This integration is intentionally separate from the Cloudflare Worker: SfM/MVS requires substantial CPU/GPU and disk. Do not run reconstruction inside Workers.

## Input
- Original photo-only panoramic imagery for one building from R2.
- Sweep IDs, image capture metadata and camera calibration if available.
- Independent physical control distances/targets for absolute scale. **Do not use Matterport OBJ/E57 to set the reconstruction scale.**
- The Matterport OBJ is used only for *subsequent* comparison.

## Pipeline
1. Inventory panoramas, count independent camera centers, check overlap and resolution. Never assume one panorama = multiple camera positions.
2. Estimate camera poses from images only using an SfM system that supports spherical/equirectangular imagery, or create calibrated perspective views with the correct projection and intrinsics. Avoid treating crops from one panorama as independent baselines.
3. Export SfM poses, sparse cloud and camera model into OpenMVS scene format using a supported importer/converter.
4. Run OpenMVS densification and optionally mesh reconstruction on external compute.
5. Apply independently surveyed scale and evaluate reprojection errors, completeness and geometric stability.
6. Save artifacts and manifest to R2 under `buildings/{buildingId}/igv/{runId}/`.
7. Register the photo-derived cloud to OBJ for comparison, keeping scale fixed. Compute cloud-to-mesh deviations and per-element coverage; flag ambiguous/unobserved surfaces.
8. Publish measurement agreement and source lineage. Never call this independent survey verification when the imagery originates from the same capture device.

## Suggested manifest
```json
{
  "schemaVersion": "igv-v1",
  "buildingId": "BLDG-001",
  "runId": "example",
  "method": "photo-only-sfm-openmvs",
  "status": "pending",
  "inputPanoramaKeys": [],
  "sourceObjKey": null,
  "cameraCenters": null,
  "scale": {"source": "unverified", "controlMeasurements": []},
  "artifacts": {"sparseCloud": null, "denseCloud": null, "mesh": null, "potree": null},
  "quality": {"reprojectionErrorPx": null, "registeredSurfaceCoverage": null, "medianDeviationM": null, "p95DeviationM": null},
  "limitations": []
}
```

## First acceptance test
Run Bell on a subset of overlapping panoramas. Fail gracefully if pose estimation is degenerate, scale is unknown, or the scene is insufficiently textured. No dimensions should be marked verified until independent control measurements exist.

## Deployment
Pin upstream OpenMVS to a reviewed commit in an external Docker/compute project or Git submodule (requires git/submodule support); do not copy the upstream C++ tree into the Worker. Store R2 credentials in compute secrets, never in GitHub.


## Side-by-side geometry verification viewer (UI specification)
Embed a compact, expandable **Compare geometry** panel directly below the envelope takeoff in the Building Database.

- **Left:** existing Matterport OBJ mesh, using a browser WebGL mesh renderer (e.g., Three.js) and existing authenticated asset access.
- **Right:** Potree point-cloud viewer displaying the photo-only MVS reconstruction, only when a completed IGV run has a published point-cloud artifact.
- **Shared controls:** synchronized orbit target, position, projection and zoom after applying the saved rigid registration transform. Provide an obvious Sync on/off toggle and a Reset view button. Camera synchronization must use a common coordinate frame, not assume the datasets already share axes or origins.
- **Optional modes:** side by side (default), full-screen, and deviation overlay; the overlay is enabled only when comparison metrics exist.
- **Selected asset:** show wall/opening/floor identifier, OBJ dimensions, photo-derived dimensions, absolute/relative deviation, coverage and quality status. Display `Not measured` rather than manufacturing values.
- **Provenance:** always label left `Matterport OBJ`, right `Photo-only MVS / Potree`; show IGV run date, calibration and scale status. If scale is unverified, show `Visual comparison only — absolute dimensions unverified`.
- **Loading:** independent progress/error/empty states per viewer. No MVS reconstruction yet should produce a friendly `Photogrammetry model not generated` placeholder, not an error.
- **Performance:** lazy-load viewers when panel is opened; stream point-cloud tiles; cap GPU memory and provide a mobile stacked layout. Never send full point clouds through Worker JSON.
- **Security:** use signed/authorized asset URLs for both datasets, avoid exposing private R2 buckets.
- **Acceptance:** Bell's existing OBJ renders independently of MVS availability; once the MVS run exists both views load, navigation syncs after registration, and the metrics panel does not claim independent accuracy without independent scale control.
