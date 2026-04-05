import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-2xl dark:bg-zinc-100">
          <span className="text-white dark:text-zinc-900">✈</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          vacationMe
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          Pick any destination on Earth, snap a selfie, and get a fun vacation
          reel — no passport required.
        </p>

        <Link
          href="/create"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Get Started
        </Link>

        <p className="mt-4 text-xs text-zinc-400">
          Your selfie is used only for reel generation and is not stored.
        </p>
      </main>
    </div>
  );
}
