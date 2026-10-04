"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="content-wrap interim-page" id="main">
      <h1>Something went wrong.</h1>
      <p>We couldn&apos;t load the library right now. Please try again.</p>
      <div className="actions">
        <button className="button-primary" onClick={reset}>
          Retry
        </button>
        <Link className="button-secondary" href="/explore">
          Explore Prompts
        </Link>
        <Link href="/">Home</Link>
      </div>
    </main>
  );
}
