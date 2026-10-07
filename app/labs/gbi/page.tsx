"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./gbi.css";
import { calculateLocalClearance, loadOccupancyBytes, type SpatialIndex, type SweepData } from "./spatial";

const MODEL_SID = "qM1n2tF3CAQ";
const MODEL_NAME = "Cincinnati Rowing Club";
const MODEL_URL = `https://my.matterport.com/show/?m=${MODEL_SID}`;
const SDK_BOOTSTRAP = "https://api.matterport.com/sdk/bootstrap/3.0.0-0-g0517b8d76c/sdk.es6.js";
const SPATIAL_INDEX_URL = "/data/gbi/crc-spatial-index.json";
const LOCAL_KNOWLEDGE_KEY = `cinci360:gbi:${MODEL_SID}:visual-v1`;

type MatterportSdk = {
  App: { Phase: { PLAYING: string }; state: { waitUntil: (predicate: (state: { phase: string }) => boolean) => Promise<unknown> } };
  Model: { getData: () => Promise<{ sweeps: SweepData[] }>; getDetails: () => Promise<{ name?: string }> };
  Sweep: {
    Transition: { INSTANT: string };
    moveTo: (sweepId: string, options: { rotation?: { x: number; y: number }; transition?: string; transitionTime?: number }) => Promise<string>;
    current?: { subscribe?: (callback: (current: { sid?: string }) => void) => unknown };
  };
  Renderer: { takeEquirectangular: () => Promise<string> };
};

type VisualItem = {
  assetId: string;
  category: string;
  visibleName: string;
  description: string;
  quantity: number;
  confidence: number;
  evidenceSweepIds: string[];
  duplicateGroup: string;
  notes: string;
};

type ChatAnswer = {
  answer: string;
  evidenceLevel: "measured" | "observed" | "inferred" | "advised" | "insufficient";
  confidence: number;
  evidenceSweepIds: string[];
  caveats: string[];
  suggestedQuestions: string[];
};

type Message = { role: "user" | "assistant"; text: string; answer?: ChatAnswer };

function sleep(ms: number) { return new Promise(resolve => window.setTimeout(resolve, ms)); }
function feet(value: number | null | undefined) { return value == null ? "—" : `${value.toFixed(1)} ft`; }

function spatialSummary(index: SpatialIndex | null) {
  if (!index) return null;
  return {
    source: index.model.source,
    units: index.model.units,
    meshBounds: index.mesh.bounds,
    extentsMeters: index.mesh.extentsMeters,
    extentsFeet: index.mesh.extentsFeet,
    vertexCount: index.mesh.vertexCount,
    faceCount: index.mesh.faceCount,
    surfaceVoxelCount: index.occupancy.surfaceVoxelCount,
    voxelSizeMeters: index.occupancy.voxelSizeMeters,
    measurementPolicy: index.occupancy.limitations,
    reasoningPolicy: index.reasoningPolicy,
  };
}

function buildSpatialBatches(sweeps: SweepData[], batchSize = 8) {
  if (!sweeps.length) return [] as SweepData[][];
  const byId = new Map(sweeps.map(sweep => [sweep.sid, sweep]));
  const visited = new Set<string>();
  const ordered: SweepData[] = [];
  for (const seed of sweeps) {
    if (visited.has(seed.sid)) continue;
    const queue = [seed];
    while (queue.length) {
      const current = queue.shift()!;
      if (visited.has(current.sid)) continue;
      visited.add(current.sid);
      ordered.push(current);
      for (const neighborId of current.neighbors ?? []) {
        const neighbor = byId.get(neighborId);
        if (neighbor && !visited.has(neighbor.sid)) queue.push(neighbor);
      }
    }
  }
  const batches: SweepData[][] = [];
  for (let i = 0; i < ordered.length; i += batchSize) {
    const batch = ordered.slice(i, i + batchSize);
    if (i > 0 && batches.length) batch.unshift(batches[batches.length - 1].at(-1)!);
    batches.push(batch);
  }
  return batches;
}

export default function GbiPrototype() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sdkRef = useRef<MatterportSdk | null>(null);
  const cancelIndexRef = useRef(false);
  const sdkKey = process.env.NEXT_PUBLIC_MATTERPORT_SDK_KEY?.trim() ?? "";

  const [status, setStatus] = useState(sdkKey ? "Ready to connect" : "SDK key required");
  const [error, setError] = useState("");
  const [sweeps, setSweeps] = useState<SweepData[]>([]);
  const [currentSweepId, setCurrentSweepId] = useState("");
  const [spatialIndex, setSpatialIndex] = useState<SpatialIndex | null>(null);
  const [visualKnowledge, setVisualKnowledge] = useState<VisualItem[]>([]);
  const [occupancyBytes, setOccupancyBytes] = useState<Uint8Array | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "I’m GBI. Connect the digital twin, then ask me about the building, its assets, clearances, layout, condition, or renovation priorities." },
  ]);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({ m: MODEL_SID, play: "1", qs: "1", help: "0" });
    if (sdkKey) params.set("applicationKey", sdkKey);
    return `https://my.matterport.com/show/?${params.toString()}`;
  }, [sdkKey]);

  useEffect(() => {
    fetch(SPATIAL_INDEX_URL).then(response => response.json()).then(async (data: SpatialIndex) => {
      setSpatialIndex(data);
      setOccupancyBytes(await loadOccupancyBytes(data));
    }).catch(() => setError("CRC spatial index could not be loaded."));
    try {
      const saved = window.localStorage.getItem(LOCAL_KNOWLEDGE_KEY);
      if (saved) setVisualKnowledge(JSON.parse(saved) as VisualItem[]);
    } catch { /* local storage is optional */ }
  }, []);

  const currentSweep = sweeps.find(sweep => sweep.sid === currentSweepId) ?? sweeps[0];
  const localClearance = useMemo(
    () => calculateLocalClearance(currentSweep, sweeps, spatialIndex, occupancyBytes),
    [currentSweep, sweeps, spatialIndex, occupancyBytes],
  );

  async function connect() {
    if (!sdkKey || !iframeRef.current) {
      setError("Add NEXT_PUBLIC_MATTERPORT_SDK_KEY to the environment before using the GBI portal.");
      return;
    }
    setError("");
    setStatus("Connecting to Matterport…");
    try {
      const module = await import(/* @vite-ignore */ `${SDK_BOOTSTRAP}?applicationKey=${encodeURIComponent(sdkKey)}`) as { connect: (iframe: HTMLIFrameElement) => Promise<MatterportSdk> };
      const sdk = await module.connect(iframeRef.current);
      sdkRef.current = sdk;
      await sdk.App.state.waitUntil(state => state.phase === sdk.App.Phase.PLAYING);
      const [model, details] = await Promise.all([sdk.Model.getData(), sdk.Model.getDetails()]);
      setSweeps(model.sweeps);
      setCurrentSweepId(model.sweeps[0]?.sid ?? "");
      sdk.Sweep.current?.subscribe?.(current => { if (current.sid) setCurrentSweepId(current.sid); });
      setStatus(`Connected · ${model.sweeps.length} sweeps · ${details.name || MODEL_NAME}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus("Connection failed");
    }
  }

  async function moveToSweep(sweepId: string) {
    const sdk = sdkRef.current;
    if (!sdk) return;
    try {
      await sdk.Sweep.moveTo(sweepId, { rotation: { x: 0, y: 0 }, transition: sdk.Sweep.Transition.INSTANT, transitionTime: 0 });
      setCurrentSweepId(sweepId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
  }

  async function buildVisualIndex() {
    const sdk = sdkRef.current;
    if (!sdk || !sweeps.length) { setError("Connect the Matterport model first."); return; }
    cancelIndexRef.current = false;
    setIndexing(true);
    setIndexProgress(0);
    setError("");
    const batches = buildSpatialBatches(sweeps, 8);
    const accumulated: VisualItem[] = [];
    try {
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
        if (cancelIndexRef.current) break;
        const batch = batches[batchIndex];
        const captures = [];
        setStatus(`GBI visual pass ${batchIndex + 1}/${batches.length} · capturing ${batch.length} nearby sweeps`);
        for (const sweep of batch) {
          if (cancelIndexRef.current) break;
          await sdk.Sweep.moveTo(sweep.sid, { rotation: { x: 0, y: 0 }, transition: sdk.Sweep.Transition.INSTANT, transitionTime: 0 });
          setCurrentSweepId(sweep.sid);
          await sleep(280);
          captures.push({
            sweepId: sweep.sid,
            floor: typeof sweep.floor === "number" ? sweep.floor : null,
            position: sweep.position ?? null,
            capturedAt: new Date().toISOString(),
            imageDataUri: await sdk.Renderer.takeEquirectangular(),
          });
        }
        if (!captures.length) break;
        const response = await fetch("/api/labs/matterport-inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: { sid: MODEL_SID, name: MODEL_NAME },
            namingConvention: "{CATEGORY}-{NNN}",
            inventoryFocus: "Create broad facility intelligence, not just movable inventory. Identify visible building elements and assets including boats/racks/equipment, windows, doors, envelope components, structural elements, lighting, visible MEP, safety devices, storage systems, access/egress features, and visible condition anomalies. Read labels when legible. Do not infer hidden conditions or exact age.",
            captures,
          }),
        });
        const result = await response.json() as { items?: VisualItem[]; error?: string };
        if (!response.ok) throw new Error(result.error || `Visual batch ${batchIndex + 1} failed.`);
        accumulated.push(...(result.items ?? []));
        setVisualKnowledge([...accumulated]);
        setIndexProgress(Math.round(((batchIndex + 1) / batches.length) * 100));
      }
      window.localStorage.setItem(LOCAL_KNOWLEDGE_KEY, JSON.stringify(accumulated));
      setStatus(cancelIndexRef.current ? `Visual indexing stopped · ${accumulated.length} observations retained` : `GBI visual index ready · ${accumulated.length} observations`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus("Visual indexing failed");
    } finally { setIndexing(false); }
  }

  async function ask(text = question) {
    const trimmed = text.trim();
    if (!trimmed || asking) return;
    setQuestion("");
    setMessages(current => [...current, { role: "user", text: trimmed }]);
    setAsking(true);
    setError("");
    try {
      const response = await fetch("/api/labs/gbi-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          model: { sid: MODEL_SID, name: MODEL_NAME },
          currentSweepId: currentSweep?.sid,
          currentLocation: localClearance,
          spatial: spatialSummary(spatialIndex),
          sweeps: sweeps.map(sweep => ({ sid: sweep.sid, floor: sweep.floor ?? null, position: sweep.position ?? null, neighbors: sweep.neighbors ?? [] })),
          visualKnowledge,
        }),
      });
      const result = await response.json() as ChatAnswer & { error?: string };
      if (!response.ok) throw new Error(result.error || "GBI could not answer that question.");
      setMessages(current => [...current, { role: "assistant", text: result.answer, answer: result }]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setAsking(false); }
  }

  const fitClearance = localClearance?.distancesFeet;
  const spanX = fitClearance?.["-X"] != null && fitClearance?.["+X"] != null ? fitClearance["-X"]! + fitClearance["+X"]! : null;
  const spanY = fitClearance?.["-Y"] != null && fitClearance?.["+Y"] != null ? fitClearance["-Y"]! + fitClearance["+Y"]! : null;

  return (
    <main className="gbi-shell">
      <section className="gbi-hero">
        <p className="gbi-eyebrow">Cinci360 · GBI Proof of Concept</p>
        <h1>Ask the building.</h1>
        <p>GBI combines the live Matterport digital twin, visual AI evidence, sweep coordinates, and a lightweight OBJ-derived spatial index so the facility can answer questions instead of simply being viewed.</p>
        <div className="gbi-badges"><span>{status}</span><span>OBJ spatial layer: {spatialIndex ? "ready" : "loading"}</span><span>Visual observations: {visualKnowledge.length}</span></div>
        {error && <div className="gbi-error">{error}</div>}
      </section>

      <section className="gbi-main-grid">
        <div className="gbi-viewer-card">
          <div className="gbi-card-head"><div><p className="gbi-kicker">Live digital twin</p><h2>{MODEL_NAME}</h2></div><button onClick={connect} disabled={!sdkKey}>{sdkRef.current ? "Reconnect" : "Connect GBI"}</button></div>
          <div className="gbi-frame-wrap"><iframe ref={iframeRef} src={iframeSrc} title="Cincinnati Rowing Club Matterport digital twin" allow="autoplay; fullscreen; web-share; xr-spatial-tracking" allowFullScreen /></div>
          <div className="gbi-location-strip">
            <div><strong>Current sweep</strong><code>{currentSweep?.sid || "Connect model"}</code></div>
            <div><strong>Screening clearance</strong><span>X {feet(spanX)} · Y {feet(spanY)} · overhead {feet(fitClearance?.up)}</span></div>
          </div>
        </div>

        <aside className="gbi-chat-card">
          <div className="gbi-card-head"><div><p className="gbi-kicker">Facility assistant</p><h2>GBI</h2></div><span className="gbi-live-dot">Evidence grounded</span></div>
          <div className="gbi-messages">
            {messages.map((message, index) => (
              <div key={index} className={`gbi-message gbi-message-${message.role}`}>
                <p>{message.text}</p>
                {message.answer && <>
                  <div className="gbi-answer-meta"><span>{message.answer.evidenceLevel}</span><span>{Math.round(message.answer.confidence * 100)}% confidence</span></div>
                  {message.answer.evidenceSweepIds.length > 0 && <div className="gbi-evidence-chips">{message.answer.evidenceSweepIds.map(id => <button key={id} onClick={() => void moveToSweep(id)}>{id.slice(0, 7)}…</button>)}</div>}
                  {message.answer.caveats.length > 0 && <p className="gbi-caveat">{message.answer.caveats.join(" ")}</p>}
                </>}
              </div>
            ))}
            {asking && <div className="gbi-message gbi-message-assistant"><p>Checking the building evidence…</p></div>}
          </div>
          <form className="gbi-ask" onSubmit={event => { event.preventDefault(); void ask(); }}>
            <textarea value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask: Will a 7' × 4' × 6' cabinet fit at this location?" rows={3} />
            <button disabled={asking || !question.trim()}>Ask GBI</button>
          </form>
          <div className="gbi-suggestions">
            {["How could I fit more storage in this boathouse?", "What facility issues should an owner be asking about?", "What do you know about the windows?", "What is the usable clearance around my current location?"].map(item => <button key={item} onClick={() => void ask(item)}>{item}</button>)}
          </div>
        </aside>
      </section>

      <section className="gbi-intelligence-grid">
        <article className="gbi-panel">
          <p className="gbi-kicker">Spatial layer</p><h2>OBJ mesh index</h2>
          {spatialIndex ? <div className="gbi-metrics">
            <div><strong>{spatialIndex.mesh.extentsFeet[0]} ft</strong><span>model length</span></div>
            <div><strong>{spatialIndex.mesh.extentsFeet[1]} ft</strong><span>model width</span></div>
            <div><strong>{spatialIndex.mesh.extentsFeet[2]} ft</strong><span>model height</span></div>
            <div><strong>{spatialIndex.occupancy.surfaceVoxelCount.toLocaleString()}</strong><span>0.25 m surface voxels</span></div>
          </div> : <p>Loading MatterPak spatial index…</p>}
          <p className="gbi-note">The OBJ was reduced to a lightweight surface-voxel index for fast proximity and clearance screening. It is not represented as a high-density E57 and is not a certified survey.</p>
        </article>

        <article className="gbi-panel">
          <p className="gbi-kicker">Visual layer</p><h2>Build facility knowledge</h2>
          <p>GBI walks connected sweeps in spatial neighborhoods and analyzes overlapping views for assets, architecture, envelope, visible MEP, safety features, and condition observations.</p>
          <div className="gbi-progress"><span style={{ width: `${indexProgress}%` }} /></div>
          <div className="gbi-button-row"><button onClick={buildVisualIndex} disabled={!sweeps.length || indexing}>{indexing ? `Indexing ${indexProgress}%` : visualKnowledge.length ? "Rebuild visual index" : "Build visual index"}</button>{indexing && <button className="gbi-secondary" onClick={() => { cancelIndexRef.current = true; }}>Stop</button>}</div>
          <p className="gbi-note">Prototype behavior: the visual index is cached in this browser. The public version should persist it server-side so visitors inherit a pre-evaluated building.</p>
        </article>

        <article className="gbi-panel">
          <p className="gbi-kicker">Reasoning policy</p><h2>Know what kind of answer you got</h2>
          <div className="gbi-levels"><span><b>Measured</b> geometry-derived</span><span><b>Observed</b> visually supported</span><span><b>Inferred</b> interpretation</span><span><b>Advised</b> recommendation</span></div>
        </article>
      </section>

      <section className="gbi-footer-note"><strong>GBI prototype.</strong> Geometry and AI outputs are decision-support evidence, not a certified survey, code inspection, appraisal, engineering opinion, or guarantee of hidden conditions.</section>
    </main>
  );
}
