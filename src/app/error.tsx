"use client";

import Link from "next/link";

/** Runtime errors (e.g. the Laravel API is unreachable): same look as the Blade 500 page. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="bg-grid-light absolute inset-0 -z-10" />
      <div className="container-x relative py-20 text-center sm:py-28">
        <p className="text-gradient font-display text-8xl font-bold leading-none tracking-[-0.06em] sm:text-[11rem]">500</p>
        <h1 className="mt-6 text-3xl font-bold text-ink sm:text-4xl">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">We are fixing it. Please try again in a moment.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary btn-lg">
            Try again
          </button>
          <Link href="/" className="btn btn-secondary btn-lg">
            Go to homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
