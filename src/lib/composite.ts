import sharp from "sharp";

const OUTPUT_W = 640;
const OUTPUT_H = 400;
const SELFIE_SIZE = 140;
const BORDER = 4;

/**
 * Fetch a street view image. Returns a Buffer of the JPEG,
 * or a generated gradient placeholder if no API key is set.
 */
async function fetchStreetView(
  lat: number,
  lng: number,
  heading: number,
): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    const url = `https://maps.googleapis.com/maps/api/streetview?size=${OUTPUT_W}x${OUTPUT_H}&location=${lat},${lng}&heading=${heading}&pitch=0&fov=90&key=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      return Buffer.from(await res.arrayBuffer());
    }
  }

  // Fallback: generate a gradient background with location text
  const hue = Math.abs(Math.round((lat * 3 + lng * 7 + heading) % 360));
  const svg = `
    <svg width="${OUTPUT_W}" height="${OUTPUT_H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue},55%,45%)" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360},60%,30%)" />
        </linearGradient>
      </defs>
      <rect width="${OUTPUT_W}" height="${OUTPUT_H}" fill="url(#bg)" />
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20" font-weight="600" opacity="0.9">
        ${lat.toFixed(2)}°, ${lng.toFixed(2)}°
      </text>
      <text x="50%" y="58%" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14" opacity="0.6">
        heading ${Math.round(heading)}°
      </text>
    </svg>`;

  return await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
}

/**
 * Crop a selfie into a circle with a white border.
 * Returns a PNG buffer with transparency.
 */
async function prepareSelfie(dataUrl: string): Promise<Buffer> {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const raw = Buffer.from(base64, "base64");

  // Resize to a square
  const resized = await sharp(raw)
    .resize(SELFIE_SIZE, SELFIE_SIZE, { fit: "cover" })
    .toBuffer();

  // Create circular mask
  const r = SELFIE_SIZE / 2;
  const mask = Buffer.from(
    `<svg width="${SELFIE_SIZE}" height="${SELFIE_SIZE}">
      <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
    </svg>`,
  );

  const circular = await sharp(resized)
    .composite([{ input: await sharp(mask).toBuffer(), blend: "dest-in" }])
    .png()
    .toBuffer();

  // Add white border ring behind the circle
  const outerSize = SELFIE_SIZE + BORDER * 2;
  const outerR = outerSize / 2;
  const borderRing = Buffer.from(
    `<svg width="${outerSize}" height="${outerSize}">
      <circle cx="${outerR}" cy="${outerR}" r="${outerR}" fill="white"/>
    </svg>`,
  );

  return await sharp(await sharp(borderRing).png().toBuffer())
    .composite([{ input: circular, left: BORDER, top: BORDER }])
    .png()
    .toBuffer();
}

/** Add a caption bar at the bottom of the image. */
async function addCaption(
  image: Buffer,
  caption: string,
): Promise<Buffer> {
  const barHeight = 48;
  const escapedCaption = caption
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const overlay = Buffer.from(
    `<svg width="${OUTPUT_W}" height="${barHeight}">
      <rect width="${OUTPUT_W}" height="${barHeight}" fill="black" opacity="0.55" rx="0"/>
      <text x="20" y="30" fill="white" font-family="sans-serif" font-size="15" font-weight="500">
        ${escapedCaption}
      </text>
    </svg>`,
  );

  return await sharp(image)
    .composite([
      { input: await sharp(overlay).png().toBuffer(), gravity: "south" },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

export interface SlideSpec {
  headingOffset: number;
  selfieX: number;
  selfieY: number;
  caption: string;
}

const SLIDE_SPECS: SlideSpec[] = [
  {
    headingOffset: 0,
    selfieX: OUTPUT_W - SELFIE_SIZE - BORDER * 2 - 20,
    selfieY: OUTPUT_H - SELFIE_SIZE - BORDER * 2 - 70,
    caption: "Just arrived! 🧳",
  },
  {
    headingOffset: 120,
    selfieX: 20,
    selfieY: OUTPUT_H - SELFIE_SIZE - BORDER * 2 - 70,
    caption: "Exploring the area ✨",
  },
  {
    headingOffset: 240,
    selfieX: (OUTPUT_W - SELFIE_SIZE - BORDER * 2) / 2,
    selfieY: OUTPUT_H - SELFIE_SIZE - BORDER * 2 - 70,
    caption: "Living the dream! 🌴",
  },
];

/**
 * Generate vacation reel slides by compositing selfie onto street views.
 */
export async function generateSlides(
  lat: number,
  lng: number,
  heading: number,
  selfieDataUrl: string,
): Promise<{ id: string; imageUrl: string; caption: string }[]> {
  const selfie = await prepareSelfie(selfieDataUrl);

  const slides = await Promise.all(
    SLIDE_SPECS.map(async (spec, i) => {
      const bg = await fetchStreetView(lat, lng, (heading + spec.headingOffset) % 360);

      // Ensure the background is exactly the right size
      const base = await sharp(bg)
        .resize(OUTPUT_W, OUTPUT_H, { fit: "cover" })
        .jpeg()
        .toBuffer();

      // Composite selfie onto background
      const composited = await sharp(base)
        .composite([{ input: selfie, left: spec.selfieX, top: spec.selfieY }])
        .jpeg()
        .toBuffer();

      // Add caption
      const final = await addCaption(composited, spec.caption);

      const dataUrl = `data:image/jpeg;base64,${final.toString("base64")}`;

      return {
        id: String(i + 1),
        imageUrl: dataUrl,
        caption: spec.caption,
      };
    }),
  );

  return slides;
}
