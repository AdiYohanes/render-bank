import type { Metadata } from "next";

import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy pending",
  robots: { index: false, follow: false },
};

export default function Privacy() {
  return (
    <main className="content-wrap interim-page" id="main">
      <h1>Privacy policy is not published yet.</h1>
      <p>
        This is not a privacy policy. The public library is still in preparation
        and no purchases are available.
      </p>
      <Link href="/">Return Home</Link>
    </main>
  );
}
