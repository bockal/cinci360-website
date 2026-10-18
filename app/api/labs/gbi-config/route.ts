import { NextResponse } from "next/server";

// GitHub Pages is a static export. The SDK key is intentionally inlined at
// build time (or emitted as an empty value) so this route remains deployable
// without a runtime server.
export const dynamic = "force-static";

export async function GET() {
  const matterportSdkKey = process.env.NEXT_PUBLIC_MATTERPORT_SDK_KEY?.trim() || "";

  return NextResponse.json(
    { matterportSdkKey },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
