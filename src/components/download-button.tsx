"use client";

interface DownloadButtonProps {
  slides: { imageUrl: string }[];
  disabled?: boolean;
}

export function DownloadButton({ slides, disabled }: DownloadButtonProps) {
  const handleDownload = async () => {
    for (let i = 0; i < slides.length; i++) {
      const link = document.createElement("a");
      link.href = slides[i].imageUrl;
      link.download = `vacation-slide-${i + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || slides.length === 0}
      className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      Download Reel
    </button>
  );
}
