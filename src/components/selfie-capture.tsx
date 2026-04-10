"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SelfieCaptureProps {
  onCapture: (dataUrl: string) => void;
}

export function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions and reload.");
    }
  }, []);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup camera on unmount
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

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
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48 overflow-hidden rounded-full border-4 border-white shadow-xl">
          <img
            src={captured}
            alt="Your selfie"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={retake}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-[3/4] max-h-[60vh] overflow-hidden rounded-3xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover scale-x-[-1] ${streaming ? "" : "hidden"}`}
        />
        {!streaming && !error && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
          </div>
        )}
        {error && (
          <div className="flex h-full w-full items-center justify-center px-8">
            <div className="text-center">
              <p className="text-sm text-zinc-400">{error}</p>
              <button
                onClick={startCamera}
                className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
      {streaming && (
        <button
          onClick={capture}
          className="mt-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg backdrop-blur-sm transition-transform active:scale-90"
          aria-label="Take selfie"
        >
          <div className="h-12 w-12 rounded-full bg-white" />
        </button>
      )}
    </div>
  );
}
