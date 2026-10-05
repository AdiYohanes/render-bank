import Link from "next/link";

export default function PackNotFound() {
  return (
    <main className="content-wrap interim-page" id="main">
      <p className="eyebrow">404</p>
      <h1>Pack not available</h1>
      <p>
        This Pack is not available right now — it may have been renamed,
        archived, or is still in preparation.
      </p>
      <div className="actions">
        <Link className="button-primary" href="/packs">
          Browse Packs
        </Link>
        <Link className="button-secondary" href="/explore">
          Explore Prompts
        </Link>
      </div>
    </main>
  );
}
