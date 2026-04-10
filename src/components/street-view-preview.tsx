"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface StreetViewPanoramaProps {
  lat: number;
  lng: number;
  locationName: string;
  heading: number;
  onHeadingChange: (heading: number) => void;
}

let optionsSet = false;

function ensureOptions() {
  if (optionsSet) return;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return false;
  setOptions({ key: apiKey, v: "weekly" });
  optionsSet = true;
  return true;
}

export function StreetViewPreview({
  lat,
  lng,
  locationName,
  heading,
  onHeadingChange,
}: StreetViewPanoramaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [noApiKey, setNoApiKey] = useState(false);

  const headingRef = useRef(heading);
  headingRef.current = heading;

  // Load Google Maps API and initialize panorama
  useEffect(() => {
    const hasKey = ensureOptions();
    if (hasKey === false) {
      setNoApiKey(true);
      return;
    }

    let cancelled = false;

    importLibrary("streetView").then(() => {
      if (cancelled || !containerRef.current) return;

      const pano = new google.maps.StreetViewPanorama(containerRef.current, {
        position: { lat, lng },
        pov: { heading: headingRef.current, pitch: 0 },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
        motionTracking: false,
        motionTrackingControl: false,
        fullscreenControl: false,
        linksControl: false,
        panControl: false,
        zoomControl: false,
        enableCloseButton: false,
      });

      pano.addListener("pov_changed", () => {
        const pov = pano.getPov();
        if (pov) {
          onHeadingChange(Math.round(pov.heading));
        }
      });

      panoramaRef.current = pano;
      setLoaded(true);
    });

    return () => {
      cancelled = true;
      if (panoramaRef.current) {
        google.maps.event.clearInstanceListeners(panoramaRef.current);
        panoramaRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update position when location changes
  const updatePosition = useCallback(() => {
    if (panoramaRef.current) {
      panoramaRef.current.setPosition({ lat, lng });
      panoramaRef.current.setPov({ heading, pitch: 0 });
    }
  }, [lat, lng, heading]);

  useEffect(() => {
    updatePosition();
  }, [lat, lng]); // eslint-disable-line react-hooks/exhaustive-deps

  if (noApiKey) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800">
        <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
          <div className="text-center px-6">
            <p className="font-medium">Street View Panorama</p>
            <p className="mt-1 text-xs text-zinc-400">
              {locationName} ({lat.toFixed(4)}, {lng.toFixed(4)})
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable panorama
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
        <p className="text-sm font-semibold text-white drop-shadow-sm">
          {locationName}
        </p>
        <p className="mt-0.5 text-xs text-white/60">
          Drag to look around
        </p>
      </div>
    </div>
  );
}
