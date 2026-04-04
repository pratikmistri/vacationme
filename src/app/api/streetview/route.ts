import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { ok, remaining } = rateLimit(ip);

  if (!ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  const body = await request.json();
  const { lat, lng, heading = 0, pitch = 0, zoom = 1, width = 640, height = 400 } = body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      imageUrl: `/api/streetview/placeholder?lat=${lat}&lng=${lng}`,
      placeholder: true,
    });
  }

  const url = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${90 / zoom}&key=${apiKey}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      return NextResponse.json(
        { error: "Failed to fetch street view image" },
        { status: 502 }
      );
    }

    const buffer = await resp.arrayBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Street view request failed" }, { status: 500 });
  }
}
