import { NextResponse } from "next/server";

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
