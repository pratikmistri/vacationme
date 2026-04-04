"use client";

interface StreetViewPreviewProps {
  lat: number;
  lng: number;
  locationName: string;
  heading: number;
  onHeadingChange: (heading: number) => void;
}

export function StreetViewPreview({
  lat,
  lng,
  locationName,
  heading,
  onHeadingChange,
}: StreetViewPreviewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const imageUrl = apiKey
    ? `https://maps.googleapis.com/maps/api/streetview?size=640x400&location=${lat},${lng}&heading=${heading}&pitch=0&fov=90&key=${apiKey}`
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Street view of ${locationName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
            <div className="text-center px-6">
              <p className="font-medium">Street View Preview</p>
              <p className="mt-1 text-xs text-zinc-400">
                {locationName} ({lat.toFixed(4)}, {lng.toFixed(4)})
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to see the actual view
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
          Rotate view
        </label>
        <input
          type="range"
          min={0}
          max={360}
          value={heading}
          onChange={(e) => onHeadingChange(Number(e.target.value))}
          className="flex-1 accent-zinc-900 dark:accent-zinc-100"
        />
        <span className="text-xs tabular-nums text-zinc-400 w-8 text-right">
          {heading}°
        </span>
      </div>
    </div>
  );
}
