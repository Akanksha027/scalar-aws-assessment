import { NextResponse } from "next/server";

const BACKEND =
  process.env.BACKEND_URL ??
  "https://scalar-aws-assessment-production.up.railway.app";

export async function GET() {
  const upstream = await fetch(`${BACKEND}/health`, { cache: "no-store" });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
