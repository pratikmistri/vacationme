import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";

const OUTPUT_W = 1080;
const OUTPUT_H = 1920;
const SELFIE_SIZE = 200;
const BORDER = 6;

interface SlideVariant {
  headingOffset: number;
  caption: string;
  promptStyle: string;
}

const SLIDE_VARIANTS: SlideVariant[] = [
  {
    headingOffset: 0,
    caption: "Just arrived! 🧳",
    promptStyle:
      "just arriving, looking excited and happy, standing naturally in the foreground",
  },
  {
    headingOffset: 120,
    caption: "Exploring the area ✨",
    promptStyle:
      "walking and exploring, candid travel photo style, looking around curiously",
  },
  {
    headingOffset: 240,
    caption: "Living the dream! 🌴",
    promptStyle:
      "relaxing and enjoying the view, posing confidently, golden hour lighting",
  },
];

/**
 * Fetch a street view image as a reference for AI generation.
 * Returns a Buffer of the JPEG.
 */
async function fetchStreetView(
  lat: number,
  lng: number,
  heading: number,
): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    const url = `https://maps.googleapis.com/maps/api/streetview?size=640x400&location=${lat},${lng}&heading=${heading}&pitch=0&fov=90&key=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      return Buffer.from(await res.arrayBuffer());
    }
  }

  // Fallback: generate a gradient background with location text
  const hue = Math.abs(Math.round((lat * 3 + lng * 7 + heading) % 360));
  const svg = `
    <svg width="640" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue},55%,45%)" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360},60%,30%)" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#bg)" />
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
 * Build the first prompt that anchors the person's identity.
 */
function buildFirstPrompt(
  locationName: string | undefined,
  variant: SlideVariant,
): string {
  const locationDesc = locationName
    ? `at ${locationName}`
    : "at this travel destination";

  return [
    `I'm providing a selfie of a person. Study this person's face with extreme precision — their exact facial structure, jawline shape, eye shape and spacing, nose bridge and tip, lip shape, eyebrow thickness, skin tone and texture, hair style, hair color, and clothing.`,
    `Generate a photorealistic vertical travel reel photo of this EXACT same person ${locationDesc}.`,
    `The person should be ${variant.promptStyle}.`,
    `Use the provided street view image as reference for the exact location, architecture, and atmosphere.`,
    `CRITICAL: The person's face must be a pixel-perfect match to the selfie. Preserve the exact facial bone structure, eye shape, nose shape, mouth shape, and skin tone. Do NOT idealize, smooth, reshape, or alter any facial features. The person must be immediately recognizable as the same individual from the selfie.`,
    `The image should look like an authentic travel photo taken on a smartphone — natural lighting, slight depth of field, no studio look.`,
    `The person should be in the foreground, roughly waist-up or full-body, with the location clearly visible behind them.`,
    `Do NOT add any text, watermarks, or overlays to the image.`,
  ].join(" ");
}

/**
 * Build follow-up prompts that reference the same person from the chat history.
 */
function buildFollowUpPrompt(
  locationName: string | undefined,
  variant: SlideVariant,
): string {
  const locationDesc = locationName
    ? `at ${locationName}`
    : "at this travel destination";

  return [
    `Now generate another photo of the EXACT same person from my selfie, ${locationDesc}.`,
    `The person should be ${variant.promptStyle}.`,
    `Use this new street view image as the location reference.`,
    `CRITICAL: The person's face must remain identical — same facial bone structure, eye shape, nose shape, mouth shape, jawline, skin tone, hair, and clothing as the selfie and previous photos. Do NOT alter, idealize, or reshape any features. They must be immediately recognizable as the same individual.`,
    `The image should look like an authentic travel photo taken on a smartphone.`,
    `Do NOT add any text, watermarks, or overlays to the image.`,
  ].join(" ");
}

/**
 * Crop a selfie into a circle with a white border (fallback compositing).
 */
async function prepareSelfie(base64: string): Promise<Buffer> {
  const raw = Buffer.from(base64, "base64");

  const resized = await sharp(raw)
    .resize(SELFIE_SIZE, SELFIE_SIZE, { fit: "cover" })
    .toBuffer();

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

/**
 * Fallback: generate a slide using Sharp compositing when AI is unavailable.
 */
async function generateSlideFallback(
  streetViewBuf: Buffer,
  selfieBase64: string,
  variant: SlideVariant,
): Promise<Buffer> {
  const selfie = await prepareSelfie(selfieBase64);

  const base = await sharp(streetViewBuf)
    .resize(OUTPUT_W, OUTPUT_H, { fit: "cover" })
    .jpeg()
    .toBuffer();

  const selfieX = Math.round((OUTPUT_W - SELFIE_SIZE - BORDER * 2) / 2);
  const selfieY = OUTPUT_H - SELFIE_SIZE - BORDER * 2 - 300;

  return await sharp(base)
    .composite([{ input: selfie, left: selfieX, top: selfieY }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

/**
 * Extract base64 image data from a generateContent response.
 */
function extractImageData(
  response: { candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[] },
): string | null {
  const data = response.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.data,
  )?.inlineData?.data;
  return data ?? null;
}

/**
 * Generate vacation reel slides using AI image generation.
 * Uses a single chat session so the model maintains face consistency
 * across all slides. Falls back to Sharp compositing if AI is unavailable.
 */
export async function generateSlides(
  lat: number,
  lng: number,
  heading: number,
  selfieDataUrl: string,
  locationName?: string,
): Promise<{ id: string; imageUrl: string; caption: string }[]> {
  const selfieBase64 = selfieDataUrl.replace(/^data:image\/\w+;base64,/, "");
  const apiKey = process.env.GEMINI_API_KEY;

  // Pre-fetch all street view images in parallel
  const streetViewBuffers = await Promise.all(
    SLIDE_VARIANTS.map((variant) =>
      fetchStreetView(lat, lng, (heading + variant.headingOffset) % 360),
    ),
  );

  // Try AI generation with a single chat session for face consistency
  if (apiKey) {
    try {
      const client = new GoogleGenAI({ apiKey });
      const chat = client.chats.create({
        model: "gemini-3-pro-image-preview",
        config: {
          responseModalities: ["IMAGE"],
        },
      });

      const results: (string | null)[] = [];

      // Generate slides sequentially within one chat to preserve identity
      for (let i = 0; i < SLIDE_VARIANTS.length; i++) {
        const variant = SLIDE_VARIANTS[i];
        const streetViewBase64 = streetViewBuffers[i].toString("base64");

        const isFirst = i === 0;
        const prompt = isFirst
          ? buildFirstPrompt(locationName, variant)
          : buildFollowUpPrompt(locationName, variant);

        // Always include the selfie so the model has the face reference for every slide
        const messageParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: selfieBase64 } },
          { inlineData: { mimeType: "image/jpeg", data: streetViewBase64 } },
        ];

        const response = await chat.sendMessage({ message: messageParts });
        results.push(extractImageData(response));
      }

      // Build slides from AI results, falling back per-slide if needed
      const slides = await Promise.all(
        results.map(async (aiResult, i) => {
          const variant = SLIDE_VARIANTS[i];
          let finalBuffer: Buffer;

          if (aiResult) {
            finalBuffer = await sharp(Buffer.from(aiResult, "base64"))
              .resize(OUTPUT_W, OUTPUT_H, { fit: "cover" })
              .jpeg({ quality: 90 })
              .toBuffer();
          } else {
            console.warn(`Slide ${i + 1}: AI returned no image, using fallback`);
            finalBuffer = await generateSlideFallback(
              streetViewBuffers[i],
              selfieBase64,
              variant,
            );
          }

          return {
            id: String(i + 1),
            imageUrl: `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
            caption: variant.caption,
          };
        }),
      );

      return slides;
    } catch (err) {
      console.error("AI chat session failed, falling back to Sharp:", err);
    }
  }

  // Full fallback: no API key or chat session failed entirely
  const slides = await Promise.all(
    SLIDE_VARIANTS.map(async (variant, i) => {
      const finalBuffer = await generateSlideFallback(
        streetViewBuffers[i],
        selfieBase64,
        variant,
      );

      return {
        id: String(i + 1),
        imageUrl: `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
        caption: variant.caption,
      };
    }),
  );

  return slides;
}
