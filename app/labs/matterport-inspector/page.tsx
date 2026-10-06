"use client";

import { useMemo, useRef, useState } from "react";
import "./matterport-inspector.css";

const MODEL_SID = "qM1n2tF3CAQ";
const MODEL_NAME = "Cincinnati Rowing Club";
const SDK_BOOTSTRAP = "https://api.matterport.com/sdk/bootstrap/3.0.0-0-g0517b8d76c/sdk.es6.js";

type Vector3 = { x: number; y: number; z: number };

type SweepData = {
  sid: string;
  uuid?: string;
  floor?: number;
  neighbors?: string[];
  position?: Vector3;
  rotation?: { x?: number; y?: number; z?: number };
};

type MatterportSdk = {
  App: {
    Phase: { PLAYING: string };
    state: {
      waitUntil: (predicate: (state: { phase: string }) => boolean) => Promise<unknown>;
    };
  };
  Model: {
    getData: () => Promise<{ sid: string; sweeps: SweepData[] }>;
    getDetails: () => Promise<{ name?: string; sid: string }>;
  };
  Sweep: {
    Transition: { INSTANT: string };
    moveTo: (
      sweepId: string,
      options: {
        rotation?: { x: number; y: number };
        transition?: string;
        transitionTime?: number;
      },
    ) => Promise<string>;
  };
  Renderer: {
    takeEquirectangular: () => Promise<string>;
  };
};

type Capture = {
  sweepId: string;
  floor: number | null;
  position: Vector3 | null;
  capturedAt: string;
  imageDataUri: string;
};

function sleep(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function formatCoordinate(value?: number) {
  return typeof value === "number" ? value.toFixed(2) : "—";
}

export default function MatterportInspectorPrototype() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sdkRef = useRef<MatterportSdk | null>(null);
  const cancelWalkRef = useRef(false);

  const sdkKey = process.env.NEXT_PUBLIC_MATTERPORT_SDK_KEY?.trim() ?? "";
  const [status, setStatus] = useState(sdkKey ? "Ready to connect" : "SDK key required");
  const [error, setError] = useState("");
  const [modelLabel, setModelLabel] = useState(MODEL_NAME);
  const [sweeps, setSweeps] = useState<SweepData[]>([]);
  const [currentSweep, setCurrentSweep] = useState("");
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [sampleSize, setSampleSize] = useState(5);
  const [walking, setWalking] = useState(false);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      m: MODEL_SID,
      play: "1",
      qs: "1",
      help: "0",
    });
    if (sdkKey) params.set("applicationKey", sdkKey);
    return `https://my.matterport.com/show/?${params.toString()}`;
  }, [sdkKey]);

  async function connect() {
    if (!sdkKey) {
      setError("Add NEXT_PUBLIC_MATTERPORT_SDK_KEY to .env.local, then restart the dev server.");
      return;
    }
    if (!iframeRef.current) return;

    setError("");
    setStatus("Connecting to Matterport…");

    try {
      const sdkUrl = `${SDK_BOOTSTRAP}?applicationKey=${encodeURIComponent(sdkKey)}`;
      const sdkModule = (await import(/* @vite-ignore */ sdkUrl)) as {
        connect: (iframe: HTMLIFrameElement) => Promise<MatterportSdk>;
      };

      const mpSdk = await sdkModule.connect(iframeRef.current);
      sdkRef.current = mpSdk;

      setStatus("Waiting for model…");
      await mpSdk.App.state.waitUntil(state => state.phase === mpSdk.App.Phase.PLAYING);

      const [model, details] = await Promise.all([
        mpSdk.Model.getData(),
        mpSdk.Model.getDetails(),
      ]);

      const orderedSweeps = [...model.sweeps].sort((a, b) => {
        const floorA = a.floor ?? 999;
        const floorB = b.floor ?? 999;
        if (floorA !== floorB) return floorA - floorB;
        return a.sid.localeCompare(b.sid);
      });

      setSweeps(orderedSweeps);
      setModelLabel(details.name || MODEL_NAME);
      setStatus(`Connected · ${orderedSweeps.length} sweeps found`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(
        `Matterport connection failed: ${message}. Confirm the SDK key is valid and localhost is allow-listed.`,
      );
      setStatus("Connection failed");
    }
  }

  async function goToSweep(sweep: SweepData) {
    const mpSdk = sdkRef.current;
    if (!mpSdk) {
      setError("Connect to the Matterport SDK first.");
      return;
    }

    setError("");
    setStatus(`Moving to ${sweep.sid}…`);
    try {
      await mpSdk.Sweep.moveTo(sweep.sid, {
        rotation: { x: 0, y: 0 },
        transition: mpSdk.Sweep.Transition.INSTANT,
        transitionTime: 0,
      });
      setCurrentSweep(sweep.sid);
      setStatus(`At sweep ${sweep.sid}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  async function captureSweep(sweep: SweepData) {
    const mpSdk = sdkRef.current;
    if (!mpSdk) throw new Error("Matterport SDK is not connected.");

    await mpSdk.Sweep.moveTo(sweep.sid, {
      rotation: { x: 0, y: 0 },
      transition: mpSdk.Sweep.Transition.INSTANT,
      transitionTime: 0,
    });
    setCurrentSweep(sweep.sid);

    // Give Showcase a moment to settle after the instant move before asking
    // the renderer for the full panorama.
    await sleep(350);

    const imageDataUri = await mpSdk.Renderer.takeEquirectangular();
    const capture: Capture = {
      sweepId: sweep.sid,
      floor: typeof sweep.floor === "number" ? sweep.floor : null,
      position: sweep.position ?? null,
      capturedAt: new Date().toISOString(),
      imageDataUri,
    };
    setCaptures(current => [...current, capture]);
    return capture;
  }

  async function captureCurrent() {
    const sweep = sweeps.find(item => item.sid === currentSweep) ?? sweeps[0];
    if (!sweep) {
      setError("No sweeps are available yet.");
      return;
    }

    setError("");
    setStatus(`Capturing panorama at ${sweep.sid}…`);
    try {
      await captureSweep(sweep);
      setStatus(`Captured ${sweep.sid}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus("Capture failed");
    }
  }

  async function runSampleWalk() {
    const mpSdk = sdkRef.current;
    if (!mpSdk || sweeps.length === 0) {
      setError("Connect and load sweeps first.");
      return;
    }

    cancelWalkRef.current = false;
    setWalking(true);
    setError("");

    const limit = Math.max(1, Math.min(sampleSize, sweeps.length));
    try {
      for (let index = 0; index < limit; index += 1) {
        if (cancelWalkRef.current) break;
        const sweep = sweeps[index];
        setStatus(`Sample walk ${index + 1}/${limit} · ${sweep.sid}`);
        await captureSweep(sweep);
      }
      setStatus(cancelWalkRef.current ? "Sample walk stopped" : `Sample walk complete · ${limit} panoramas captured`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus("Sample walk stopped on error");
    } finally {
      setWalking(false);
    }
  }

  function stopWalk() {
    cancelWalkRef.current = true;
  }

  function clearCaptures() {
    setCaptures([]);
    setStatus("Captures cleared");
  }

  function downloadCaptureBundle() {
    if (!captures.length) return;

    const bundle = {
      prototype: "Cinci360 AI Building Inspector",
      version: 1,
      model: {
        sid: MODEL_SID,
        name: modelLabel,
        source: `https://my.matterport.com/show/?m=${MODEL_SID}`,
      },
      createdAt: new Date().toISOString(),
      captureCount: captures.length,
      captures,
    };

    const blob = new Blob([JSON.stringify(bundle)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cinci360-matterport-${MODEL_SID}-captures.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mpi-shell">
      <section className="mpi-hero">
        <p className="mpi-eyebrow">Cinci360 R&amp;D · Prototype 01</p>
        <h1>AI Building Inspector</h1>
        <p>
          First proof of concept: connect to the Cincinnati Rowing Club Matterport model,
          enumerate its scan positions, navigate them programmatically, and capture
          equirectangular visual evidence for later AI inventory analysis.
        </p>
        <div className="mpi-status-row">
          <span className={error ? "mpi-status mpi-status-error" : "mpi-status"}>{status}</span>
          <code>{MODEL_SID}</code>
        </div>
        {!sdkKey && (
          <div className="mpi-callout">
            <strong>Local setup needed:</strong> create <code>.env.local</code> with
            <code>NEXT_PUBLIC_MATTERPORT_SDK_KEY=your_key_here</code>, then restart <code>npm run dev</code>.
            The key is intentionally not stored in GitHub.
          </div>
        )}
        {error && <div className="mpi-error" role="alert">{error}</div>}
      </section>

      <section className="mpi-grid">
        <div className="mpi-viewer-card">
          <div className="mpi-card-head">
            <div>
              <p className="mpi-kicker">Live model</p>
              <h2>{modelLabel}</h2>
            </div>
            <button type="button" onClick={connect} disabled={!sdkKey || walking}>
              {sdkRef.current ? "Reconnect SDK" : "Connect SDK"}
            </button>
          </div>
          <div className="mpi-frame-wrap">
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title="Cincinnati Rowing Club Matterport model"
              allow="autoplay; fullscreen; web-share; xr-spatial-tracking"
              allowFullScreen
            />
          </div>
        </div>

        <aside className="mpi-controls">
          <div className="mpi-panel">
            <p className="mpi-kicker">Automated traversal</p>
            <h2>Sample walk</h2>
            <p>
              Move through the first sweeps and capture one full 360° panorama at each
              location. Five sweeps is intentionally conservative for the first test.
            </p>
            <label>
              Sweeps to capture
              <input
                type="number"
                min="1"
                max={Math.max(1, sweeps.length || 25)}
                value={sampleSize}
                onChange={event => setSampleSize(Number(event.target.value) || 1)}
                disabled={walking}
              />
            </label>
            <div className="mpi-button-row">
              <button type="button" onClick={runSampleWalk} disabled={walking || !sweeps.length}>
                {walking ? "Walking…" : "Run sample walk"}
              </button>
              <button type="button" className="mpi-secondary" onClick={stopWalk} disabled={!walking}>
                Stop
              </button>
            </div>
          </div>

          <div className="mpi-panel">
            <p className="mpi-kicker">Evidence</p>
            <h2>{captures.length} panorama{captures.length === 1 ? "" : "s"}</h2>
            <div className="mpi-button-stack">
              <button type="button" onClick={captureCurrent} disabled={!sweeps.length || walking}>
                Capture current sweep
              </button>
              <button type="button" className="mpi-secondary" onClick={downloadCaptureBundle} disabled={!captures.length}>
                Download capture bundle
              </button>
              <button type="button" className="mpi-text-button" onClick={clearCaptures} disabled={!captures.length || walking}>
                Clear captures
              </button>
            </div>
          </div>
        </aside>
      </section>

      <section className="mpi-data">
        <div className="mpi-section-head">
          <div>
            <p className="mpi-kicker">Matterport spatial data</p>
            <h2>{sweeps.length ? `${sweeps.length} sweeps discovered` : "Sweeps will appear after connection"}</h2>
          </div>
          <p>Click any row to prove the application can drive the model directly.</p>
        </div>
        <div className="mpi-table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Floor</th>
                <th>Sweep ID</th>
                <th>X</th>
                <th>Y</th>
                <th>Z</th>
                <th>Neighbors</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sweeps.length ? sweeps.map((sweep, index) => (
                <tr key={sweep.sid} className={currentSweep === sweep.sid ? "mpi-active-row" : undefined}>
                  <td>{index + 1}</td>
                  <td>{typeof sweep.floor === "number" ? sweep.floor : "—"}</td>
                  <td><code>{sweep.sid}</code></td>
                  <td>{formatCoordinate(sweep.position?.x)}</td>
                  <td>{formatCoordinate(sweep.position?.y)}</td>
                  <td>{formatCoordinate(sweep.position?.z)}</td>
                  <td>{sweep.neighbors?.length ?? 0}</td>
                  <td>
                    <button type="button" className="mpi-row-button" onClick={() => goToSweep(sweep)} disabled={walking}>
                      Go
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="mpi-empty">Connect the SDK to enumerate this model’s sweeps.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {captures.length > 0 && (
        <section className="mpi-captures">
          <div className="mpi-section-head">
            <div>
              <p className="mpi-kicker">Captured evidence</p>
              <h2>Panorama sample</h2>
            </div>
            <p>These are the frames we will feed into the vision/inventory layer next.</p>
          </div>
          <div className="mpi-capture-grid">
            {captures.map((capture, index) => (
              <figure key={`${capture.sweepId}-${capture.capturedAt}`}>
                {/* Matterport returns a local data URI; it never needs to be committed. */}
                <img src={capture.imageDataUri} alt={`Matterport panorama from sweep ${capture.sweepId}`} />
                <figcaption>
                  <strong>{index + 1}. Sweep {capture.sweepId}</strong>
                  <span>Floor {capture.floor ?? "—"} · {capture.position ? `${capture.position.x.toFixed(2)}, ${capture.position.y.toFixed(2)}, ${capture.position.z.toFixed(2)}` : "position unavailable"}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
