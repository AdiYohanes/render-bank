// @ts-check
/**
 * Checkout submit orchestration for #28. Reuses the accepted attempt key/claim
 * across safe retries (double submit, resume); rotates both only when the
 * existing attempt is terminal, its claim expired, the buyer changes email,
 * or the pack price changed and the buyer reconfirmed. All decisions are
 * presentation-safe: never claim material, email, or database detail.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";

import { checkPackPurchasable, validateBuyerEmail } from "./initialize.mjs";

/**
 * @param {Object} deps
 * @param {null | {id: string, slug: string, title: string, price_minor: number, currency: string}} deps.pack authoritative resolved pack (PUBLISHED), or null when unavailable
 * @param {(attemptKey: string) => Promise<null | {public_reference: string, status: "CREATED"|"PROCESSING"|"SUCCEEDED"|"FAILED"|"CANCELLED"|"EXPIRED", claim_expires_at: string, order_id: string | null, amount_minor: number, currency: string, provider: string}>} deps.findAttemptByKey
 * @param {(input: {buyerEmail: string, packId: string, provider: string, attemptKey: string, checkoutClaim: string}) => Promise<{publicReference: string, claimExpiresAt: string}>} deps.createPurchase accepted create-processing-purchase seam
 * @param {{buyerEmail: string, reconfirmed?: boolean}} deps.input submitted fields
 * @param {{claim: string, attemptKey: string} | null} deps.existingCookie previously persisted pair or null
 */
export async function initializeCheckout({ pack, findAttemptByKey, createPurchase, input, existingCookie }) {
  if (!pack) return { kind: "unavailable" };
  const purchasable = checkPackPurchasable({ slug: pack.slug, title: pack.title, description: "", priceMinor: pack.price_minor, currency: pack.currency });
  if (!purchasable.ok) return { kind: "unavailable" };

  const email = validateBuyerEmail(input.buyerEmail);
  if (!email.ok) return { kind: "invalid-email" };

  // Retry path: an existing live attempt under the same cookie pair resumes it.
  if (existingCookie) {
    const existing = await findAttemptByKey(existingCookie.attemptKey);
    if (existing?.provider === "midtrans") {
      if (existing.status === "SUCCEEDED") return { kind: "redirect-status", reference: existing.public_reference };
      if (existing.amount_minor !== pack.price_minor || existing.currency !== pack.currency) {
        if (!input.reconfirmed) return { kind: "price-changed" };
        return freshSubmit({ pack, createPurchase, email: email.email });
      }
      if (isLive(existing) && existing.claim_expires_at > new Date().toISOString()) {
        return resumeSubmit({ pack, createPurchase, email: email.email, existingCookie });
      }
      // claim expired → rotate below
    }
    // no matching attempt / different provider / expired claim → rotate below
  }

  return freshSubmit({ pack, createPurchase, email: email.email });
}

/**
 * Liveness for transition legality: terminal states never resume.
 * @param {{status: string}} attempt
 */
function isLive(attempt) {
  return ["CREATED", "PROCESSING"].includes(attempt.status);
}

/**
 * @param {{pack: {id: string, slug: string, title: string, price_minor: number, currency: string}, createPurchase: (input: {buyerEmail: string, packId: string, provider: string, attemptKey: string, checkoutClaim: string}) => Promise<{publicReference: string, claimExpiresAt: string}>, email: string, existingCookie: {attemptKey: string, claim: string}}} p
 */
async function resumeSubmit(p) {
  const { pack, createPurchase, email, existingCookie } = p;
  try {
    const row = await createPurchase({
      buyerEmail: email,
      packId: pack.id,
      provider: "midtrans",
      attemptKey: existingCookie.attemptKey,
      checkoutClaim: existingCookie.claim,
    });
    return { kind: "ready", attemptKey: existingCookie.attemptKey, claim: existingCookie.claim, reference: row.publicReference, claimExpiresAt: row.claimExpiresAt, packTitle: pack.title, amountMinor: pack.price_minor, currency: pack.currency, buyerEmail: email, resumed: true };
  } catch (error) {
    // A different attempt key or email against an existing attempt key is
    // refused by the database (ADR-0001) — surface that refusal, never
    // silently rotate into a fresh attempt and orphan the live one.
    if (String((/** @type {Error} */ (error))?.message ?? "").includes("Checkout idempotency key conflict")) {
      return { kind: "email-conflict" };
    }
    // Coincident transient failure: rotate material and create a new attempt.
    return freshSubmit({ pack, createPurchase, email });
  }
}

/**
 * @param {{pack: {id: string, slug: string, title: string, price_minor: number, currency: string}, createPurchase: (input: {buyerEmail: string, packId: string, provider: string, attemptKey: string, checkoutClaim: string}) => Promise<{publicReference: string, claimExpiresAt: string}>, email: string}} p
 */
async function freshSubmit(p) {
  const { pack, createPurchase, email } = p;
  const attemptKey = randomUUID();
  const claim = randomBytes(32).toString("base64url");
  const reference = createHash("sha256").update("reference:").update(attemptKey).update(claim).digest("base64url");
  try {
    const row = await createPurchase({ buyerEmail: email, packId: pack.id, provider: "midtrans", attemptKey, checkoutClaim: claim });
    return { kind: "ready", attemptKey, claim, reference: row.publicReference || reference, claimExpiresAt: row.claimExpiresAt, packTitle: pack.title, amountMinor: pack.price_minor, currency: pack.currency, buyerEmail: email };
  } catch {
    // Presentation-safe refusal: no claim material, email, or database detail.
    return { kind: "checkout-failed" };
  }
}
