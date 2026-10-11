# Bell PLY: Open3D + Potree pilot

This is a **local processing prototype**, not an active Cloudflare analysis service. The existing Worker can store PLY files but cannot process them.

## 1. Analyze the original PLY

On Windows PowerShell, in `apps/intelligence-platform/processing`:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python analyze_pointcloud.py "C:\path\to\dense.ply" --output "C:\path\to\bell-ply-report.json"
```

The report includes SHA-256, point count, color/normal availability, native-coordinate bounds, and missing-evidence recommendations. It does **not** invent metric scale or compare OBJ to PLY.

## 2. Convert for Potree

Download the open-source PotreeConverter executable from the PotreeConverter project's official releases. In PowerShell:

```powershell
PotreeConverter.exe "C:\path\to\dense.ply" -o "C:\path\to\bell-potree"
```

Use a Potree viewer distribution compatible with the converter's output. For PotreeConverter 2.x, the generated `metadata.json`, `hierarchy.bin`, and `octree.bin` must remain together. Potree is a **viewer**, not the analysis engine.

Serve the Potree assets over HTTP(S), not `file://`. For local testing, serve the viewer and converted data from the same web server. The template `potree-viewer.html` expects the Potree JavaScript/CSS dependencies to be hosted alongside it at `./potree/` and the converted data at `./bell-potree/metadata.json`. The viewer does not automatically have access to private Cloudflare R2 objects.

## 3. Production integration requirements

- Upload the converted octree assets to a dedicated R2 prefix and serve them through a restricted, CORS-aware asset endpoint.
- Add access control before exposing private building scans.
- Queue processing outside the Worker (local agent or cloud compute); persist a versioned report and the original SHA-256.
- Register PLY-to-OBJ only after confirming units and at least one independent scale/control measurement.
- Never replace client-entered measurements solely with unverified point-cloud estimates.
