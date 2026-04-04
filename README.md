# vacationMe

Pick any destination on Earth, snap a selfie, and get a fun vacation reel.

## Setup

npm install
cp .env.example .env.local
# Fill in your API keys in .env.local
npm run dev

Open http://localhost:3000

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| GOOGLE_MAPS_API_KEY | No | Server-side Google Street View API key |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | No | Client-side Google Maps key (for preview) |
| BLOB_READ_WRITE_TOKEN | No | Vercel Blob storage token (production) |
| NEXT_PUBLIC_APP_URL | No | App base URL (defaults to localhost:3000) |

The app runs without any API keys using placeholder data.

## Project Structure

    src/
      app/
        page.tsx            Landing page with consent gate
        create/page.tsx     Destination picker + selfie capture
        reel/page.tsx       Slideshow viewer + download
        api/
          streetview/       POST - proxy to Google Street View
          generate/         POST - generate vacation reel slides
      components/
        consent-checkbox    Camera consent toggle
        map-search          Location search (TODO: Google Places)
        street-view-preview
        selfie-capture      Webcam capture
        slideshow-viewer    Auto-advancing slideshow
        download-button     Download reel images
      lib/
        types.ts            Shared TypeScript interfaces
        rate-limit.ts       In-memory per-IP rate limiter
        blob.ts             Stubbed Vercel Blob helpers

## Deploy

    npm run build

Deploy to Vercel:
1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variables
4. Deploy

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
