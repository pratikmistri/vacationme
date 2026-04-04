"use client";

import { useRef, useState, useCallback } from "react";

interface SelfieCaptureProps {
  onCapture: (dataUrl: string) => void;
}

export function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      alert("Could not access camera. Please allow camera permissions.");
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCaptured(dataUrl);
    onCapture(dataUrl);

    // Stop camera
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  }, [onCapture]);

  const retake = useCallback(() => {
    setCaptured(null);
    startCamera();
  }, [startCamera]);

  if (captured) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
          <img
            src={captured}
            alt="Your selfie"
            className="h-full w-full object-cover"
          />
        </div>
        <button
          onClick={retake}
          className="self-start rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Retake
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${streaming ? "" : "hidden"}`}
        />
        {!streaming && (
          <div className="flex h-full w-full items-center justify-center">
            <button
              onClick={startCamera}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Open Camera
            </button>
          </div>
        )}
      </div>
      {streaming && (
        <button
          onClick={capture}
          className="self-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Take Selfie
        </button>
      )}
    </div>
  );
}
