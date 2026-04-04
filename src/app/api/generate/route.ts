import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { generateSlides } from "@/lib/composite";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { ok } = rateLimit(ip);

  if (!ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { streetView, selfie } = body;

  if (!streetView || typeof streetView.lat !== "number" || typeof streetView.lng !== "number") {
    return NextResponse.json({ error: "Street view params required" }, { status: 400 });
  }

  if (!selfie || !selfie.dataUrl) {
    return NextResponse.json({ error: "Selfie data required" }, { status: 400 });
  }

  try {
    const slides = await generateSlides(
      streetView.lat,
      streetView.lng,
      streetView.heading ?? 0,
      selfie.dataUrl,
    );

    const response: GenerateResponse = { slides };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Failed to generate slides:", err);
    return NextResponse.json(
      { error: "Failed to generate your reel. Please try again." },
      { status: 500 },
    );
  }
}
