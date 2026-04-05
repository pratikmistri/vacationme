"use client";

import { useState } from "react";
import Link from "next/link";
import { MapSearch } from "@/components/map-search";
import { StreetViewPreview } from "@/components/street-view-preview";
import { SelfieCapture } from "@/components/selfie-capture";

interface Location {
  lat: number;
  lng: number;
  name: string;
}

export default function CreatePage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [heading, setHeading] = useState(0);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const canGenerate = location && selfie && !generating;

  const handleLocationSelect = (loc: {
    lat: number;
    lng: number;
    name: string;
    defaultHeading?: number;
  }) => {
    setLocation(loc);
    if (loc.defaultHeading !== undefined) {
      setHeading(loc.defaultHeading);
    }
  };

  const handleGenerate = async () => {
    if (!location || !selfie) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streetView: {
            lat: location.lat,
            lng: location.lng,
            heading,
            pitch: 0,
            zoom: 1,
          },
          selfie: {
            dataUrl: selfie,
            width: 640,
            height: 480,
          },
          locationName: location.name,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      sessionStorage.setItem("vacationme-slides", JSON.stringify(data.slides));
      window.location.href = "/reel";
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-lg px-5 pb-52 pt-10">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← Back
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create Your Reel
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Pick a destination and snap a selfie to generate your vacation reel.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {location && (
            <section>
              <StreetViewPreview
                lat={location.lat}
                lng={location.lng}
                locationName={location.name}
                heading={heading}
                onHeadingChange={setHeading}
              />
            </section>
          )}

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {location ? "2." : "1."} Take a Selfie
            </h2>
            <SelfieCapture onCapture={setSelfie} />
          </section>

          <section>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {generating ? "Generating..." : "Generate Vacation Reel"}
            </button>
          </section>
        </div>
      </div>

      <MapSearch
        selected={location?.name ?? null}
        onSelect={handleLocationSelect}
      />
    </div>
  );
}
