interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BUILDING_DATA: R2Bucket;
  OPENAI_API_KEY?: string;
  MATTERPORT_SDK_KEY?: string;
}

const CRC = {
  id: "BLDG-001",
  slug: "crc",
  name: "Cincinnati Rowing Club",
  status: "prototype",
  matterportSid: "qM1n2tF3CAQ",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/buildings/BLDG-001" && request.method === "GET") {
      return json(CRC);
    }

    if (url.pathname === "/api/buildings/BLDG-001/ask" && request.method === "POST") {
      const body = await request.json().catch(() => null) as { question?: string } | null;
      const question = body?.question?.trim();
      if (!question) return json({ error: "Ask a building question." }, 400);

      if (!env.OPENAI_API_KEY) {
        return json({
          answer: "Building 001 is connected, but the reasoning service has not been configured for this deployment yet."
        });
      }

      return json({
        answer: "Building 001 is online. The next milestone is connecting its persisted CRC evidence index to this endpoint so every answer is retrieved from stored building knowledge rather than rebuilt in the browser."
      });
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
