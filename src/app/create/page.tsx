"use client";

import { useState } from "react";
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

  // Step 1: Camera — shown when no selfie taken yet
  if (!selfie) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <a
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </a>
          <h1 className="text-sm font-semibold text-white">
            Take a Selfie
          </h1>
          <div className="w-12" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-12">
          <SelfieCapture onCapture={setSelfie} />
        </div>
      </div>
    );
  }

  // Step 2: Pick destination + panorama
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-lg px-5 pb-52 pt-6">
        {/* Header with selfie preview */}
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
            <img
              src={selfie}
              alt="Your selfie"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Pick Your Destination
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Choose a place and look around in street view
            </p>
          </div>
          <button
            onClick={() => setSelfie(null)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Retake
          </button>
        </div>

        {/* Panorama */}
        {location && (
          <div className="mt-6">
            <StreetViewPreview
              lat={location.lat}
              lng={location.lng}
              locationName={location.name}
              heading={heading}
              onHeadingChange={setHeading}
            />
          </div>
        )}

        {/* Prompt to pick destination */}
        {!location && (
          <div className="mt-8 flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <span className="text-2xl">🌍</span>
            </div>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Pick a destination below to preview the street view
            </p>
          </div>
        )}

        {/* Generate button */}
        {location && (
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {generating ? "Generating..." : "Generate Vacation Reel"}
            </button>
          </div>
        )}
      </div>

      <MapSearch
        selected={location?.name ?? null}
        onSelect={handleLocationSelect}
      />
    </div>
  );
}
