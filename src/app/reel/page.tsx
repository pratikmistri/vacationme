"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideshowViewer } from "@/components/slideshow-viewer";
import { DownloadButton } from "@/components/download-button";

interface Slide {
  id: string;
  imageUrl: string;
  caption?: string;
}

export default function ReelPage() {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("vacationme-slides");
    if (!stored) return;
    try {
      setSlides(JSON.parse(stored) as Slide[]);
    } catch {
      // invalid data, keep empty
    }
  }, []);

  if (slides.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">No reel found. Create one first!</p>
        <Link
          href="/create"
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create Reel
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-lg px-5 py-10">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← Back
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your Vacation Reel
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Swipe through your vacation photos or download them.
        </p>

        <div className="mt-8 flex flex-col gap-6">
          <SlideshowViewer slides={slides} />

          <div className="flex items-center gap-3">
            <DownloadButton slides={slides} />
            <Link
              href="/create"
              className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Create Another
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
