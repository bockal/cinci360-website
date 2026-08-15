import { env } from "cloudflare:workers";

const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const { visitorId } = await request.json() as { visitorId?: string };
    if (!visitorId || !visitorIdPattern.test(visitorId)) {
      return Response.json({ error: "Invalid visitor identifier" }, { status: 400 });
    }

    await env.DB.prepare("INSERT OR IGNORE INTO visitors (id) VALUES (?)").bind(visitorId).run();
    const result = await env.DB.prepare("SELECT COUNT(*) AS count FROM visitors").first<{ count: number }>();
    return Response.json({ count: Number(result?.count ?? 0) }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Counter unavailable" }, { status: 503 });
  }
}
