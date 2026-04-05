"use client";

import { useState, useEffect } from "react";

interface Slide {
  id: string;
  imageUrl: string;
  caption?: string;
}

interface SlideshowViewerProps {
  slides: Slide[];
  autoPlay?: boolean;
  intervalMs?: number;
}

export function SlideshowViewer({
  slides,
  autoPlay = true,
  intervalMs = 3000,
}: SlideshowViewerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoPlay, intervalMs, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="mx-auto flex aspect-[9/16] w-full max-h-[80vh] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        No slides to show
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto aspect-[9/16] w-full max-h-[80vh] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        <img
          src={slide.imageUrl}
          alt={slide.caption || `Slide ${current + 1}`}
          className="h-full w-full object-cover transition-opacity duration-500"
        />
        {slide.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
            <p className="text-sm font-medium text-white">{slide.caption}</p>
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() =>
              setCurrent((c) => (c - 1 + slides.length) % slides.length)
            }
            className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Previous slide"
          >
            ←
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-4 bg-zinc-900 dark:bg-zinc-100"
                    : "w-1.5 bg-zinc-300 dark:bg-zinc-600"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
