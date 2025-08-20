import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.WS_URL || "";
  if (!wsUrl) {
    return NextResponse.json(
      { error: "WS_URL not configured. Set NEXT_PUBLIC_WS_URL or WS_URL." },
      { status: 500 }
    );
  }
  return NextResponse.json({ wsUrl });
}
