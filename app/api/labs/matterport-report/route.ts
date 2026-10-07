import { NextRequest } from "next/server";

type InventoryItem = {
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

type ReportRequest = {
  clientName?: string;
  projectTitle?: string;
  model?: {
    sid?: string;
    name?: string;
    source?: string;
  };
  summary?: string;
  namingConvention?: string;
  items?: InventoryItem[];
};

function pdfEscape(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll(/[\r\n]+/g, " ");
}

function normalize(value: unknown) {
  return typeof value === "string" ? value.replaceAll(/\s+/g, " ").trim() : "";
}

function wrap(text: string, width = 88) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= width) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word.length <= width ? word : word.slice(0, width);
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function buildPdf(lines: string[]) {
  const pageWidth = 612;
  const pageHeight = 792;
  const left = 50;
  const top = 742;
  const lineHeight = 14;
  const linesPerPage = 46;
  const pages: string[][] = [];

  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (!pages.length) pages.push(["Cinci360 Inventory Report"]);

  const objects: string[] = [];
  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  const pageIds: number[] = [];
  const contentIds: number[] = [];

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let nextId = 4;
  for (const pageLines of pages) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageIds.push(pageId);
    contentIds.push(contentId);

    let content = "BT\n/F1 10 Tf\n";
    pageLines.forEach((line, index) => {
      const y = top - index * lineHeight;
      content += `1 0 0 1 ${left} ${y} Tm (${pdfEscape(line)}) Tj\n`;
    });
    content += "ET";

    objects[contentId] = `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
  }

  objects[pagesId] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(pdf, "utf8");
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function POST(request: NextRequest) {
  let body: ReportRequest;
  try {
    body = (await request.json()) as ReportRequest;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return Response.json({ error: "Inventory items are required to create a PDF." }, { status: 400 });
  }

  const title = normalize(body.projectTitle) || "Matterport Visual Inventory";
  const client = normalize(body.clientName);
  const modelName = normalize(body.model?.name) || "Matterport property";
  const modelSid = normalize(body.model?.sid);
  const modelSource = normalize(body.model?.source);
  const naming = normalize(body.namingConvention) || "{CATEGORY}-{NNN}";
  const summary = normalize(body.summary);

  const lines: string[] = [
    "CINCI360",
    title,
    "",
    client ? `Client: ${client}` : "Client: —",
    `Matterport model: ${modelName}${modelSid ? ` (${modelSid})` : ""}`,
    modelSource ? `Source: ${modelSource}` : "",
    `Naming convention: ${naming}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
  ].filter(Boolean);

  if (summary) {
    lines.push("SUMMARY");
    lines.push(...wrap(summary));
    lines.push("");
  }

  lines.push("INVENTORY");
  lines.push("");

  items.forEach((item, index) => {
    const confidence = Number.isFinite(item.confidence) ? Math.round(item.confidence * 100) : 0;
    const evidence = Array.isArray(item.evidenceSweepIds) ? item.evidenceSweepIds.join(", ") : "";
    const heading = `${index + 1}. ${normalize(item.assetId) || "UNNAMED"} | ${normalize(item.category) || "asset"} | Qty ${item.quantity || 1} | ${confidence}%`;
    lines.push(...wrap(heading));
    if (normalize(item.visibleName)) lines.push(...wrap(`Visible name/ID: ${normalize(item.visibleName)}`));
    if (normalize(item.description)) lines.push(...wrap(`Description: ${normalize(item.description)}`));
    if (evidence) lines.push(...wrap(`Evidence sweeps: ${evidence}`));
    if (normalize(item.duplicateGroup)) lines.push(...wrap(`Possible duplicate group: ${normalize(item.duplicateGroup)}`));
    if (normalize(item.notes)) lines.push(...wrap(`Notes: ${normalize(item.notes)}`));
    lines.push("");
  });

  lines.push("DISCLAIMER");
  lines.push(
    ...wrap(
      "This Cinci360 report is an AI-assisted visual inventory derived from visible Matterport imagery. It is intended as a review aid and is not a certified appraisal, insurance schedule, engineering inspection, or guarantee that all assets or identifiers are visible.",
    ),
  );

  const pdf = buildPdf(lines);
  const safeName = (title || "inventory").toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cinci360-${safeName || "inventory"}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
