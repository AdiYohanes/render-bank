import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { lookupPaymentStatus } from "@/lib/payment/status-lookup";
import type { StatusView } from "@/lib/payment/status-resolve.mjs";

/** The requested route's own state (from the URL). */
type RouteName = "success" | "pending" | "failed" | "cancelled";

/** Where each server status view belongs; unknown has no canonical route. */
const KIND_TO_ROUTE: Record<StatusView["kind"], RouteName | null> = {
  success: "success", pending: "pending", failed: "failed", cancelled: "cancelled", unknown: null,
};

const UNKNOWN_COPY = "We couldn't verify your payment status.";

/** SCREEN_REQUIREMENTS §41: accessible status text before the result resolves. */
function CheckingStatus() {
  return <p className="payment-lede" role="status">Checking your payment...</p>;
}

/**
 * Resolves the server purchase state and renders the matched screen (async
 * inner component so Suspense can stream the checking copy first).
 */
async function StatusBody({ route, reference }: { route: RouteName; reference: string | undefined }) {
  const view = await lookupPaymentStatus(reference ?? null);

  const canonical = KIND_TO_ROUTE[view.kind];
  if (canonical && canonical !== route && reference) {
    redirect(`/payment/${canonical}?ref=${encodeURIComponent(reference)}`);
  }

  if (view.kind === "unknown") {
    return (
      <section className="payment-page" aria-live="polite">
        <h1>Payment status</h1>
        <p className="payment-lede" role="status">{UNKNOWN_COPY}</p>
        <div className="payment-actions">
          {/* Recheck (SCREEN §44): a fresh request — the webhook may have landed
              since this link was opened. Same route, server state decides. */}
          <Link className="payment-primary" href={`/payment/${route}?ref=${encodeURIComponent(reference ?? "")}`} prefetch={false}>Check Again</Link>
          <Link className="payment-secondary" href="/packs">Browse Packs</Link>
          <Link className="payment-secondary" href="/explore">Explore Prompts</Link>
        </div>
        <p className="payment-help">If you edited the link, go back to the Pack page and start checkout again. The reference is not displayed anywhere for privacy.</p>
      </section>
    );
  }

  if (view.kind === "success") {
    return (
      <section className="payment-page" aria-live="polite">
        <h1>Payment successful</h1>
        <p className="payment-success-lede" role="status">Your payment went through and access is being prepared.</p>
        {view.packTitle ? <p className="payment-pack">Purchased: <strong>{view.packTitle}</strong></p> : null}
        {view.maskedEmail ? <p className="payment-email">Access link sent to <span className="payment-email-masked">{view.maskedEmail}</span></p> : null}
        <div className="payment-actions">
          <Link className="payment-primary" href="/packs">Explore More Prompts</Link>
        </div>
        <p className="payment-help">This page is safe to reload — purchase state is stored on the server.</p>
      </section>
    );
  }

  if (view.kind === "pending") {
    return (
      <section className="payment-page" aria-live="polite">
        <h1>Payment pending</h1>
        <p className="payment-lede" role="status">Your payment is still processing. We are waiting for the payment provider to confirm.</p>
        {view.packTitle ? <p className="payment-pack">Pack: <strong>{view.packTitle}</strong></p> : null}
        <div className="payment-actions">
          {/* Recheck: same route, fresh request — status comes from the server. */}
          <Link className="payment-primary" href={`/payment/pending?ref=${encodeURIComponent(reference ?? "")}`} prefetch={false}>Check Again</Link>
          {view.packSlug ? <Link className="payment-secondary" href={`/packs/${view.packSlug}`}>Return to Pack</Link> : null}
          <Link className="payment-secondary" href="/packs">Browse Packs</Link>
        </div>
        <p className="payment-help">Premium access is not granted while a payment is pending.</p>
      </section>
    );
  }

  const failed = view.kind === "failed";
  return (
    <section className="payment-page" aria-live="polite">
      <h1>{failed ? "Payment failed" : "Payment cancelled"}</h1>
      <p className="payment-lede" role="status">
        {failed ? "Your payment did not go through. No access was granted." : "Your payment was not completed."}
      </p>
      {view.packTitle ? <p className="payment-pack">Pack: <strong>{view.packTitle}</strong></p> : null}
      <div className="payment-actions">
        <Link className="payment-primary" href="/packs">Try Again</Link>
        {view.packSlug ? <Link className="payment-secondary" href={`/packs/${view.packSlug}`}>Return to Pack</Link> : null}
        <Link className="payment-secondary" href="/packs">Browse Packs</Link>
        <Link className="payment-secondary" href="/explore">Explore Prompts</Link>
      </div>
      <p className="payment-help">
        {failed ? "If a payment method kept failing, another one may work." : "If this was accidental, you can start the payment again at any time."}
      </p>
    </section>
  );
}

/**
 * Shared status screen shell (#31): streams the §41 checking copy while the
 * verified server result resolves beneath it.
 */
export default function PaymentStatusScreen({ route, reference }: { route: RouteName; reference: string | undefined }) {
  return (
    <Suspense fallback={<CheckingStatus />}>
      <StatusBody route={route} reference={reference} />
    </Suspense>
  );
}
