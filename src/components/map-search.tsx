"use client";

import { useRef } from "react";

interface Destination {
  name: string;
  city: string;
  lat: number;
  lng: number;
  defaultHeading: number;
  image: string;
}

interface MapSearchProps {
  selected?: string | null;
  onSelect: (location: {
    lat: number;
    lng: number;
    name: string;
    defaultHeading?: number;
  }) => void;
}

const DESTINATIONS: Destination[] = [
  { name: "Eiffel Tower", city: "Paris", lat: 48.8584, lng: 2.2945, defaultHeading: 5, image: "/destinations/eiffel-tower.jpg" },
  { name: "Times Square", city: "New York", lat: 40.758, lng: -73.9855, defaultHeading: 0, image: "/destinations/times-square.jpg" },
  { name: "Colosseum", city: "Rome", lat: 41.8902, lng: 12.4922, defaultHeading: 200, image: "/destinations/colosseum.jpg" },
  { name: "Shibuya Crossing", city: "Tokyo", lat: 35.6595, lng: 139.7004, defaultHeading: 130, image: "/destinations/shibuya-crossing.jpg" },
  { name: "Big Ben", city: "London", lat: 51.5007, lng: -0.1246, defaultHeading: 160, image: "/destinations/big-ben.jpg" },
  { name: "Sydney Opera House", city: "Sydney", lat: -33.8568, lng: 151.2153, defaultHeading: 300, image: "/destinations/sydney-opera-house.jpg" },
  { name: "Burj Khalifa", city: "Dubai", lat: 25.1972, lng: 55.2744, defaultHeading: 320, image: "/destinations/burj-khalifa.jpg" },
  { name: "Sagrada Familia", city: "Barcelona", lat: 41.4036, lng: 2.1744, defaultHeading: 210, image: "/destinations/sagrada-familia.jpg" },
  { name: "Copacabana Beach", city: "Rio de Janeiro", lat: -22.9711, lng: -43.1822, defaultHeading: 180, image: "/destinations/copacabana-beach.jpg" },
  { name: "Hagia Sophia", city: "Istanbul", lat: 41.0086, lng: 28.9802, defaultHeading: 200, image: "/destinations/hagia-sophia.jpg" },
  { name: "Brooklyn Bridge", city: "New York", lat: 40.7061, lng: -73.9969, defaultHeading: 30, image: "/destinations/brooklyn-bridge.jpg" },
  { name: "Arc de Triomphe", city: "Paris", lat: 48.8738, lng: 2.295, defaultHeading: 200, image: "/destinations/arc-de-triomphe.jpg" },
  { name: "Tower Bridge", city: "London", lat: 51.5055, lng: -0.0754, defaultHeading: 300, image: "/destinations/tower-bridge.jpg" },
  { name: "Tokyo Tower", city: "Tokyo", lat: 35.6586, lng: 139.7454, defaultHeading: 0, image: "/destinations/tokyo-tower.jpg" },
  { name: "Trevi Fountain", city: "Rome", lat: 41.9009, lng: 12.4833, defaultHeading: 140, image: "/destinations/trevi-fountain.jpg" },
];

export function MapSearch({ selected, onSelect }: MapSearchProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (d: Destination) => {
    onSelect({
      lat: d.lat,
      lng: d.lng,
      name: `${d.name}, ${d.city}`,
      defaultHeading: d.defaultHeading,
    });
  };

  const isSelected = (d: Destination) =>
    selected === `${d.name}, ${d.city}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="pointer-events-none h-8 bg-gradient-to-t from-zinc-50 to-transparent dark:from-black" />
      <div className="bg-zinc-50 pb-6 pt-2 dark:bg-black">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-5 py-2 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {DESTINATIONS.map((d) => (
            <button
              key={`${d.city}-${d.name}`}
              onClick={() => handleSelect(d)}
              className={`relative shrink-0 overflow-hidden rounded-2xl text-left transition-all duration-200 ${
                isSelected(d)
                  ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-50 scale-[1.02] dark:ring-offset-black"
                  : "hover:scale-[1.02]"
              }`}
              style={{
                width: 180,
                height: 140,
                scrollSnapAlign: "start",
              }}
            >
              <img
                src={d.image}
                alt={d.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4">
                <p className="text-sm font-semibold leading-tight text-white drop-shadow-sm">
                  {d.name}
                </p>
                <p className="mt-0.5 text-xs text-white/70">{d.city}</p>
              </div>
              {isSelected(d) && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs text-white backdrop-blur-sm">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
