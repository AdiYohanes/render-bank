import Link from "next/link";

export default function NotFound() {
  return (
    <main className="content-wrap interim-page" id="main">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>That page may have moved or is not available yet.</p>
      <div className="actions">
        <Link className="button-primary" href="/explore">
          Explore Prompts
        </Link>
        <Link className="button-secondary" href="/">
          Home
        </Link>
      </div>
    </main>
  );
}
