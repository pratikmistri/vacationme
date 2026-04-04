"use client";

import { useState } from "react";

interface MapSearchProps {
  onSelect: (location: { lat: number; lng: number; name: string }) => void;
}

const PRESETS = [
  { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { name: "New York, USA", lat: 40.7128, lng: -74.006 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729 },
];

export function MapSearch({ onSelect }: MapSearchProps) {
  const [query, setQuery] = useState("");

  // TODO: Replace with Google Places Autocomplete when API key is available
  const filtered = PRESETS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Where do you want to visit?
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a destination..."
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
      />
      <div className="flex flex-wrap gap-2">
        {filtered.map((place) => (
          <button
            key={place.name}
            onClick={() => onSelect(place)}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {place.name}
          </button>
        ))}
      </div>
    </div>
  );
}
