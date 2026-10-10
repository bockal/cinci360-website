# Bell (BLDG-002): Surface Book 2 pilot

**Status: scaffold only — not yet runnable reconstruction.** This directory intentionally fails safely rather than creating a misleading 3D model. The panorama projection, shared-center camera constraints, and tested OpenMVS integration remain to be implemented.

## Plan
- Source: R2 bucket `cinci360-building-data`, prefix `buildings/BLDG-002/panos/`. At least 75 JPG objects were verified via Cloudflare browser; exact count not yet established.
- Surface Book 2 with Docker Desktop and WSL2 (Linux containers), preferably plugged into AC and with sleep disabled during a run.
- Export images from R2 via an authenticated, scoped mechanism to a local `panos/` directory; do not commit images or R2 credentials to GitHub.
- Convert each equirectangular panorama into calibrated perspective views, preserving the fact that all crops from one panorama share a single camera center. Solve poses across *different* pano stations.
- Run SfM and MVS, check camera alignment and cloud quality; independent scale control is required before any dimensional comparison.
- Store artifacts in `buildings/BLDG-002/igv/` after quality checks.

## 24-hour limit
Use a wall-clock 24-hour cap on the actual reconstruction job. If it exceeds the cap or the Surface Book 2 runs out of RAM, stop and move the **same job inputs and containerized pipeline** to Vast.ai. This is a *manual* cutoff until a complete runner is implemented.

## Hardware preflight (PowerShell)
```powershell
Get-CimInstance Win32_Processor | Select-Object Name
Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM
docker version
wsl --status
```

## Docker scaffold
`Dockerfile` and `run_bell.sh` are placeholders for the eventual tested pipeline; do **not** start a 24-hour run with them. The Docker image tag and dependencies also need validation on the target machine. No paid services are provisioned by this change.
