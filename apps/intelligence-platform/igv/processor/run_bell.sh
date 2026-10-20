#!/usr/bin/env bash
set -euo pipefail
# Input: /work/panos/*.jpg ; output: /work/output
# COLMAP is used for SfM. Equirectangular panoramas are first projected
# into perspective views by a separate preprocessing stage (not yet implemented).
# Refuse to pretend panorama JPGs are calibrated pinhole photographs.
mkdir -p /work/output
if find /work/panos -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) | grep -q .; then
  echo "Panorama source images found."
else
  echo "ERROR: No JPG panoramas in /work/panos" >&2; exit 2
fi
echo "STOP: Panorama-to-calibrated-perspective preprocessing and pose constraints must be implemented before running SfM/MVS." >&2
echo "No reconstruction was performed; do not treat this as a finished model." >&2
exit 3
